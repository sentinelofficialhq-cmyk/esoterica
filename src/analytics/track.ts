import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { EventName, EventProps, QueuedEvent } from '@/analytics/events';
import { newId } from '@/lib/id';
import { useExperimentStore } from '@/store/experimentStore';
import { useSettingsStore } from '@/store/settingsStore';
import { persistStorage } from '@/store/storage';

/** Where events go once a backend is connected. Until then they wait in the queue. */
export interface AnalyticsTransport {
  send(events: QueuedEvent[]): Promise<void>;
}

/** The newest events are kept when the queue overflows (a long offline stretch). */
export const MAX_QUEUE = 500;
export const BATCH_SIZE = 50;

type QueueState = { events: QueuedEvent[]; push: (e: QueuedEvent) => void; drop: (ids: string[]) => void; clear: () => void };

/** Not part of backups. */
export const useAnalyticsQueue = create<QueueState>()(
  persist(
    (set) => ({
      events: [],
      push: (e) => set((s) => ({ events: [...s.events, e].slice(-MAX_QUEUE) })),
      drop: (ids) => set((s) => ({ events: s.events.filter((e) => !ids.includes(e.id)) })),
      clear: () => set({ events: [] }),
    }),
    { name: 'esoterica-analytics', storage: createJSONStorage(() => persistStorage) },
  ),
);

let transport: AnalyticsTransport | null = null;
let flushing: Promise<void> | null = null;

export function setAnalyticsTransport(t: AnalyticsTransport | null): void {
  transport = t;
}

const appVersion = () => Constants.expoConfig?.version ?? 'unknown';

/**
 * Record an event. Does nothing when the person has turned off "Help improve Esoterica", or before
 * the install has an id (enrollment runs right after storage loads at launch).
 */
export function track<N extends EventName>(name: N, ...args: EventProps[N] extends Record<string, never> ? [] : [EventProps[N]]): void {
  if (useSettingsStore.getState().shareUsage === false) return;
  const ex = useExperimentStore.getState();
  if (!ex.installId) return;
  const props = (args[0] ?? {}) as Record<string, string | number | boolean | undefined>;
  const clean = Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) as QueuedEvent['props'];
  useAnalyticsQueue.getState().push({
    id: newId(),
    name,
    props: clean,
    ts: new Date().toISOString(),
    installId: ex.installId,
    variants: Object.fromEntries(Object.entries(ex.assignments).map(([k, a]) => [k, a!.variant])),
    appVersion: appVersion(),
    platform: Platform.OS,
  });
}

/** Send queued events in batches. Safe to call often: one flush runs at a time, failures keep the events for later. */
export function flush(): Promise<void> {
  if (!transport) return Promise.resolve();
  if (flushing) return flushing;
  const t = transport;
  flushing = (async () => {
    try {
      for (;;) {
        const batch = useAnalyticsQueue.getState().events.slice(0, BATCH_SIZE);
        if (!batch.length) return;
        await t.send(batch);
        useAnalyticsQueue.getState().drop(batch.map((e) => e.id));
      }
    } catch {
      // Offline or the server refused: the events stay queued for the next flush.
    } finally {
      flushing = null;
    }
  })();
  return flushing;
}

/** Turning sharing off also discards anything not yet sent. */
export function forgetQueuedEvents(): void {
  useAnalyticsQueue.getState().clear();
}
