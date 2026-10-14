/**
 * The launch A/B tests. Each new install is assigned one variant per experiment, independently.
 * The server can override these (weights, or stop a test and roll out its winner); this is the
 * built-in fallback used until it answers, or when offline.
 */
export type ExperimentKey = 'theme' | 'paywall';
export const EXPERIMENT_KEYS: ExperimentKey[] = ['theme', 'paywall'];

export type PaywallVariant = 'timeline' | 'locked' | 'jung';
export const PAYWALL_VARIANTS: PaywallVariant[] = ['timeline', 'locked', 'jung'];

export type VariantWeight = { id: string; weight: number };

export type ExperimentConfig = {
  key: ExperimentKey;
  variants: VariantWeight[];
  /** A stopped experiment assigns `winner` to everyone new (or its first variant when no winner is set). */
  status: 'running' | 'stopped';
  winner?: string | null;
};

/** Theme ids, kept here as plain strings so this module never imports UI code. Must match `THEME_IDS`. */
const THEME_VARIANTS = ['ember', 'gilded', 'nebula', 'emberQuiet', 'brass', 'daylight'];

export const BUILT_IN_EXPERIMENTS: Record<ExperimentKey, ExperimentConfig> = {
  theme: { key: 'theme', status: 'running', variants: THEME_VARIANTS.map((id) => ({ id, weight: 1 })) },
  paywall: { key: 'paywall', status: 'running', variants: PAYWALL_VARIANTS.map((id) => ({ id, weight: 1 })) },
};
