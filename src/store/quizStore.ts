import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AlignmentResult, ArchetypeResult, TypesResult } from '@/jung/types';
import { persistStorage } from '@/store/storage';

type QuizState = {
  types: TypesResult | null;
  archetypes: ArchetypeResult | null;
  /** Newest first; the alignment quiz can be retaken to watch the persona shift. */
  alignment: AlignmentResult[];
  setTypes: (r: TypesResult) => void;
  setArchetypes: (r: ArchetypeResult) => void;
  addAlignment: (r: AlignmentResult) => void;
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      types: null,
      archetypes: null,
      alignment: [],
      setTypes: (types) => set({ types }),
      setArchetypes: (archetypes) => set({ archetypes }),
      addAlignment: (r) => set((s) => ({ alignment: [r, ...s.alignment] })),
    }),
    { name: 'rocket-quizzes', storage: createJSONStorage(() => persistStorage) },
  ),
);
