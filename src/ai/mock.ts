import { ZERO_USAGE, type AIProvider } from '@/ai/types';

type MockOptions = { reply?: (lastUserText: string) => string; delayMs?: number; fail?: boolean };

const FIXTURES: unknown[] = [
  { notes: [{ text: 'Is curious about their dreams', category: 'dreams' }] },
  { symbols: ['water', 'house'], figures: ['shadow'], themes: ['transition'] },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A deterministic, offline stand-in for the Jung AI. Used in tests and in development without a key. */
export function createMockProvider(opts: MockOptions = {}): AIProvider {
  const delayMs = opts.delayMs ?? 15;
  return {
    id: 'mock',
    model: 'mock-jung',
    async streamReply({ messages, signal, onText }) {
      if (opts.fail) throw new Error('Network request failed');
      const last = [...messages].reverse().find((m) => m.role === 'user')?.text ?? '';
      const reply =
        opts.reply?.(last) ??
        `Tell me more about “${last.split(/\s+/).slice(0, 5).join(' ')}”. What do you notice in yourself as you say it?`;
      for (const piece of reply.split(/(\s+)/)) {
        if (signal?.aborted) {
          const err = new Error('Request was aborted.');
          err.name = 'AbortError';
          throw err;
        }
        onText(piece);
        if (delayMs) await wait(delayMs);
      }
      return {
        assistant: { role: 'assistant', content: reply, text: reply, status: 'ok' },
        usage: { inputTokens: 10, outputTokens: reply.length, cacheReadTokens: 0, cacheWriteTokens: 0 },
        refused: false,
      };
    },
    async extract({ schema }) {
      for (const f of FIXTURES) {
        const parsed = schema.safeParse(f);
        if (parsed.success) return { data: parsed.data, usage: ZERO_USAGE };
      }
      throw new Error('No mock fixture matches this schema');
    },
  };
}
