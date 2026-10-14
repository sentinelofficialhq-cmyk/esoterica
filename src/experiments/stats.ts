/** The 95% range for a share, by the Wilson score interval (sound at small counts and near 0% or 100%). */
export type Interval = { p: number; lo: number; hi: number };

const Z95 = 1.959964;

export function wilson(successes: number, n: number, z = Z95): Interval {
  if (n <= 0) return { p: 0, lo: 0, hi: 1 };
  const p = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return { p, lo: Math.max(0, center - half), hi: Math.min(1, center + half) };
}

/** A count of people who could have reached a milestone, and how many did. */
export type Rate = { eligible: number; hit: number };

/** One test group's numbers, as the server's experiment_results function returns them. */
export type VariantResult = {
  variant: string;
  enrolled: number;
  /** Still opening the app 1, 7 and 30 days after install, among installs at least that old. */
  d1: Rate;
  d7: Rate;
  d30: Rate;
  /** Median days between first and last open. */
  medianSpanDays: number | null;
  /** Mean days with an open in the first 30, among installs at least 30 days old. */
  meanActiveDays30: number | null;
  /** Paywall test only: saw the paywall → started a trial, and trial → paid. */
  trial?: Rate;
  paid?: Rate;
};

/** Every group needs this many eligible people before a leader is called. */
export const MIN_PER_GROUP = 100;

export type Verdict =
  | { kind: 'too-early'; needed: number }
  | { kind: 'leader'; variant: string }
  | { kind: 'no-clear-leader' };

/**
 * Names the leader on one measure only when every group has enough people and the best group's
 * range sits wholly above every other group's.
 */
export function verdict(rates: { variant: string; rate: Rate }[], minPerGroup = MIN_PER_GROUP): Verdict {
  if (rates.length < 2) return { kind: 'too-early', needed: minPerGroup };
  const short = Math.max(0, ...rates.map((r) => minPerGroup - r.rate.eligible));
  if (short > 0) return { kind: 'too-early', needed: short };
  const ranged = rates.map((r) => ({ variant: r.variant, ci: wilson(r.rate.hit, r.rate.eligible) }));
  const best = ranged.reduce((a, b) => (b.ci.p > a.ci.p ? b : a));
  const clear = ranged.every((r) => r === best || r.ci.hi < best.ci.lo);
  return clear ? { kind: 'leader', variant: best.variant } : { kind: 'no-clear-leader' };
}

/** "34.5%" */
export const pct = (x: number, digits = 1): string => `${(x * 100).toFixed(digits)}%`;
