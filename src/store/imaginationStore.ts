import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PracticeId } from '@/content/neville';
import { newId } from '@/lib/id';
import { persistStorage } from '@/store/storage';

export type AimStatus = 'open' | 'fulfilled' | 'released';

/** Something the person is imagining into being, with the scene that implies it is done. */
export type Aim = {
  id: string;
  title: string;
  scene: string;
  createdAt: string;
  status: AimStatus;
  closedAt?: string;
  /** "Signs along the way": what the person noticed while holding the aim. */
  notes: { date: string; text: string }[];
};

export type Session = { id: string; date: string; kind: PracticeId; aimId?: string; text: string; feeling: 1 | 2 | 3 | 4 | 5 };

type ImaginationState = {
  aims: Aim[];
  sessions: Session[];
  addAim: (a: { title: string; scene: string; date: string }) => string;
  updateAim: (id: string, patch: Partial<Pick<Aim, 'title' | 'scene'>>) => void;
  closeAim: (id: string, status: Exclude<AimStatus, 'open'>, date: string) => void;
  reopenAim: (id: string) => void;
  addAimNote: (id: string, text: string, date: string) => void;
  removeAim: (id: string) => void;
  addSession: (s: Omit<Session, 'id'>) => string;
  removeSession: (id: string) => void;
};

/** Neville-style imagination work. Newest first everywhere. */
export const useImaginationStore = create<ImaginationState>()(
  persist(
    (set) => ({
      aims: [],
      sessions: [],
      addAim: ({ title, scene, date }) => {
        const id = newId();
        set((s) => ({ aims: [{ id, title: title.trim(), scene: scene.trim(), createdAt: date, status: 'open', notes: [] }, ...s.aims] }));
        return id;
      },
      updateAim: (id, patch) => set((s) => ({ aims: s.aims.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      closeAim: (id, status, date) => set((s) => ({ aims: s.aims.map((a) => (a.id === id ? { ...a, status, closedAt: date } : a)) })),
      reopenAim: (id) => set((s) => ({ aims: s.aims.map((a) => (a.id === id ? { ...a, status: 'open', closedAt: undefined } : a)) })),
      addAimNote: (id, text, date) =>
        set((s) => ({ aims: s.aims.map((a) => (a.id === id ? { ...a, notes: [...a.notes, { date, text: text.trim() }] } : a)) })),
      removeAim: (id) =>
        set((s) => ({
          aims: s.aims.filter((a) => a.id !== id),
          sessions: s.sessions.map((x) => (x.aimId === id ? { ...x, aimId: undefined } : x)),
        })),
      addSession: (x) => {
        const id = newId();
        set((s) => ({ sessions: [{ ...x, id }, ...s.sessions] }));
        return id;
      },
      removeSession: (id) => set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),
    }),
    // The 'rocket-' prefix matches every other store (kept from before the Esoterica rename).
    { name: 'rocket-imagination', storage: createJSONStorage(() => persistStorage) },
  ),
);
