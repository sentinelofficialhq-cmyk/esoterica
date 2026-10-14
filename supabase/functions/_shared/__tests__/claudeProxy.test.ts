import { createUsageReader, DAILY_LIMIT, MAX_TOKENS, planRequest, PROXY_MODELS, quotaDay } from '../claudeProxy';

const chat = { model: 'claude-opus-5-5', max_tokens: 64000, system: [{ type: 'text', text: 'You are Jung.' }], messages: [{ role: 'user', content: 'Hi' }], stream: true };
const opts = (premium: boolean, betaHeader: string | null = null) => ({ premium, betaHeader, bodyChars: 200 });

test('free people get Haiku with a capped reply, whatever model the app asked for', () => {
  const p = planRequest(chat, opts(false));
  expect(p).toMatchObject({ ok: true, kind: 'chat', model: PROXY_MODELS.free, body: { model: PROXY_MODELS.free, max_tokens: MAX_TOKENS.chat, stream: true } });
});

test('Premium gets Sonnet with server-side refusal fallback when asked', () => {
  const p = planRequest({ ...chat, fallbacks: 'default' }, opts(true, 'server-side-fallback-2026-07-01, made-up-beta'));
  expect(p).toMatchObject({ ok: true, model: PROXY_MODELS.premium, betas: ['server-side-fallback-2026-07-01'], body: { fallbacks: 'default' } });
});

test('Haiku never gets the fallback beta, and the fallback field is dropped', () => {
  const p = planRequest({ ...chat, fallbacks: 'default' }, opts(false, 'server-side-fallback-2026-07-01'));
  expect(p.ok && p.betas).toEqual([]);
  expect(p.ok && 'fallbacks' in p.body).toBe(false);
});

test('structured extraction is Premium only', () => {
  const extract = { ...chat, stream: undefined, output_config: { effort: 'low', format: { type: 'json_schema', schema: {} } } };
  expect(planRequest(extract, opts(false))).toMatchObject({ ok: false, status: 402, type: 'premium_required' });
  expect(planRequest(extract, opts(true))).toMatchObject({ ok: true, kind: 'extract', body: { max_tokens: MAX_TOKENS.extract } });
  expect(DAILY_LIMIT.free.chat).toBe(3);
});

test('tools, unknown fields, empty and oversized requests are refused', () => {
  expect(planRequest({ ...chat, tools: [] }, opts(true))).toMatchObject({ ok: false, status: 400 });
  expect(planRequest({ ...chat, messages: [] }, opts(true))).toMatchObject({ ok: false, status: 400 });
  expect(planRequest([], opts(true))).toMatchObject({ ok: false, status: 400 });
  expect(planRequest(chat, { premium: true, betaHeader: null, bodyChars: 500_000 })).toMatchObject({ ok: false, status: 413 });
});

test('the quota day is the local date when plausible, else UTC', () => {
  const now = new Date('2026-10-14T23:30:00Z');
  expect(quotaDay('2026-10-15', now)).toBe('2026-10-15');
  expect(quotaDay('2026-10-13', now)).toBe('2026-10-13');
  expect(quotaDay('2026-10-17', now)).toBe('2026-10-14');
  expect(quotaDay('nope', now)).toBe('2026-10-14');
  expect(quotaDay(null, now)).toBe('2026-10-14');
});

test('reads token counts from a stream split at arbitrary points', () => {
  const sse = [
    'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":1200,"output_tokens":1,"cache_read_input_tokens":900,"cache_creation_input_tokens":0}}}\n\n',
    'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello"}}\n\n',
    'event: message_delta\ndata: {"type":"message_delta","usage":{"output_tokens":42}}\n\n',
    ': ping\n\n',
  ].join('');
  const r = createUsageReader();
  for (let i = 0; i < sse.length; i += 7) r.push(sse.slice(i, i + 7));
  expect(r.usage).toEqual({ input: 1200, output: 42, cacheRead: 900, cacheWrite: 0 });
  const j = createUsageReader();
  j.fromJSON({ usage: { input_tokens: 10, output_tokens: 5 } });
  expect(j.usage).toEqual({ input: 10, output: 5, cacheRead: 0, cacheWrite: 0 });
});
