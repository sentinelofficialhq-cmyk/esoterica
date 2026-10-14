import { z } from 'zod';

import { createGeminiProvider, FALLBACK_MODEL, toContents } from '@/ai/gemini';

const sse = (chunks: unknown[]) => chunks.map((c) => `data: ${JSON.stringify(c)}\r\n\r\n`).join('');

/** A Response-like object whose body streams `text` in small pieces, split mid-event. */
function streamed(text: string) {
  const bytes = new TextEncoder().encode(text);
  let i = 0;
  return {
    ok: true,
    status: 200,
    body: {
      getReader: () => ({
        read: async () => (i < bytes.length ? { value: bytes.slice(i, (i += 7)), done: false } : { value: undefined, done: true }),
      }),
    },
  };
}

const calls: { url: string; init: RequestInit }[] = [];
let next: unknown;
beforeEach(() => {
  calls.length = 0;
  global.fetch = jest.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return next;
  }) as never;
});

test('streams text, keeps the thought signature and maps usage', async () => {
  next = streamed(
    sse([
      { candidates: [{ content: { role: 'model', parts: [{ text: 'Good ' }] } }] },
      { candidates: [{ content: { role: 'model', parts: [{ text: 'evening.', thoughtSignature: 'sig-1' }] }, finishReason: 'STOP' }] },
      { usageMetadata: { promptTokenCount: 100, cachedContentTokenCount: 40, candidatesTokenCount: 5, thoughtsTokenCount: 20 } },
    ]),
  );
  const deltas: string[] = [];
  const res = await createGeminiProvider('key-1', 'gemini-3.8-flash').streamReply({
    system: 'You are Jung.',
    messages: [
      { role: 'user', content: 'Hi', text: 'Hi', status: 'ok' },
      { role: 'assistant', content: 'dropped', text: 'dropped', status: 'stopped' },
      { role: 'user', content: 'Again', text: 'Again' },
    ],
    effort: 'medium',
    onText: (d) => deltas.push(d),
  });

  expect(calls[0].url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:streamGenerateContent?alt=sse');
  expect(calls[0].init.headers).toEqual({ 'content-type': 'application/json', 'x-goog-api-key': 'key-1' });
  expect(JSON.parse(calls[0].init.body as string)).toEqual({
    systemInstruction: { parts: [{ text: 'You are Jung.' }] },
    generationConfig: { thinkingConfig: { thinkingLevel: 'MEDIUM' } },
    contents: [
      { role: 'user', parts: [{ text: 'Hi' }] },
      { role: 'user', parts: [{ text: 'Again' }] },
    ],
  });
  expect(deltas.join('')).toBe('Good evening.');
  expect(res.assistant).toEqual({
    role: 'assistant',
    content: 'Good evening.',
    text: 'Good evening.',
    gemini: [{ text: 'Good evening.', thoughtSignature: 'sig-1' }],
    status: 'ok',
  });
  expect(res.usage).toEqual({ inputTokens: 60, outputTokens: 25, cacheReadTokens: 40, cacheWriteTokens: 0 });
  expect(res.refused).toBe(false);
});

test('replays Gemini replies with signatures and other providers’ replies as text', () => {
  expect(
    toContents([
      { role: 'user', content: 'Today: personal day 3\n\nHello', text: 'Hello' },
      { role: 'assistant', content: 'A', text: 'A', gemini: [{ text: 'A', thoughtSignature: 's' }] },
      { role: 'user', content: [{ type: 'text', text: 'x' }], text: 'Block content' },
      { role: 'assistant', content: [{ type: 'text', text: 'Claude reply' }], text: 'Claude reply' },
    ]),
  ).toEqual([
    { role: 'user', parts: [{ text: 'Today: personal day 3\n\nHello' }] },
    { role: 'model', parts: [{ text: 'A', thoughtSignature: 's' }] },
    { role: 'user', parts: [{ text: 'Block content' }] },
    { role: 'model', parts: [{ text: 'Claude reply' }] },
  ]);
});

test('a blocked reply is reported as refused; non-streaming runtimes read the whole body', async () => {
  const body = sse([{ promptFeedback: { blockReason: 'SAFETY' }, usageMetadata: { promptTokenCount: 9 } }]);
  next = { ok: true, status: 200, body: null, text: async () => body };
  const res = await createGeminiProvider('k', 'gemini-3.6-flash').streamReply({
    system: 's',
    messages: [{ role: 'user', content: 'x', text: 'x' }],
    effort: 'low',
    onText: () => {},
  });
  expect(res.refused).toBe(true);
  expect(res.assistant.text).toBe('');
});

test('an invalid key surfaces as a 401 so Settings says the key was rejected', async () => {
  next = { ok: false, status: 400, json: async () => ({ error: { code: 400, message: 'API key not valid. Please pass a valid API key.' } }) };
  await expect(
    createGeminiProvider('bad', 'gemini-3.8-flash').streamReply({ system: 's', messages: [], effort: 'low', onText: () => {} }),
  ).rejects.toMatchObject({ status: 401 });
});

test('extract asks for JSON matching the schema and validates it', async () => {
  next = {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: '{"notes":["Dreams of water"]}' }] } }],
      usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 4 },
    }),
  };
  const schema = z.object({ notes: z.array(z.string()) });
  const { data, usage } = await createGeminiProvider('k', 'gemini-3.8-flash').extract({ system: 'Take notes', prompt: 'transcript', schema, effort: 'low' });
  expect(data).toEqual({ notes: ['Dreams of water'] });
  expect(usage.outputTokens).toBe(4);
  const body = JSON.parse(calls[0].init.body as string);
  expect(calls[0].url).toMatch(/:generateContent$/);
  expect(body.generationConfig.responseMimeType).toBe('application/json');
  expect(body.generationConfig.responseJsonSchema).toMatchObject({ type: 'object', properties: { notes: { type: 'array' } } });
  expect(body.generationConfig.responseJsonSchema.$schema).toBeUndefined();
});

