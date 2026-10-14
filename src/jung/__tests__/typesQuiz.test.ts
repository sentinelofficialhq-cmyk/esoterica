import { FUNCTIONS } from '@/content/functions';
import { codeFor, inferiorOf, scoreTypes, TYPES_ITEMS } from '@/jung/typesQuiz';

test('32 balanced items: every function exactly 8 times, never against itself', () => {
  expect(TYPES_ITEMS).toHaveLength(32);
  for (const fn of FUNCTIONS) {
    const n = TYPES_ITEMS.filter((i) => i.a.fn === fn || i.b.fn === fn).length;
    expect(n).toBe(8);
  }
  TYPES_ITEMS.forEach((i) => expect(i.a.fn).not.toBe(i.b.fn));
  expect(new Set(TYPES_ITEMS.map((i) => i.id)).size).toBe(32);
});

test('always choosing Introverted Intuition makes it dominant', () => {
  const answers = TYPES_ITEMS.map((i) => (i.b.fn === 'Ni' ? 'b' : 'a'));
  const r = scoreTypes(answers, '2026-10-13');
  expect(r.dominant).toBe('Ni');
  expect(r.inferior).toBe('Se');
  expect(['Te', 'Fe']).toContain(r.auxiliary);
  expect(r.scores.Ni).toBe(100);
});

test('inferior function and codes', () => {
  expect(inferiorOf('Ni')).toBe('Se');
  expect(inferiorOf('Te')).toBe('Fi');
  expect(inferiorOf('Fe')).toBe('Ti');
  expect(inferiorOf('Si')).toBe('Ne');
  expect(codeFor('Ni', 'Te')).toBe('INTJ');
  expect(codeFor('Fe', 'Si')).toBe('ESFJ');
});

test('requires all 32 answers', () => expect(() => scoreTypes(['a', 'b'], '2026-10-13')).toThrow());
