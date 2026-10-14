import { ARCHETYPE_IDS } from '@/content/archetypes';
import { ARCHETYPE_ITEMS, scoreArchetypes } from '@/jung/archetypeQuiz';

test('24 items × 4 distinct archetypes; each archetype exactly 8 times', () => {
  expect(ARCHETYPE_ITEMS).toHaveLength(24);
  ARCHETYPE_ITEMS.forEach((item) => {
    expect(item.options).toHaveLength(4);
    expect(new Set(item.options.map((o) => o.archetype)).size).toBe(4);
  });
  for (const id of ARCHETYPE_IDS) {
    expect(ARCHETYPE_ITEMS.flatMap((i) => i.options).filter((o) => o.archetype === id)).toHaveLength(8);
  }
});

test('choosing the Sage whenever offered puts Sage first', () => {
  const answers = ARCHETYPE_ITEMS.map((i) => Math.max(0, i.options.findIndex((o) => o.archetype === 'sage')));
  const r = scoreArchetypes(answers, '2026-10-13');
  expect(r.top[0]).toBe('sage');
  expect(r.top).toHaveLength(3);
  expect(r.counts.sage).toBe(8);
  expect(r.shadowForm).toMatch(/detachment/i);
});

test('requires every answer', () => expect(() => scoreArchetypes([0], '2026-10-13')).toThrow());
