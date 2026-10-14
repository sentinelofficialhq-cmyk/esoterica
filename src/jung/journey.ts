/** A snapshot of what the person has done, taken from the stores. */
export type JourneyState = {
  types: boolean;
  archetypes: boolean;
  alignment: boolean;
  /** One entry per shadow-journal entry: the tags of the prompt it answered. */
  shadowEntryTags: string[][];
  projections: number;
  /** One entry per dream: the Jungian figures found in it. */
  dreamFigures: string[][];
  synchronicities: number;
  savedReadingTypes: string[];
  activeImaginationSessions: number;
};

export const EMPTY_JOURNEY: JourneyState = {
  types: false,
  archetypes: false,
  alignment: false,
  shadowEntryTags: [],
  projections: 0,
  dreamFigures: [],
  synchronicities: 0,
  savedReadingTypes: [],
  activeImaginationSessions: 0,
};

export type StageId = 'persona' | 'shadow' | 'anima' | 'self';
export type Milestone = { label: string; done: boolean; href: string };
export type Stage = { id: StageId; name: string; summary: string; done: number; total: number; items: Milestone[] };

const atLeast = (label: string, have: number, need: number, href: string): Milestone => ({
  label: need > 1 ? `${label} (${Math.min(have, need)}/${need})` : label,
  done: have >= need,
  href,
});

/** Individuation as a map: Persona → Shadow → Anima/Animus → Self. All stages stay open; this only shows progress. */
export function journeyProgress(s: JourneyState): { stages: Stage[]; percent: number; currentStage: StageId | 'complete' } {
  const tagged = (tag: string) => s.shadowEntryTags.filter((tags) => tags.includes(tag)).length;
  const dreamsWith = (...figs: string[]) => s.dreamFigures.filter((f) => f.some((x) => figs.includes(x))).length;
  const readings = (type: string) => s.savedReadingTypes.filter((t) => t === type).length;

  const stages: Omit<Stage, 'done' | 'total'>[] = [
    {
      id: 'persona',
      name: 'Persona',
      summary: 'See the mask you wear, and who you are behind it.',
      items: [
        atLeast('Take the Psychological Types quiz', Number(s.types), 1, '/quiz-types'),
        atLeast('Take the Archetype quiz', Number(s.archetypes), 1, '/quiz-archetypes'),
        atLeast('Check your Persona and Self alignment', Number(s.alignment), 1, '/quiz-alignment'),
        atLeast('Write Persona reflections', tagged('persona'), 3, '/shadow?theme=persona'),
      ],
    },
    {
      id: 'shadow',
      name: 'Shadow',
      summary: 'Meet what you have pushed away, and the gifts hidden there.',
      items: [
        atLeast('Answer shadow prompts', s.shadowEntryTags.length, 7, '/shadow'),
        atLeast('Do projection checks', s.projections, 3, '/projection'),
        atLeast('Record a dream with a shadow figure', dreamsWith('shadow'), 1, '/dreams'),
      ],
    },
    {
      id: 'anima',
      name: 'Anima / Animus',
      summary: 'Take back what you project onto the people you love.',
      items: [
        atLeast('Write Anima / Animus reflections', tagged('anima'), 3, '/shadow?theme=anima'),
        atLeast('Save compatibility readings', readings('compatibility'), 2, '/match'),
        atLeast('Try an active imagination session', s.activeImaginationSessions, 1, '/active-imagination'),
        atLeast('Record a dream with an anima or animus figure', dreamsWith('anima', 'animus'), 1, '/dreams'),
      ],
    },
    {
      id: 'self',
      name: 'Self',
      summary: 'Live from the center: the whole of you, not only the ego.',
      items: [
        atLeast('Keep a dream journal', s.dreamFigures.length, 10, '/dreams'),
        atLeast('Log synchronicities', s.synchronicities, 5, '/synchronicity'),
        atLeast('Save your full reading', readings('full'), 1, '/reading?type=full'),
        atLeast('Write a Self reflection', tagged('self'), 1, '/shadow?theme=self'),
      ],
    },
  ];

  const full = stages.map((st) => ({ ...st, done: st.items.filter((i) => i.done).length, total: st.items.length }));
  const done = full.reduce((a, st) => a + st.done, 0);
  const total = full.reduce((a, st) => a + st.total, 0);
  const current = full.find((st) => st.done < st.total);
  return { stages: full, percent: Math.round((done / total) * 100), currentStage: current ? current.id : 'complete' };
}
