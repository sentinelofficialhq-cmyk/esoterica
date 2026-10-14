import { costUSD, DEFAULT_MODEL, effortFor, MODELS } from '@/ai/models';

test('default model is Opus 5.5 with refusal fallback', () => {
  expect(DEFAULT_MODEL).toBe('claude-opus-5-5');
  expect(MODELS[DEFAULT_MODEL].serverFallback).toBe(true);
  expect(MODELS['claude-haiku-5-5'].serverFallback).toBe(false);
});

test('cost estimate', () => {
  expect(costUSD('claude-opus-5-5', { inputTokens: 1e6, outputTokens: 1e6, cacheReadTokens: 0, cacheWriteTokens: 0 })).toBe(24);
  expect(costUSD('claude-opus-5-5', { inputTokens: 0, outputTokens: 0, cacheReadTokens: 1e6, cacheWriteTokens: 0 })).toBeCloseTo(0.2);
  expect(costUSD('gpt-unknown', { inputTokens: 1, outputTokens: 1, cacheReadTokens: 0, cacheWriteTokens: 0 })).toBeNull();
});

test('chat depth maps to effort', () => {
  expect(effortFor('quick')).toBe('low');
  expect(effortFor('balanced')).toBe('medium');
  expect(effortFor('deep')).toBe('high');
});
