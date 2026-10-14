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

export function costUSD(model: string, u: Usage): number | null {
  const m = MODELS[model];
  if (!m) return null;
  return (u.inputTokens * m.inPerM + u.outputTokens * m.outPerM + u.cacheReadTokens * m.cacheReadPerM + u.cacheWriteTokens * m.cacheWritePerM) / 1e6;
}

/** Chat "Depth" in Settings → how much the model thinks. Readings and dreams use medium. */
export const effortFor = (depth: ChatDepth): Effort => (depth === 'deep' ? 'high' : depth === 'balanced' ? 'medium' : 'low');
