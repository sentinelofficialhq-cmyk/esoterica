import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { newId } from '@/lib/id';
import { persistStorage } from '@/store/storage';

export const MEMORY_CATEGORIES = ['life', 'relationships', 'work', 'dreams', 'struggles', 'goals', 'preferences'] as const;
export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];
export type MemoryNote = { id: string; text: string; category: MemoryCategory; updatedAt: string };
export const MAX_NOTES = 40;

/** Trim, drop empties, dedupe case-insensitively, cap at 40. */
export function normalizeNotes(notes: { text: string; category: MemoryCategory }[]): { text: string; category: MemoryCategory }[] {
  const seen = new Set<string>();
  const out: { text: string; category: MemoryCategory }[] = [];
  for (const n of notes) {
    const text = n.text.trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    out.push({ text, category: n.category });
  }
  return out.slice(0, MAX_NOTES);
}

type MemoryState = {
  notes: MemoryNote[];
  setNotes: (notes: { text: string; category: MemoryCategory }[]) => void;
  updateNote: (id: string, text: string) => void;
  removeNote: (id: string) => void;
  clear: () => void;
};

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set) => ({
      notes: [],
      setNotes: (notes) => {
        const now = new Date().toISOString();
        set({ notes: normalizeNotes(notes).map((n) => ({ ...n, id: newId(), updatedAt: now })) });
      },
      updateNote: (id, text) =>
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, text, updatedAt: new Date().toISOString() } : n)) })),
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      clear: () => set({ notes: [] }),
    }),
    { name: 'rocket-memory', storage: createJSONStorage(() => persistStorage) },
  ),
);
