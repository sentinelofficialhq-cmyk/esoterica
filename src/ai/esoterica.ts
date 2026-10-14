import { createAnthropicProvider } from '@/ai/anthropic';
import type { AIProvider } from '@/ai/types';
import { backendConfig, ensureSession, hasBackend } from '@/backend/supabase';
import { todayLocal } from '@/lib/date';

/** The server picks the model (Haiku for free, Sonnet for Premium); this name only labels the conversation. */
export const HOSTED_MODEL = 'esoterica';

export class HostedUnavailableError extends Error {
  constructor() {
    super(hasBackend() ? 'Jung can’t be reached right now. Check your connection and try again.' : 'Jung isn’t connected in this build. Add your own API key in Settings → Advanced.');
    this.name = 'HostedUnavailableError';
  }
}

/** Raised by the server when today's free messages are used up. */
export class FreeLimitError extends Error {
  constructor(message = 'You have used today’s free messages with Jung.') {
    super(message);
    this.name = 'FreeLimitError';
  }
}

/** Jung through Esoterica's server: signs in with the person's session; no API key on the device. */
export async function createEsotericaProvider(): Promise<AIProvider> {
  const session = await ensureSession();
  if (!session) throw new HostedUnavailableError();
  const { url, key } = backendConfig();
  return createAnthropicProvider(null, HOSTED_MODEL, {
    id: 'esoterica',
    baseURL: `${url}/functions/v1/claude`,
    authToken: session.access_token,
    // The local date keeps the free allowance on the person's own midnight.
    headers: { apikey: key, 'x-esoterica-day': todayLocal() },
    serverFallback: true,
  });
}

/** The server's "out of free messages" answer, as the Anthropic SDK reports it. */
export function isFreeLimit(err: unknown): boolean {
  if (err instanceof FreeLimitError) return true;
  const e = err as { status?: number; error?: { error?: { type?: string } } };
  return e?.status === 402 && e.error?.error?.type === 'free_limit_reached';
}
