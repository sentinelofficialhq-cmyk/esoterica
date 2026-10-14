// Rules for the `claude` function: which model a person gets, what they may send, and their
// daily allowance. Plain TypeScript with no Deno or Node APIs, so the app's Jest suite tests it.

export type Kind = 'chat' | 'extract';

export const PROXY_MODELS = { free: 'claude-haiku-5-5', premium: 'claude-sonnet-5-5' } as const;

/** Messages per day. Free people get 3 conversations' worth of Jung; Premium is capped only against abuse. */
export const DAILY_LIMIT: Record<'free' | 'premium', Record<Kind, number>> = {
  free: { chat: 3, extract: 0 },
  premium: { chat: 300, extract: 300 },
};

/** Longest reply the server allows, by kind. */
export const MAX_TOKENS: Record<Kind, number> = { chat: 8000, extract: 4000 };

/** Betas a request may ask for. Server-side refusal fallback only on models that support it. */
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';
const FALLBACK_MODELS = new Set<string>([PROXY_MODELS.premium]);
const ALLOWED_KEYS = new Set(['model', 'max_tokens', 'system', 'messages', 'stream', 'cache_control', 'output_config', 'fallbacks']);
const MAX_BODY_CHARS = 400_000;

export type Planned =
  | { ok: true; kind: Kind; model: string; body: Record<string, unknown>; betas: string[] }
  | { ok: false; status: number; type: string; message: string };

const refuse = (status: number, type: string, message: string): Planned => ({ ok: false, status, type, message });

/**
 * Checks a Messages API request from the app and rewrites it for this person: their model, a capped
 * reply length, and only the fields and betas the app uses (no tools, no other models).
 */
export function planRequest(raw: unknown, opts: { premium: boolean; betaHeader: string | null; bodyChars: number }): Planned {
  if (opts.bodyChars > MAX_BODY_CHARS) return refuse(413, 'request_too_large', 'This conversation is too long to send.');
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return refuse(400, 'invalid_request_error', 'Expected a JSON object.');
  const body = raw as Record<string, unknown>;
  for (const key of Object.keys(body)) {
    if (!ALLOWED_KEYS.has(key)) return refuse(400, 'invalid_request_error', `Field "${key}" is not allowed.`);
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) return refuse(400, 'invalid_request_error', 'messages is required.');

  const outputConfig = body.output_config as { format?: unknown } | undefined;
  const kind: Kind = outputConfig && typeof outputConfig === 'object' && outputConfig.format ? 'extract' : 'chat';
  const tier = opts.premium ? 'premium' : 'free';
  if (DAILY_LIMIT[tier][kind] === 0) return refuse(402, 'premium_required', 'This needs Esoterica Premium.');

  const model = PROXY_MODELS[tier];
  const fallbackOk = FALLBACK_MODELS.has(model);
  const requested = (opts.betaHeader ?? '')
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);
  const betas = requested.filter((b) => b === FALLBACK_BETA && fallbackOk);
  const asked = typeof body.max_tokens === 'number' && body.max_tokens > 0 ? body.max_tokens : MAX_TOKENS[kind];

  const next: Record<string, unknown> = { ...body, model, max_tokens: Math.min(asked, MAX_TOKENS[kind]) };
  if (!betas.includes(FALLBACK_BETA)) delete next.fallbacks;
  return { ok: true, kind, model, body: next, betas };
}

/** The person's local date (sent by the app) when it is within a day of the server's, else the server's UTC date. */
export function quotaDay(clientDay: string | null, now: Date): string {
  const utc = now.toISOString().slice(0, 10);
  if (!clientDay || !/^\d{4}-\d{2}-\d{2}$/.test(clientDay)) return utc;
  const diff = Math.abs(Date.parse(`${clientDay}T00:00:00Z`) - Date.parse(`${utc}T00:00:00Z`));
  return diff <= 86_400_000 ? clientDay : utc;
}

export type TokenCount = { input: number; output: number; cacheRead: number; cacheWrite: number };

type RawUsage = { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number | null; cache_creation_input_tokens?: number | null };

const addUsage = (into: TokenCount, u: RawUsage | undefined) => {
  if (!u) return;
  if (typeof u.input_tokens === 'number') into.input = u.input_tokens;
  if (typeof u.output_tokens === 'number') into.output = u.output_tokens;
  if (typeof u.cache_read_input_tokens === 'number') into.cacheRead = u.cache_read_input_tokens;
  if (typeof u.cache_creation_input_tokens === 'number') into.cacheWrite = u.cache_creation_input_tokens;
};

/**
 * Reads token counts out of a streamed reply as it passes through: message_start carries the input
 * counts, and each message_delta the running output count.
 */
export function createUsageReader() {
  const usage: TokenCount = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  let buffer = '';
  return {
    push(chunk: string) {
      buffer += chunk;
      let end = buffer.indexOf('\n');
      while (end !== -1) {
        const line = buffer.slice(0, end).trim();
        buffer = buffer.slice(end + 1);
        if (line.startsWith('data:')) {
          try {
            const event = JSON.parse(line.slice(5)) as { type?: string; message?: { usage?: RawUsage }; usage?: RawUsage };
            if (event.type === 'message_start') addUsage(usage, event.message?.usage);
            if (event.type === 'message_delta') addUsage(usage, event.usage);
          } catch {
            // Not JSON (a keep-alive or a split line): skip it.
          }
        }
        end = buffer.indexOf('\n');
      }
    },
    /** For a reply that was not streamed. */
    fromJSON(json: { usage?: RawUsage }) {
      addUsage(usage, json.usage);
    },
    get usage() {
      return usage;
    },
  };
}

/** An error in the shape the Anthropic SDK understands. */
export const errorBody = (type: string, message: string) => JSON.stringify({ type: 'error', error: { type, message } });
