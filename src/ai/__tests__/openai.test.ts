const mockCreateCalls: Record<string, unknown>[] = [];

jest.mock('openai', () => {
  class OpenAI {
    chat = {
      completions: {
        create: async (params: Record<string, unknown>) => {
          mockCreateCalls.push(params);
          const chunks = [
            { choices: [{ delta: { content: 'Good ' } }] },
            { choices: [{ delta: { content: 'evening.' } }] },
            { choices: [], usage: { prompt_tokens: 12, completion_tokens: 3, prompt_tokens_details: { cached_tokens: 5 } } },
          ];
          let i = 0;
          return {
            [Symbol.asyncIterator]: () => ({
              next: async () => (i < chunks.length ? { value: chunks[i++], done: false } : { value: undefined, done: true }),
            }),
          };
        },
        parse: async () => ({ choices: [{ message: { parsed: { notes: [] } } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }),
      },
    };
  }
  return { __esModule: true, default: OpenAI };
});
jest.mock('openai/helpers/zod', () => ({ zodResponseFormat: () => ({ type: 'json_schema' }) }));

import { z } from 'zod';

import { createOpenAIProvider } from '@/ai/openai';

test('streams text and maps history to plain messages', async () => {
  const deltas: string[] = [];
  const res = await createOpenAIProvider('k', 'gpt-test').streamReply({
    system: 'You are Jung.',
    messages: [
      { role: 'user', content: 'Hi', text: 'Hi', status: 'ok' },
      { role: 'assistant', content: 'dropped', text: 'dropped', status: 'stopped' },
      { role: 'user', content: 'Again', text: 'Again' },
    ],
    effort: 'low',
    onText: (d) => deltas.push(d),
  });
  expect(mockCreateCalls[0]).toMatchObject({
    model: 'gpt-test',
    stream: true,
    messages: [
      { role: 'developer', content: 'You are Jung.' },
      { role: 'user', content: 'Hi' },
      { role: 'user', content: 'Again' },
    ],
  });
  expect(deltas.join('')).toBe('Good evening.');
  expect(res.assistant).toMatchObject({ role: 'assistant', content: 'Good evening.', text: 'Good evening.' });
  expect(res.usage).toEqual({ inputTokens: 12, outputTokens: 3, cacheReadTokens: 5, cacheWriteTokens: 0 });
});

test('extract returns parsed output', async () => {
  const res = await createOpenAIProvider('k', 'gpt-test').extract({ system: 's', prompt: 'p', schema: z.object({ notes: z.array(z.string()) }), effort: 'low' });
  expect(res.data).toEqual({ notes: [] });
});
