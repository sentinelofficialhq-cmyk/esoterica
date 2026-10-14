import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Entity } from '@/data/entities';
import { newId } from '@/lib/id';
import { persistStorage } from '@/store/storage';

export const RELATIONS = ['partner', 'mother', 'father', 'sibling', 'child', 'friend', 'colleague', 'other'] as const;
export type RelationKind = (typeof RELATIONS)[number];
export type Person = { id: string; name: string; birthName?: string; birthDate: string; relation: RelationKind };

type PeopleState = {
  people: Person[];
  /** User-added entities and overrides of built-in ones (same id wins). */
  customEntities: Entity[];
  addPerson: (p: Omit<Person, 'id'>) => string;
  updatePerson: (id: string, patch: Partial<Omit<Person, 'id'>>) => void;
  removePerson: (id: string) => void;
  upsertCustomEntity: (e: Entity) => void;
  removeCustomEntity: (id: string) => void;
};

export const usePeopleStore = create<PeopleState>()(
  persist(
    (set) => ({
      people: [],
      customEntities: [],
      addPerson: (p) => {
        const id = newId();
        set((s) => ({ people: [...s.people, { ...p, id }] }));
        return id;
      },
      updatePerson: (id, patch) => set((s) => ({ people: s.people.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removePerson: (id) => set((s) => ({ people: s.people.filter((p) => p.id !== id) })),
      upsertCustomEntity: (e) =>
        set((s) => ({ customEntities: [...s.customEntities.filter((x) => x.id !== e.id), e] })),
      removeCustomEntity: (id) => set((s) => ({ customEntities: s.customEntities.filter((x) => x.id !== id) })),
    }),
    { name: 'rocket-people', storage: createJSONStorage(() => persistStorage) },
  ),
);
