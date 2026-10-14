import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Dream, Projection, ShadowEntry, Synchronicity } from '@/jung/types';
import { newId } from '@/lib/id';
import { persistStorage } from '@/store/storage';

type NewDream = Omit<Dream, 'id' | 'symbols' | 'figures' | 'themes' | 'interpretation'>;

type JournalState = {
  dreams: Dream[];
  shadowEntries: ShadowEntry[];
  projections: Projection[];
  synchronicities: Synchronicity[];
  addDream: (d: NewDream) => string;
  updateDream: (id: string, patch: Partial<Omit<Dream, 'id'>>) => void;
  removeDream: (id: string) => void;
  addShadowEntry: (e: Omit<ShadowEntry, 'id'>) => string;
  removeShadowEntry: (id: string) => void;
  addProjection: (p: Omit<Projection, 'id'>) => string;
  removeProjection: (id: string) => void;
  addSynchronicity: (s: Omit<Synchronicity, 'id'>) => string;
  removeSynchronicity: (id: string) => void;
};

/** Newest first everywhere. */
export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      dreams: [],
      shadowEntries: [],
      projections: [],
      synchronicities: [],
      addDream: (d) => {
        const id = newId();
        set((s) => ({ dreams: [{ ...d, id, symbols: [], figures: [], themes: [] }, ...s.dreams] }));
        return id;
      },
      updateDream: (id, patch) => set((s) => ({ dreams: s.dreams.map((d) => (d.id === id ? { ...d, ...patch } : d)) })),
      removeDream: (id) => set((s) => ({ dreams: s.dreams.filter((d) => d.id !== id) })),
      addShadowEntry: (e) => {
        const id = newId();
        set((s) => ({ shadowEntries: [{ ...e, id }, ...s.shadowEntries] }));
        return id;
      },
      removeShadowEntry: (id) => set((s) => ({ shadowEntries: s.shadowEntries.filter((e) => e.id !== id) })),
      addProjection: (p) => {
        const id = newId();
        set((s) => ({ projections: [{ ...p, id }, ...s.projections] }));
        return id;
      },
      removeProjection: (id) => set((s) => ({ projections: s.projections.filter((p) => p.id !== id) })),
      addSynchronicity: (x) => {
        const id = newId();
        set((s) => ({ synchronicities: [{ ...x, id }, ...s.synchronicities] }));
        return id;
      },
      removeSynchronicity: (id) => set((s) => ({ synchronicities: s.synchronicities.filter((x) => x.id !== id) })),
    }),
    { name: 'rocket-journal', storage: createJSONStorage(() => persistStorage) },
  ),
);
