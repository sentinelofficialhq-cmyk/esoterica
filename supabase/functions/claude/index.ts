// An Anthropic Messages endpoint for the app: POST /functions/v1/claude/v1/messages.
//
// The app's Claude provider points the Anthropic SDK here (baseURL …/functions/v1/claude, the
// person's Supabase session as the bearer token). This function checks who they are, picks their
// model (Haiku for free, Sonnet for Premium), spends one unit of their daily allowance, forwards the
// request with the server's API key, streams the reply straight back, and records token counts.
// Message text is never stored or logged.

import { createClient } from 'npm:@supabase/supabase-js@2';

import { createUsageReader, DAILY_LIMIT, errorBody, planRequest, quotaDay } from '../_shared/claudeProxy.ts';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void } | undefined;

/** The Anthropic SDK sends its own headers from the browser; allow whatever the preflight asks for. */
function cors(req: Request): Record<string, string> {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': req.headers.get('access-control-request-headers') ?? 'authorization, content-type, apikey',
    'access-control-max-age': '86400',
  };
}

const reply = (req: Request, status: number, body: string) =>
  new Response(body, { status, headers: { ...cors(req), 'content-type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== 'POST' || !new URL(req.url).pathname.endsWith('/v1/messages')) {
    return reply(req, 404, errorBody('not_found_error', 'Not found.'));
  }
  if (!ANTHROPIC_KEY) return reply(req, 500, errorBody('api_error', 'The server has no Anthropic API key.'));

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const { data: auth } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (!user) return reply(req, 401, errorBody('authentication_error', 'Sign in again to talk with Jung.'));

  const text = await req.text();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return reply(req, 400, errorBody('invalid_request_error', 'Expected JSON.'));
  }

  const { data: premium } = await admin.rpc('has_premium', { p_user: user.id });
  const plan = planRequest(raw, { premium: premium === true, betaHeader: req.headers.get('anthropic-beta'), bodyChars: text.length });
  if (!plan.ok) return reply(req, plan.status, errorBody(plan.type, plan.message));

  const tier = premium === true ? 'premium' : 'free';
  const day = quotaDay(req.headers.get('x-esoterica-day'), new Date());
  const { data: used, error: quotaError } = await admin.rpc('claim_quota', {
    p_user: user.id,
    p_day: day,
    p_kind: plan.kind,
    p_limit: DAILY_LIMIT[tier][plan.kind],
  });
  if (quotaError) return reply(req, 500, errorBody('api_error', 'Could not check your daily allowance.'));
  // 402 rather than 429: the SDK retries 429s, and this one won't clear until tomorrow.
  if (used === null) {
    return tier === 'free'
      ? reply(req, 402, errorBody('free_limit_reached', 'You have used today’s free messages with Jung.'))
      : reply(req, 402, errorBody('daily_cap_reached', 'You have reached today’s message limit. It resets tomorrow.'));
  }
  const release = () => admin.rpc('release_quota', { p_user: user.id, p_day: day, p_kind: plan.kind });

  let upstream: Response;
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        ...(plan.betas.length ? { 'anthropic-beta': plan.betas.join(',') } : {}),
      },
      body: JSON.stringify(plan.body),
      signal: req.signal,
    });
  } catch {
    await release();
    return reply(req, 502, errorBody('api_error', 'Could not reach the AI service.'));
  }
  if (!upstream.ok) {
    await release();
    return new Response(upstream.body, { status: upstream.status, headers: { ...cors(req), 'content-type': upstream.headers.get('content-type') ?? 'application/json' } });
  }

  const usage = createUsageReader();
  const record = () =>
    admin.rpc('record_usage', {
      p_user: user.id,
      p_day: day,
      p_model: plan.model,
      p_input: usage.usage.input,
      p_output: usage.usage.output,
      p_cache_read: usage.usage.cacheRead,
      p_cache_write: usage.usage.cacheWrite,
    });

  if (plan.body.stream === true && upstream.body) {
    const decoder = new TextDecoder();
    const tap = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, out) {
        usage.push(decoder.decode(chunk, { stream: true }));
        out.enqueue(chunk);
      },
      flush() {
        // Keep the worker alive until the counts are saved, after the reply has gone out.
        const done = Promise.resolve(record());
        if (typeof EdgeRuntime !== 'undefined') EdgeRuntime.waitUntil(done);
      },
    });
    return new Response(upstream.body.pipeThrough(tap), {
      status: 200,
      headers: { ...cors(req), 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache' },
    });
  }

  const json = await upstream.json();
  usage.fromJSON(json);
  await record();
  return reply(req, 200, JSON.stringify(json));
});
