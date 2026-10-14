import { ARCHETYPES, ARCHETYPE_IDS, CORE_ARCHETYPES } from '@/content/archetypes';
import { FUNCTIONS, FUNCTION_MEANINGS } from '@/content/functions';

test('eight function-attitudes, fully described', () => {
  expect(FUNCTIONS).toHaveLength(8);
  for (const fn of FUNCTIONS) {
    const m = FUNCTION_MEANINGS[fn];
    expect(m.name).toMatch(/^(Introverted|Extraverted) /);
    for (const f of [m.essence, m.whenDominant, m.whenInferior, m.growthEdge]) expect(f.length).toBeGreaterThan(20);
  }
});

test('twelve archetypes with shadow forms', () => {
  expect(ARCHETYPE_IDS).toHaveLength(12);
  for (const id of ARCHETYPE_IDS) {
    const a = ARCHETYPES[id];
    for (const f of [a.drive, a.gift, a.fear, a.shadowForm, a.jungNote]) expect(f.length).toBeGreaterThan(5);
  }
});

test('four structural archetypes with three questions each', () => {
  expect(CORE_ARCHETYPES.map((c) => c.id)).toEqual(['persona', 'shadow', 'anima', 'self']);
  CORE_ARCHETYPES.forEach((c) => expect(c.reflectionQuestions).toHaveLength(3));
});
