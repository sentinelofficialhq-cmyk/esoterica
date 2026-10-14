import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { Platform } from 'react-native';

import { MODELS } from '@/ai/models';
import type { AIProvider, Effort, StoredMessage, Usage } from '@/ai/types';

type StreamParams = Parameters<Anthropic['beta']['messages']['stream']>[0];
type MessageParam = StreamParams['messages'][number];
type RawUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
};
type Block = { type: string; text?: string };

const toUsage = (u: RawUsage): Usage => ({
  inputTokens: u.input_tokens,
  outputTokens: u.output_tokens,
  cacheReadTokens: u.cache_read_input_tokens ?? 0,
  cacheWriteTokens: u.cache_creation_input_tokens ?? 0,
});

const textOf = (content: Block[]) =>
  content
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('');

/** Failed and stopped turns are shown in the UI but never sent; everything else is replayed exactly as stored. */
const sendable = (messages: StoredMessage[]): MessageParam[] =>
  messages
    .filter((m) => m.status !== 'failed' && m.status !== 'stopped')
    .map((m) => ({ role: m.role, content: m.content as MessageParam['content'] }));

/** One-time recovery for a preserved-thinking 400: drop thinking blocks from history, keep text. */
export const stripThinking = (messages: StoredMessage[]): StoredMessage[] =>
  messages.map((m) =>
    m.role === 'assistant' && Array.isArray(m.content)
      ? { ...m, content: (m.content as Block[]).filter((b) => b.type !== 'thinking' && b.type !== 'redacted_thinking') }
      : m,
  );

export function createAnthropicProvider(apiKey: string, model: string): AIProvider {
  // Browsers are a supported SDK runtime with this flag (Esoterica's iPhone build is the web app).
  // On native (Expo Go) the global fetch is Expo's streaming fetch.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const fallback = MODELS[model]?.serverFallback ?? false;

  const params = (system: string, messages: StoredMessage[], effort: Effort, maxTokens = 64000): StreamParams => ({
    model,
    max_tokens: maxTokens,
    system: [{ type: 'text', text: system }],
    messages: sendable(messages),
    cache_control: { type: 'ephemeral' },
    output_config: { effort },
    ...(fallback ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
  });

  async function once(system: string, messages: StoredMessage[], effort: Effort, signal: AbortSignal | undefined, onText: (d: string) => void) {
    try {
      const stream = client.beta.messages.stream(params(system, messages, effort), { signal });
      stream.on('text', (delta) => onText(delta));
      return await stream.finalMessage();
    } catch (err) {
      if (Platform.OS !== 'web' && !(err instanceof Anthropic.APIError) && !signal?.aborted) {
        // Native runtime without streaming support: fall back to one non-streamed reply.
        const msg = await client.beta.messages.create({ ...params(system, messages, effort, 16000), stream: false }, { signal });
        onText(textOf(msg.content as Block[]));
        return msg;
      }
      throw err;
    }
  }

  return {
    id: 'anthropic',
    model,
    async streamReply({ system, messages, effort, signal, onText }) {
      let final;
      let strippedHistory: StoredMessage[] | undefined;
      try {
        final = await once(system, messages, effort, signal, onText);
      } catch (err) {
        if (!(err instanceof Anthropic.BadRequestError && /thinking/i.test(err.message))) throw err;
        strippedHistory = stripThinking(messages);
        final = await once(system, strippedHistory, effort, signal, onText);
      }
      return {
        assistant: { role: 'assistant', content: final.content, text: textOf(final.content as Block[]), status: 'ok' },
        usage: toUsage(final.usage),
        refused: final.stop_reason === 'refusal',
        strippedHistory,
      };
    },
    async extract({ system, prompt, schema, effort }) {
      const res = await client.messages.parse({
        model,
        max_tokens: 16000,
        system,
        messages: [{ role: 'user', content: prompt }],
        output_config: { effort, format: zodOutputFormat(schema) },
      });
      if (!res.parsed_output) throw new Error('Could not read structured output');
      return { data: res.parsed_output as never, usage: toUsage(res.usage) };
    },
  };
}
