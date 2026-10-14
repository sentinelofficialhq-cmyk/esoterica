import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { newId } from '@/lib/id';
import type { ReadingDoc, SavedReading } from '@/readings/types';
import { persistStorage } from '@/store/storage';

type ReadingState = {
  readings: SavedReading[];
  saveReading: (doc: ReadingDoc) => string;
  removeReading: (id: string) => void;
  setAi: (id: string, ai: NonNullable<SavedReading['ai']>) => void;
};

export const useReadingStore = create<ReadingState>()(
  persist(
    (set) => ({
      readings: [],
      saveReading: (doc) => {
        const id = newId();
        set((s) => ({ readings: [{ id, createdAt: new Date().toISOString(), doc }, ...s.readings] }));
        return id;
      },
      removeReading: (id) => set((s) => ({ readings: s.readings.filter((r) => r.id !== id) })),
      setAi: (id, ai) => set((s) => ({ readings: s.readings.map((r) => (r.id === id ? { ...r, ai } : r)) })),
    }),
    { name: 'rocket-readings', storage: createJSONStorage(() => persistStorage) },
  ),
);
