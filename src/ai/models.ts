import type { Effort, Usage } from '@/ai/types';
import type { ChatDepth } from '@/store/settingsStore';

export type ModelInfo = {
  label: string;
  /** Prices in USD per million tokens. Haiku cache prices are estimates. */
  inPerM: number;
  outPerM: number;
  cacheReadPerM: number;
  cacheWritePerM: number;
  /** Server-side refusal fallback (`fallbacks: "default"`) is available for this model. */
  serverFallback: boolean;
};

export const DEFAULT_MODEL = 'claude-opus-5-5';

export const MODELS: Record<string, ModelInfo> = {
  'claude-opus-5-5': { label: 'Claude Opus 5.5 (default)', inPerM: 4, outPerM: 20, cacheReadPerM: 0.2, cacheWritePerM: 5, serverFallback: true },
  'claude-sonnet-5-5': { label: 'Claude Sonnet 5.5 (about half the cost)', inPerM: 2, outPerM: 10, cacheReadPerM: 0.2, cacheWritePerM: 2.5, serverFallback: true },
  'claude-haiku-5-5': { label: 'Claude Haiku 5.5 (cheapest)', inPerM: 0.1, outPerM: 0.5, cacheReadPerM: 0.01, cacheWritePerM: 0.125, serverFallback: false },
  'claude-fable-5-1': { label: 'Claude Fable 5.1 (most capable, priciest)', inPerM: 10, outPerM: 50, cacheReadPerM: 0.25, cacheWritePerM: 12.5, serverFallback: true },
};

export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

/**
 * Gemini models offered in Settings (Standard paid tier). Google lists the 3.8 and 3.6 Flash rates as valid
 * through 31 Dec 2026, doubling on 1 Jan 2027; update these then. Gemini has a free tier, where cost is $0.
 */
export const GEMINI_MODELS: Record<string, ModelInfo> = {
  'gemini-3.8-flash': { label: 'Gemini 3.8 Flash (default)', inPerM: 0.75, outPerM: 3.75, cacheReadPerM: 0.075, cacheWritePerM: 0, serverFallback: false },
  'gemini-3.6-flash': { label: 'Gemini 3.6 Flash', inPerM: 0.75, outPerM: 3.75, cacheReadPerM: 0.075, cacheWritePerM: 0, serverFallback: false },
  'gemini-3.5-flash-lite': { label: 'Gemini 3.5 Flash-Lite (cheaper)', inPerM: 0.3, outPerM: 2.5, cacheReadPerM: 0.03, cacheWritePerM: 0, serverFallback: false },
  'gemini-3.1-flash-lite': { label: 'Gemini 3.1 Flash-Lite (cheapest)', inPerM: 0.25, outPerM: 1.5, cacheReadPerM: 0.025, cacheWritePerM: 0, serverFallback: false },
};

/** Price and label for any known Claude or Gemini model. */
export const modelInfo = (model: string): ModelInfo | undefined => MODELS[model] ?? GEMINI_MODELS[model];

export function costUSD(model: string, u: Usage): number | null {
  const m = modelInfo(model);
  if (!m) return null;
  return (u.inputTokens * m.inPerM + u.outputTokens * m.outPerM + u.cacheReadTokens * m.cacheReadPerM + u.cacheWriteTokens * m.cacheWritePerM) / 1e6;
}

/** Chat "Depth" in Settings → how much the model thinks. Readings and dreams use medium. */
export const effortFor = (depth: ChatDepth): Effort => (depth === 'deep' ? 'high' : depth === 'balanced' ? 'medium' : 'low');
