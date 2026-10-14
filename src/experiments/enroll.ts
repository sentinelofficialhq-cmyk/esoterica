import { track } from '@/analytics/track';
import { newInstallId, pickVariant } from '@/experiments/assign';
import { BUILT_IN_EXPERIMENTS, EXPERIMENT_KEYS, type ExperimentConfig, type ExperimentKey, type PaywallVariant, PAYWALL_VARIANTS } from '@/experiments/config';
import { type Assignment, useExperimentStore } from '@/store/experimentStore';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { isThemeId } from '@/ui/themes';

/** The server's settings for an experiment when known, else the built-in ones. */
export const configFor = (key: ExperimentKey): ExperimentConfig => useExperimentStore.getState().remote[key] ?? BUILT_IN_EXPERIMENTS[key];

/**
 * Runs once per install, after storage has loaded. A new install gets an id and one variant per
 * experiment, and starts in its assigned look. An install that was already onboarded before the
 * tests existed gets an id but no assignments, so it keeps its look and stays out of the results.
 */
export function ensureEnrollment(now: Date = new Date()): void {
  const ex = useExperimentStore.getState();
  if (ex.installId) return;
  const installId = newInstallId();
  const at = now.toISOString();
  if (useProfileStore.getState().onboarded) {
    ex.enroll({ installId, enrolled: false, firstOpenAt: at, assignments: {} });
    return;
  }
  const assignments = Object.fromEntries(EXPERIMENT_KEYS.map((k) => [k, { variant: pickVariant(installId, configFor(k)), at }])) as Record<
    ExperimentKey,
    Assignment
  >;
  ex.enroll({ installId, enrolled: true, firstOpenAt: at, assignments });
  const theme = assignments.theme.variant;
  if (isThemeId(theme)) useSettingsStore.getState().update({ theme });
  for (const k of EXPERIMENT_KEYS) track('experiment_assigned', { experiment: k, variant: assignments[k].variant });
}

/** The paywall this install sees: its assigned variant, or for installs outside the test the current winner or the first design. */
export function paywallVariant(): PaywallVariant {
  const assigned = useExperimentStore.getState().assignments.paywall?.variant;
  const fallback = configFor('paywall').winner ?? PAYWALL_VARIANTS[0];
  const v = assigned ?? fallback;
  return (PAYWALL_VARIANTS as string[]).includes(v) ? (v as PaywallVariant) : PAYWALL_VARIANTS[0];
}

export const usePaywallVariant = (): PaywallVariant => {
  useExperimentStore((s) => s.assignments.paywall?.variant);
  return paywallVariant();
};
