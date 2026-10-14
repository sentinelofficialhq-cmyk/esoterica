import { z } from 'zod';

import type { AIProvider, Effort, StoredMessage, Usage } from '@/ai/types';

const API = 'https://generativelanguage.googleapis.com/v1beta/models';

/** A Gemini content part. Gemini 3 attaches an opaque `thoughtSignature` that must be sent back on later turns. */
export type GeminiPart = { text?: string; thought?: boolean; thoughtSignature?: string };
type Content = { role: 'user' | 'model'; parts: GeminiPart[] };
type RawUsage = { promptTokenCount?: number; candidatesTokenCount?: number; thoughtsTokenCount?: number; cachedContentTokenCount?: number };
type Chunk = {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: RawUsage;
};

/** Answers when the chosen model is overloaded or rate-limited: a different model, so a separate capacity pool and quota. */
export const FALLBACK_MODEL = 'gemini-3.5-flash-lite';
const RETRYABLE = new Set([429, 500, 503]);

const THINKING: Record<Effort, string> = { low: 'LOW', medium: 'MEDIUM', high: 'HIGH' };
const BLOCKED = new Set(['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII', 'RECITATION']);

/** Cached prompt tokens are billed at the cache rate; thinking tokens are billed as output. */
const toUsage = (u: RawUsage | undefined): Usage => {
  const cached = u?.cachedContentTokenCount ?? 0;
  return {
    inputTokens: Math.max(0, (u?.promptTokenCount ?? 0) - cached),
    outputTokens: (u?.candidatesTokenCount ?? 0) + (u?.thoughtsTokenCount ?? 0),
    cacheReadTokens: cached,
    cacheWriteTokens: 0,
  };
};

/** Failed and stopped turns are never sent. Gemini replies are replayed with their signatures; others as text. */
export const toContents = (messages: StoredMessage[]): Content[] =>
  messages
    .filter((m) => m.status !== 'failed' && m.status !== 'stopped')
    .map((m) =>
      m.role === 'assistant'
        ? { role: 'model', parts: m.gemini?.length ? m.gemini : [{ text: m.text }] }
        : { role: 'user', parts: [{ text: typeof m.content === 'string' ? m.content : m.text }] },
    );

/** Thin `fetch` client: the Gemini API only allows `content-type` and `x-goog-api-key` from browsers. */
async function post(apiKey: string, url: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
    signal,
  });
  if (res.ok) return res;
  let message = `Gemini request failed (${res.status})`;
  try {
    const err = (await res.json()) as { error?: { message?: string } };
    if (err.error?.message) message = err.error.message;
  } catch {}
  // Gemini reports a bad key as 400 "API key not valid"; surface it as an auth error.
  const status = res.status === 400 && /api key/i.test(message) ? 401 : res.status;
  throw Object.assign(new Error(message), { status });
}

/** Yields each `data:` payload of a server-sent event stream; reads the whole body where streaming is unsupported. */
async function* sseEvents(res: Response): AsyncGenerator<Chunk> {
  const parse = (block: string) => {
    const data = block
      .split('\n')
      .filter((l) => l.startsWith('data:'))
      .map((l) => l.slice(5).trim())
      .join('');
    return data ? (JSON.parse(data) as Chunk) : null;
  };
  const reader = res.body?.getReader?.();
  if (!reader) {
    for (const block of (await res.text()).split(/\r?\n\r?\n/)) {
      const c = parse(block);
      if (c) yield c;
    }
    return;
  }
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (value) buffer += decoder.decode(value, { stream: !done });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = done ? '' : blocks.pop()!;
    for (const block of blocks) {
      const c = parse(block);
      if (c) yield c;
    }
    if (done) return;
  }
}

const jsonSchemaOf = (schema: z.ZodType<unknown>) => {
  const { $schema: _ignored, ...rest } = z.toJSONSchema(schema) as Record<string, unknown>;
  return rest;
};

/**
 * `model` reads as whichever model is answering: after one fallback the provider stays on FALLBACK_MODEL,
 * so usage and "Connected to…" name the model that actually replied. Signatures from either model are
 * accepted by the other, so a conversation can move between them.
 */
export function createGeminiProvider(apiKey: string, model: string): AIProvider {
  let current = model;
  async function call(method: string, body: unknown, signal?: AbortSignal): Promise<Response> {
    try {
      return await post(apiKey, `${API}/${current}:${method}`, body, signal);
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (current === FALLBACK_MODEL || !status || !RETRYABLE.has(status) || signal?.aborted) throw err;
      current = FALLBACK_MODEL;
      return post(apiKey, `${API}/${current}:${method}`, body, signal);
    }
  }
  const config = (system: string, effort: Effort) => ({
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: { thinkingConfig: { thinkingLevel: THINKING[effort] } },
  });

  return {
    id: 'gemini',
    get model() {
      return current;
    },
    async streamReply({ system, messages, effort, signal, onText }) {
      const res = await call('streamGenerateContent?alt=sse', { ...config(system, effort), contents: toContents(messages) }, signal);
      let text = '';
      let signature: string | undefined;
      let usage: RawUsage | undefined;
      let refused = false;
      for await (const chunk of sseEvents(res)) {
        if (chunk.promptFeedback?.blockReason) refused = true;
        const candidate = chunk.candidates?.[0];
        if (candidate?.finishReason && BLOCKED.has(candidate.finishReason)) refused = true;
        for (const part of candidate?.content?.parts ?? []) {
          if (part.thoughtSignature) signature = part.thoughtSignature;
          if (part.text && !part.thought) {
            text += part.text;
            onText(part.text);
          }
        }
        if (chunk.usageMetadata) usage = chunk.usageMetadata;
      }
      const gemini: GeminiPart[] = [{ text, ...(signature ? { thoughtSignature: signature } : {}) }];
      return { assistant: { role: 'assistant', content: text, text, gemini, status: 'ok' }, usage: toUsage(usage), refused };
    },
    async extract({ system, prompt, schema, effort }) {
      const res = await call('generateContent', {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          thinkingConfig: { thinkingLevel: THINKING[effort] },
          responseMimeType: 'application/json',
          responseJsonSchema: jsonSchemaOf(schema),
        },
      });
      const body = (await res.json()) as Chunk;
      const raw = (body.candidates?.[0]?.content?.parts ?? [])
        .filter((p) => !p.thought)
        .map((p) => p.text ?? '')
        .join('');
      if (!raw) throw new Error('Could not read structured output');
      return { data: schema.parse(JSON.parse(raw)), usage: toUsage(body.usageMetadata) };
    },
  };
}
