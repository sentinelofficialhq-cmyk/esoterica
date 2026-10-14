const mockStreamCalls: Record<string, unknown>[] = [];
const mockParseCalls: Record<string, unknown>[] = [];
let mockStreamImpl: (params: Record<string, unknown>) => unknown;

jest.mock('@anthropic-ai/sdk', () => {
  class APIError extends Error {}
  class BadRequestError extends APIError {}
  class Anthropic {
    static APIError = APIError;
    static BadRequestError = BadRequestError;
    beta = {
      messages: {
        stream: (params: Record<string, unknown>) => {
          mockStreamCalls.push(params);
          return mockStreamImpl(params);
        },
      },
    };
    messages = {
      parse: async (params: Record<string, unknown>) => {
        mockParseCalls.push(params);
        return { parsed_output: { notes: [] }, usage: { input_tokens: 3, output_tokens: 2 } };
      },
    };
  }
  return { __esModule: true, default: Anthropic };
});
jest.mock('@anthropic-ai/sdk/helpers/zod', () => ({ zodOutputFormat: () => ({ type: 'json_schema' }) }));

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

import { createAnthropicProvider, stripThinking } from '@/ai/anthropic';
import type { StoredMessage } from '@/ai/types';

const FINAL = {
  content: [
    { type: 'thinking', thinking: '', signature: 'sig-1' },
    { type: 'text', text: 'Hello' },
  ],
  usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 4, cache_creation_input_tokens: 0 },
  stop_reason: 'end_turn',
};

const okStream = (final: unknown = FINAL) => ({
  on: (event: string, cb: (d: string) => void) => {
    if (event === 'text') {
      cb('Hel');
      cb('lo');
    }
  },
  finalMessage: async () => final,
});

const history: StoredMessage[] = [
  { role: 'user', content: 'Hi', text: 'Hi', status: 'ok' },
  { role: 'assistant', content: [{ type: 'thinking', thinking: '', signature: 's0' }, { type: 'text', text: 'Hello there' }], text: 'Hello there', status: 'ok' },
  { role: 'user', content: 'lost message', text: 'lost message', status: 'failed' },
  { role: 'assistant', content: 'half a reply', text: 'half a reply', status: 'stopped' },
  { role: 'user', content: 'Tell me about my dream', text: 'Tell me about my dream', status: 'ok' },
];

beforeEach(() => {
  mockStreamCalls.length = 0;
  mockParseCalls.length = 0;
  mockStreamImpl = () => okStream();
});

test('Opus request: fallbacks, caching, effort, append-only messages', async () => {
  const deltas: string[] = [];
  const res = await createAnthropicProvider('test-key', 'claude-opus-5-5').streamReply({
    system: 'You are Jung.',
    messages: history,
    effort: 'low',
    onText: (d) => deltas.push(d),
  });
  const params = mockStreamCalls[0];
  expect(params).toMatchObject({
    model: 'claude-opus-5-5',
    max_tokens: 64000,
    cache_control: { type: 'ephemeral' },
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [{ type: 'text', text: 'You are Jung.' }],
  });
  expect(params.thinking).toBeUndefined();
  expect(params.messages).toEqual([
    { role: 'user', content: 'Hi' },
    { role: 'assistant', content: history[1].content },
    { role: 'user', content: 'Tell me about my dream' },
  ]);
  expect(deltas.join('')).toBe('Hello');
  expect(res.assistant.text).toBe('Hello');
  expect(res.assistant.content).toEqual(FINAL.content); // thinking block kept for replay
  expect(res.usage).toEqual({ inputTokens: 10, outputTokens: 5, cacheReadTokens: 4, cacheWriteTokens: 0 });
  expect(res.refused).toBe(false);
});

test('Haiku has no server-side fallback', async () => {
  await createAnthropicProvider('k', 'claude-haiku-5-5').streamReply({ system: 's', messages: history, effort: 'low', onText: () => {} });
  expect(mockStreamCalls[0]).not.toHaveProperty('betas');
  expect(mockStreamCalls[0]).not.toHaveProperty('fallbacks');
});

test('preserved-thinking 400 → strip thinking once and retry', async () => {
  let calls = 0;
  mockStreamImpl = () => {
    calls += 1;
    // The mocked class takes just a message (the real one takes status, body, message, headers).
    const BadRequest = Anthropic.BadRequestError as unknown as new (message: string) => Error;
    if (calls === 1) throw new BadRequest('messages.1.content.0: Invalid `signature` in `thinking` block.');
    return okStream();
  };
  const res = await createAnthropicProvider('k', 'claude-opus-5-5').streamReply({ system: 's', messages: history, effort: 'low', onText: () => {} });
  const retried = mockStreamCalls[1].messages as { content: unknown }[];
  expect(JSON.stringify(retried)).not.toContain('"thinking"');
  expect(res.strippedHistory?.[1].content).toEqual([{ type: 'text', text: 'Hello there' }]);
  expect(stripThinking(history)[1].text).toBe('Hello there');
});

test('refusals are reported', async () => {
  mockStreamImpl = () => okStream({ ...FINAL, content: [], stop_reason: 'refusal' });
  const res = await createAnthropicProvider('k', 'claude-opus-5-5').streamReply({ system: 's', messages: history, effort: 'low', onText: () => {} });
  expect(res.refused).toBe(true);
});

test('structured extraction uses messages.parse', async () => {
  const res = await createAnthropicProvider('k', 'claude-opus-5-5').extract({
    system: 's',
    prompt: 'p',
    schema: z.object({ notes: z.array(z.string()) }),
    effort: 'low',
  });
  expect(res.data).toEqual({ notes: [] });
  expect(mockParseCalls[0]).toMatchObject({ model: 'claude-opus-5-5', output_config: { effort: 'low', format: { type: 'json_schema' } } });
});
