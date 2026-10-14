import { practiceById } from '@/content/neville';
import { mindFor, quoteOf, verseById, type MindKey } from '@/content/scripture';
import type { ReadingDoc } from '@/readings/types';

/**
 * Adds the "Mind & Scripture" lens to a reading: a KJV verse matched to the reading's key number, its
 * mystical reading, and one Neville-style imagination practice. Also passed to the AI as facts.
 */
export function withMind(doc: ReadingDoc, key: MindKey | number): ReadingDoc {
  const k = typeof key === 'number' ? mindFor(key) : key;
  const verse = verseById(k.verse);
  const practice = practiceById(k.practice);
  if (!practice) return doc;
  return {
    ...doc,
    sections: [
      ...doc.sections,
      {
        heading: `Mind & Scripture · ${verse.ref}`,
        body: `“${quoteOf(verse)}” (${verse.ref}, King James Version)\n\n${verse.reading}\n\nPractice: ${practice.title}. ${practice.short}`,
        chips: [practice.title],
      },
    ],
    facts: { ...doc.facts, verse: `${verse.ref}: ${quoteOf(verse)}`, verseReading: verse.reading, practice: `${practice.title}: ${practice.short}` },
  };
}
