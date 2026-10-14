import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { flush, track } from '@/analytics/track';
import { refreshExperimentSettings, startBackendSync } from '@/backend/sync';
import { ensureEnrollment } from '@/experiments/enroll';
import { useExperimentStore } from '@/store/experimentStore';

/** A return after this long away counts as a new open, so retention sees it. */
export const RETURN_AFTER_MS = 30 * 60 * 1000;

/** On a first launch, how long to wait for the server's test settings before assigning from the built-in ones. */
export const SETTINGS_WAIT_MS = 1500;

export const isReturnVisit = (backgroundedAt: number | null, now: number): boolean => backgroundedAt !== null && now - backgroundedAt >= RETURN_AFTER_MS;

const within = (p: Promise<unknown>, ms: number) => Promise.race([p.catch(() => undefined), new Promise((resolve) => setTimeout(resolve, ms))]);

/**
 * Once storage has loaded: enroll the install in the tests, record the launch and connect to the
 * server. A first launch waits briefly for the server's test settings, so a test that was stopped
 * gives new installs its winner. Afterwards, records a return after half an hour or more away.
 *
 * Returns true once the install is enrolled, so the first screen renders in the assigned look.
 */
export function useLaunchTracking(hydrated: boolean): boolean {
  const enrolled = useExperimentStore((s) => s.installId !== null);
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    void (async () => {
      if (!useExperimentStore.getState().installId) await within(refreshExperimentSettings(), SETTINGS_WAIT_MS);
      if (cancelled) return;
      ensureEnrollment();
      track('app_open', { cold: true });
      startBackendSync();
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        if (isReturnVisit(backgroundedAt.current, Date.now())) track('app_open', { cold: false });
        backgroundedAt.current = null;
        void flush();
      } else if (state === 'background' && backgroundedAt.current === null) {
        backgroundedAt.current = Date.now();
        void flush();
      }
    });
    return () => sub.remove();
  }, [hydrated]);

  return enrolled;
}
