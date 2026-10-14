import type { ExperimentConfig } from '@/experiments/config';
import { hash } from '@/lib/hash';

/**
 * FNV-1a followed by MurmurHash3's finalizer. FNV alone mixes the last characters of a string only
 * into its higher bits, so two experiments keyed by suffix would get correlated buckets; the finalizer
 * spreads every input bit across the whole word.
 */
export function mixedHash(s: string): number {
  let h = hash(s);
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * The variant for this install in this experiment: the same answer every time for the same install,
 * spread by weight across installs, and independent between experiments.
 */
export function pickVariant(installId: string, config: ExperimentConfig): string {
  const live = config.variants.filter((v) => v.weight > 0);
  if (config.status === 'stopped' || live.length === 0) {
    return config.winner ?? config.variants[0]?.id ?? '';
  }
  const total = live.reduce((sum, v) => sum + v.weight, 0);
  // 2^32 slots mapped onto [0, total): uniform to well under 0.001% for small weights.
  let point = (mixedHash(`${installId}:${config.key}`) / 0x100000000) * total;
  for (const v of live) {
    if (point < v.weight) return v.id;
    point -= v.weight;
  }
  return live[live.length - 1].id;
}

/** A random install id: never derived from anything about the person or device. */
export function newInstallId(): string {
  const part = () => Math.random().toString(36).slice(2, 10).padEnd(8, '0');
  return `${Date.now().toString(36)}-${part()}${part()}`;
}
