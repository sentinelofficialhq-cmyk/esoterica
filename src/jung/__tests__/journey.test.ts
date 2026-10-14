import { EMPTY_JOURNEY, journeyProgress, type JourneyState } from '@/jung/journey';

const promptsTagged = (tag: string, n: number) => Array.from({ length: n }, () => [tag]);

test('an empty journey starts at the Persona', () => {
  const p = journeyProgress(EMPTY_JOURNEY);
  expect(p.percent).toBe(0);
  expect(p.currentStage).toBe('persona');
  expect(p.stages.map((s) => s.id)).toEqual(['persona', 'shadow', 'anima', 'self']);
});

test('finishing the Persona stage moves the journey to the Shadow', () => {
  const s: JourneyState = { ...EMPTY_JOURNEY, types: true, archetypes: true, alignment: true, shadowEntryTags: promptsTagged('persona', 3) };
  const p = journeyProgress(s);
  expect(p.stages[0].done).toBe(p.stages[0].total);
  expect(p.currentStage).toBe('shadow');
});

test('a full journey is 100%', () => {
  const s: JourneyState = {
    types: true,
    archetypes: true,
    alignment: true,
    shadowEntryTags: [...promptsTagged('persona', 3), ...promptsTagged('anima', 3), ...promptsTagged('self', 1)],
    projections: 3,
    dreamFigures: [['shadow'], ['anima'], [], [], [], [], [], [], [], []],
    synchronicities: 5,
    savedReadingTypes: ['compatibility', 'compatibility', 'full'],
    activeImaginationSessions: 1,
  };
  const p = journeyProgress(s);
  expect(p.percent).toBe(100);
  expect(p.currentStage).toBe('complete');
});
