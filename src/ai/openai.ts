import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

import type { AIProvider, StoredMessage, Usage } from '@/ai/types';

type RawUsage = { prompt_tokens: number; completion_tokens: number; prompt_tokens_details?: { cached_tokens?: number } | null };

const toUsage = (u: RawUsage | null | undefined): Usage => ({
  inputTokens: u?.prompt_tokens ?? 0,
  outputTokens: u?.completion_tokens ?? 0,
  cacheReadTokens: u?.prompt_tokens_details?.cached_tokens ?? 0,
  cacheWriteTokens: 0,
});

const sendable = (messages: StoredMessage[]) =>
  messages.filter((m) => m.status !== 'failed' && m.status !== 'stopped').map((m) => ({ role: m.role, content: m.text }));

/**
 * OpenAI via Chat Completions. History is plain text. No effort setting is sent,
 * because the model is whatever the user types and not every model accepts one.
 */
export function createOpenAIProvider(apiKey: string, model: string): AIProvider {
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  return {
    id: 'openai',
    model,
    async streamReply({ system, messages, signal, onText }) {
      const stream = await client.chat.completions.create(
        {
          model,
          stream: true,
          stream_options: { include_usage: true },
          messages: [{ role: 'developer', content: system }, ...sendable(messages)],
        },
        { signal },
      );
      let text = '';
      let usage: RawUsage | null | undefined;
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
          text += delta;
          onText(delta);
        }
        if (chunk.usage) usage = chunk.usage;
      }
      return { assistant: { role: 'assistant', content: text, text, status: 'ok' }, usage: toUsage(usage), refused: false };
    },
    async extract({ system, prompt, schema }) {
      const completion = await client.chat.completions.parse({
        model,
        messages: [
          { role: 'developer', content: system },
          { role: 'user', content: prompt },
        ],
        response_format: zodResponseFormat(schema, 'result'),
      });
      const parsed = completion.choices[0]?.message.parsed;
      if (!parsed) throw new Error('Could not read structured output');
      return { data: parsed as never, usage: toUsage(completion.usage) };
    },
  };
}
