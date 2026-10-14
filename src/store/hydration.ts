import { useSyncExternalStore } from 'react';

import { useAnalyticsQueue } from '@/analytics/track';
import { useChatStore } from '@/store/chatStore';
import { useExperimentStore } from '@/store/experimentStore';
import { useImaginationStore } from '@/store/imaginationStore';
import { useJournalStore } from '@/store/journalStore';
import { useMemoryStore } from '@/store/memoryStore';
import { usePeopleStore } from '@/store/peopleStore';
import { useProfileStore } from '@/store/profileStore';
import { useQuizStore } from '@/store/quizStore';
import { useReadingStore } from '@/store/readingStore';
import { useSettingsStore } from '@/store/settingsStore';

type Persisted = { persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void } };

export const PERSISTED_STORES: Persisted[] = [
  useProfileStore,
  usePeopleStore,
  useJournalStore,
  useQuizStore,
  useReadingStore,
  useMemoryStore,
  useSettingsStore,
  useChatStore,
  useImaginationStore,
  useExperimentStore,
  useAnalyticsQueue,
];

const allHydrated = () => PERSISTED_STORES.every((s) => s.persist.hasHydrated());

const subscribe = (onChange: () => void) => {
  const unsubs = PERSISTED_STORES.map((s) => s.persist.onFinishHydration(onChange));
  return () => unsubs.forEach((u) => u());
};

/**
 * True once every persisted store has loaded from device storage. The static web render and the
 * browser's hydration pass both see false (getServerSnapshot), so the pre-rendered HTML always matches
 * the first client render; the real value takes over right after.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, allHydrated, () => false);
}
