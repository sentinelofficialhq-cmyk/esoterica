import { createAnthropicProvider } from '@/ai/anthropic';
import { createMockProvider } from '@/ai/mock';
import { createGeminiProvider } from '@/ai/gemini';
import { DEFAULT_GEMINI_MODEL, DEFAULT_MODEL } from '@/ai/models';
import { createOpenAIProvider } from '@/ai/openai';
import type { AIProvider } from '@/ai/types';
import { getKey } from '@/store/secrets';
import type { ProviderChoice } from '@/store/settingsStore';

const PROVIDER_NAMES: Record<string, string> = { anthropic: 'Claude', openai: 'OpenAI', gemini: 'Gemini' };

export class NoKeyError extends Error {
  constructor(provider: string) {
    super(`Add your ${PROVIDER_NAMES[provider] ?? 'Claude'} API key in Settings to talk with Jung.`);
    this.name = 'NoKeyError';
  }
}

type ProviderSettings = { provider: ProviderChoice; anthropicModel: string; openaiModel: string; geminiModel: string };

/** The provider the user picked in Settings, with their key. Throws NoKeyError when no key is stored. */
export async function getProvider(s: ProviderSettings): Promise<AIProvider> {
  if (s.provider === 'mock') return createMockProvider();
  const key = await getKey(s.provider);
  if (!key) throw new NoKeyError(s.provider);
  if (s.provider === 'openai') {
    if (!s.openaiModel.trim()) throw new Error('Choose an OpenAI model name in Settings.');
    return createOpenAIProvider(key, s.openaiModel.trim());
  }
  if (s.provider === 'gemini') return createGeminiProvider(key, s.geminiModel || DEFAULT_GEMINI_MODEL);
  return createAnthropicProvider(key, s.anthropicModel || DEFAULT_MODEL);
}

/** Human-readable message for any AI error. */
export function describeAIError(err: unknown): string {
  if (err instanceof NoKeyError) return err.message;
  const e = err as { status?: number; message?: string; name?: string };
  if (e?.status === 401 || e?.status === 403) return 'Your API key was rejected. Check it in Settings.';
  if (e?.status === 429) return 'Rate limited by the AI provider. Wait a moment and try again.';
  if (e?.status === 529 || (e?.status && e.status >= 500)) return 'The AI service is busy right now. Try again in a moment.';
  if (e?.status === 400) return `The request was rejected: ${e.message ?? 'bad request'}`;
  if (/network|fetch|connection/i.test(e?.message ?? '')) return 'No connection. Check your internet and try again.';
  return e?.message || 'Something went wrong talking to Jung.';
}
