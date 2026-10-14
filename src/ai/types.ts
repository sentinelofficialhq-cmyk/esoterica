import type { z } from 'zod';

export type Effort = 'low' | 'medium' | 'high';
export type ProviderId = 'anthropic' | 'openai' | 'mock';

/** One chat turn. `content` is provider-native (Anthropic content blocks, or plain text); `text` is for display. */
export type StoredMessage = { role: 'user' | 'assistant'; content: unknown; text: string; status?: 'ok' | 'failed' | 'stopped' };

export type Usage = { inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number };

export type ReplyResult = { assistant: StoredMessage; usage: Usage; refused: boolean; strippedHistory?: StoredMessage[] };

export interface AIProvider {
  readonly id: ProviderId;
  readonly model: string;
  /** `messages` ends with the new user turn. */
  streamReply(req: {
    system: string;
    messages: StoredMessage[];
    effort: Effort;
    signal?: AbortSignal;
    onText: (delta: string) => void;
  }): Promise<ReplyResult>;
  extract<T>(req: { system: string; prompt: string; schema: z.ZodType<T>; effort: Effort }): Promise<{ data: T; usage: Usage }>;
}

export const ZERO_USAGE: Usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
