import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ExperimentConfig, ExperimentKey } from '@/experiments/config';
import { persistStorage } from '@/store/storage';

export type Assignment = { variant: string; at: string };

type ExperimentState = {
  /** Random id for this install, created at first launch. Null until enrollment has run. */
  installId: string | null;
  /** False for installs that were already set up before the tests began: they keep their look and are left out of results. */
  enrolled: boolean;
  /** When this install first opened the app (ISO), the start of its retention clock. */
  firstOpenAt: string | null;
  assignments: Partial<Record<ExperimentKey, Assignment>>;
  /** The server's experiment settings, cached for offline launches. */
  remote: Partial<Record<ExperimentKey, ExperimentConfig>>;
  /** The server user this install and its assignments were registered for, once they have been. */
  registeredFor: string | null;
  enroll: (patch: { installId: string; enrolled: boolean; firstOpenAt: string; assignments: Partial<Record<ExperimentKey, Assignment>> }) => void;
  setRemote: (remote: Partial<Record<ExperimentKey, ExperimentConfig>>) => void;
  markRegistered: (userId: string) => void;
};

/** Not part of backups: a restored backup must not copy another install's identity or test groups. */
export const useExperimentStore = create<ExperimentState>()(
  persist(
    (set) => ({
      installId: null,
      enrolled: false,
      firstOpenAt: null,
      assignments: {},
      remote: {},
      registeredFor: null,
      enroll: (patch) => set(patch),
      setRemote: (remote) => set({ remote }),
      markRegistered: (userId) => set({ registeredFor: userId }),
    }),
    { name: 'esoterica-experiments', storage: createJSONStorage(() => persistStorage) },
  ),
);
