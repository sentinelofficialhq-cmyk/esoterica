import type { Fn } from '@/content/functions';

/** The 10-question quick read or the full 32. */
export type TypesDepth = 'quick' | 'full';
export type Confidence = 'low' | 'medium' | 'high';
export type TypesResult = {
  scores: Record<Fn, number>;
  dominant: Fn;
  auxiliary: Fn;
  inferior: Fn;
  code: string;
  takenAt: string;
  /** Missing on results saved before the quick read existed, which were all full-length. */
  depth?: TypesDepth;
  confidence?: Confidence;
};
export type ArchetypeResult = { top: string[]; counts: Record<string, number>; shadowForm: string; takenAt: string };
export type AlignmentResult = { percent: number; tier: string; takenAt: string };

export type Dream = {
  id: string;
  date: string;
  title: string;
  text: string;
  mood: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  lucid: boolean;
  recurring: boolean;
  symbols: string[];
  figures: string[];
  themes: string[];
  interpretation?: { text: string; model: string; createdAt: string };
};
export type ShadowEntry = { id: string; date: string; promptId: string; text: string };
export type Projection = { id: string; date: string; who: string; what: string; quality: string; inMe: string; owning: string };
export type Synchronicity = { id: string; date: string; text: string; numbers: string[]; feeling: string; meaning: string };
