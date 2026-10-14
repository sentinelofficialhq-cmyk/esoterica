import type { Dream } from '@/jung/types';

/** Recurring symbols across dreams (AI-found symbols and the user's own tags), most frequent first. */
export function topSymbols(dreams: Dream[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const d of dreams) {
    const unique = new Set([...d.symbols, ...d.tags].map((s) => s.trim().toLowerCase()).filter(Boolean));
    for (const s of unique) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
