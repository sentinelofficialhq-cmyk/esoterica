export type ReadingType =
  | 'full' | 'date' | 'name' | 'compatibility' | 'daily' | 'week' | 'year'
  | 'bestDate' | 'alignment' | 'family' | 'type' | 'archetype' | 'dream';

export type ReadingSection = { heading: string; body: string; chips?: string[] };

export type ReadingDoc = {
  type: ReadingType;
  title: string;
  subtitle?: string;
  sections: ReadingSection[];
  /** Short labelled results: exactly what the AI receives for "Ask Jung to read this". */
  facts: Record<string, string | number | string[]>;
};

/** `ai.guide` is who gave the AI reading; readings saved before Neville existed are Jung's. */
export type SavedReading = { id: string; createdAt: string; doc: ReadingDoc; ai?: { text: string; model: string; guide?: 'jung' | 'neville' } };
