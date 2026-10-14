import { buildProfile } from '@/engines/profile';
import {
  bestDateReading,
  compatibilityReading,
  dailyReading,
  dateReading,
  familyReading,
  fullReading,
  nameReading,
  typeReading,
  weekReading,
  yearReading,
} from '@/readings/builders';
import type { ReadingDoc } from '@/readings/types';

const sam = buildProfile({ name: 'Sam', birthName: 'John Smith', birthDate: '1990-05-14' });

const wellFormed = (doc: ReadingDoc) => {
  expect(doc.title.length).toBeGreaterThan(0);
  expect(doc.sections.length).toBeGreaterThan(0);
  doc.sections.forEach((s) => {
    expect(s.heading.length).toBeGreaterThan(0);
    expect(s.body.length).toBeGreaterThan(0);
  });
  expect(Object.keys(doc.facts).length).toBeGreaterThan(0);
};

test('date reading for Apple', () => {
  const doc = dateReading('1976-04-01', 'Apple');
  wellFormed(doc);
  expect(doc.facts.lifePath).toBe('28/1');
  expect(doc.facts.western).toMatch(/Aries/);
  expect(doc.facts.chinese).toBe('Fire Dragon');
});

test('name reading chips', () => {
  const doc = nameReading(['John Smith'], 'pythagorean', 2);
  wellFormed(doc);
  expect(doc.sections[0].chips).toContain('Expression 44/8');
});

test('full reading', () => {
  const doc = fullReading(sam, {}, '2026-10-13');
  wellFormed(doc);
  expect(doc.sections.length).toBeGreaterThanOrEqual(6);
  expect(doc.facts.chinese).toBe('Metal Horse');
  expect(doc.facts.lifePath).toBe('29/11');
});

test('daily, week, year, best-date', () => {
  wellFormed(dailyReading(sam, '2026-10-13'));
  const week = weekReading(sam, '2026-10-13');
  wellFormed(week);
  expect((week.facts.days as string[]).length).toBe(7);
  const year = yearReading(sam, 2026);
  wellFormed(year);
  expect((year.facts.months as string[]).length).toBe(12);
  expect(year.facts.yearAnimal).toBe('Horse');
  wellFormed(bestDateReading(sam, 'start', '2026-10-13', 30));
});

test('compatibility and family', () => {
  const ana = buildProfile({ name: 'Ana', birthDate: '1995-07-20' });
  const doc = compatibilityReading(sam, ana, { a: 'Sam', b: 'Ana' });
  wellFormed(doc);
  expect(doc.facts.overall).toBe(61);
  const fam = familyReading([
    { name: 'Sam', relation: 'self', profile: sam },
    { name: 'Ana', relation: 'friend', profile: ana },
    { name: 'Lee', relation: 'sibling', profile: buildProfile({ name: 'Lee', birthDate: '1988-02-20' }) },
  ]);
  wellFormed(fam);
  expect((fam.facts.pairs as string[]).length).toBe(3);
});

test('readings carry a Mind & Scripture section and pass the verse to the AI', () => {
  const p = buildProfile({ name: 'Ezekiel', birthDate: '2005-09-21' });
  const docs = [
    fullReading(p, {}, '2026-10-14'),
    dailyReading(p, '2026-10-14'),
    dateReading('1976-04-01', 'Apple'),
    yearReading(p, 2026),
    weekReading(p, '2026-10-12'),
    bestDateReading(p, 'start', '2026-10-14', 30),
    compatibilityReading(p, buildProfile({ name: 'B', birthDate: '1990-05-14' }), { a: 'You', b: 'B' }),
  ];
  for (const doc of docs) {
    const mind = doc.sections.find((s) => s.heading.startsWith('Mind & Scripture'));
    expect(mind).toBeDefined();
    expect(mind!.body).toContain('King James Version');
    expect(String(doc.facts.verse)).toMatch(/\d+:\d+/);
  }
  // Life Path 1 → "calleth those things which be not as though they were"
  expect(docs[0].sections.find((s) => s.heading.startsWith('Mind & Scripture'))!.heading).toContain('Romans 4:17');
  // Compatibility always reads Matthew 18:19, on agreement between two.
  expect(docs[6].sections.find((s) => s.heading.startsWith('Mind & Scripture'))!.heading).toContain('Matthew 18:19');
});

test('a quick or uncertain type result says so, and tells the AI', () => {
  const base = { scores: { Te: 0, Ti: 0, Fe: 0, Fi: 0, Se: 0, Si: 0, Ne: 0, Ni: 100 }, dominant: 'Ni', auxiliary: 'Te', inferior: 'Se', code: 'INTJ', takenAt: '2026-10-14' } as const;
  const legacy = typeReading({ ...base });
  wellFormed(legacy);
  expect(legacy.facts.depth).toMatch(/deep dive/);
  expect(legacy.sections.map((s) => s.heading)).not.toContain('A quick read');

  const quick = typeReading({ ...base, depth: 'quick', confidence: 'medium' });
  expect(quick.sections.at(-1)!.heading).toBe('A quick read');
  expect(quick.sections.at(-1)!.body).toMatch(/deep dive/);
  expect(quick.facts.depth).toMatch(/quick read/);

  const unsure = typeReading({ ...base, depth: 'full', confidence: 'low' });
  expect(unsure.sections.map((s) => s.heading)).toContain('How sure is this?');
  expect(unsure.facts.confidence).toBe('low');
});
