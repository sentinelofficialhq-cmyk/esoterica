import type { z } from 'zod';

export type Effort = 'low' | 'medium' | 'high';
/** 'esoterica' is Jung as hosted by Esoterica's server; the others use the person's own API key. */
export type ProviderId = 'esoterica' | 'anthropic' | 'openai' | 'gemini' | 'mock';

/** One chat turn. `content` is provider-native (Anthropic content blocks, or plain text); `text` is for display. */
export type StoredMessage = {
  role: 'user' | 'assistant';
  content: unknown;
  text: string;
  status?: 'ok' | 'failed' | 'stopped';
  /** Gemini replies only: the reply's native parts, kept so its thought signature can be sent back. */
  gemini?: { text?: string; thought?: boolean; thoughtSignature?: string }[];
};

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