test('an overloaded model falls back to Flash-Lite once, and the provider reports the model that answered', async () => {
  const overloaded = { ok: false, status: 503, json: async () => ({ error: { code: 503, message: 'This model is currently experiencing high demand.' } }) };
  const responses = [overloaded, streamed(sse([{ candidates: [{ content: { parts: [{ text: 'Ready.' }] } }] }]))];
  global.fetch = jest.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return responses.shift();
  }) as never;
  const p = createGeminiProvider('k', 'gemini-3.8-flash');
  const res = await p.streamReply({ system: 's', messages: [{ role: 'user', content: 'x', text: 'x' }], effort: 'low', onText: () => {} });
  expect(res.assistant.text).toBe('Ready.');
  expect(calls.map((c) => c.url.split('/').pop())).toEqual([
    'gemini-3.8-flash:streamGenerateContent?alt=sse',
    `${FALLBACK_MODEL}:streamGenerateContent?alt=sse`,
  ]);
  expect(p.model).toBe(FALLBACK_MODEL);
});

test('other errors, and errors from the fallback model itself, are not retried', async () => {
  next = { ok: false, status: 503, json: async () => ({ error: { message: 'busy' } }) };
  const lite = createGeminiProvider('k', FALLBACK_MODEL);
  await expect(lite.streamReply({ system: 's', messages: [], effort: 'low', onText: () => {} })).rejects.toMatchObject({ status: 503 });
  expect(calls).toHaveLength(1);
  next = { ok: false, status: 403, json: async () => ({ error: { message: 'Permission denied' } }) };
  await expect(createGeminiProvider('k', 'gemini-3.8-flash').streamReply({ system: 's', messages: [], effort: 'low', onText: () => {} })).rejects.toMatchObject({ status: 403 });
  expect(calls).toHaveLength(2);
});
