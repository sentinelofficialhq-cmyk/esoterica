import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LetterSystem } from '@/engines/letterology';
import { buildProfile, type Profile } from '@/engines/profile';
import { persistStorage } from '@/store/storage';

type ProfileFields = { name: string; birthName: string; birthDate: string | null; letterSystem: LetterSystem; onboarded: boolean };
type ProfileState = ProfileFields & {
  setProfile: (patch: Partial<ProfileFields>) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

const INITIAL: ProfileFields = { name: '', birthName: '', birthDate: null, letterSystem: 'pythagorean', onboarded: false };

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...INITIAL,
      setProfile: (patch) => set(patch),
      completeOnboarding: () => set({ onboarded: true }),
      reset: () => set(INITIAL),
    }),
    { name: 'rocket-profile', storage: createJSONStorage(() => persistStorage) },
  ),
);

export function profileFromState(s: ProfileFields): Profile | null {
  if (!s.birthDate) return null;
  return buildProfile({ name: s.name, birthName: s.birthName, birthDate: s.birthDate, letterSystem: s.letterSystem });
}

/** The user's full pattern, recomputed only when the inputs change. */
export function useProfile(): Profile | null {
  const name = useProfileStore((s) => s.name);
  const birthName = useProfileStore((s) => s.birthName);
  const birthDate = useProfileStore((s) => s.birthDate);
  const letterSystem = useProfileStore((s) => s.letterSystem);
  return useMemo(
    () => profileFromState({ name, birthName, birthDate, letterSystem, onboarded: true }),
    [name, birthName, birthDate, letterSystem],
  );
}
