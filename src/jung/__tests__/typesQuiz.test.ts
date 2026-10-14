import { FUNCTIONS, type Fn } from '@/content/functions';
import { codeFor, inferiorOf, itemsFor, QUICK_ITEMS, scoreTypes, TYPES_ITEMS, type TypesAnswer } from '@/jung/typesQuiz';

const EXTRAVERTED: Fn[] = ['Te', 'Fe', 'Se', 'Ne'];
const appearances = (items: typeof TYPES_ITEMS, fn: Fn) => items.filter((i) => i.a.fn === fn || i.b.fn === fn).length;
/** Pick `fn` whenever it is offered, otherwise `fallback`. */
const always = (items: typeof TYPES_ITEMS, fn: Fn, fallback: TypesAnswer = 'a'): TypesAnswer[] =>
  items.map((i) => (i.a.fn === fn ? 'a' : i.b.fn === fn ? 'b' : fallback));

test('32 balanced items: every function exactly 8 times, never against itself', () => {
  expect(TYPES_ITEMS).toHaveLength(32);
  for (const fn of FUNCTIONS) expect(appearances(TYPES_ITEMS, fn)).toBe(8);
  TYPES_ITEMS.forEach((i) => expect(i.a.fn).not.toBe(i.b.fn));
  expect(new Set(TYPES_ITEMS.map((i) => i.id)).size).toBe(32);
});

test('the quick read: 10 distinct items, every function 2 or 3 times, 10 slots per attitude', () => {
  expect(QUICK_ITEMS).toHaveLength(10);
  expect(new Set(QUICK_ITEMS.map((i) => i.id)).size).toBe(10);
  QUICK_ITEMS.forEach((i) => expect(TYPES_ITEMS).toContain(i));
  for (const fn of FUNCTIONS) expect([2, 3]).toContain(appearances(QUICK_ITEMS, fn));
  const extravertedSlots = QUICK_ITEMS.flatMap((i) => [i.a.fn, i.b.fn]).filter((f) => EXTRAVERTED.includes(f)).length;
  expect(extravertedSlots).toBe(10);
  expect(itemsFor('quick')).toBe(QUICK_ITEMS);
  expect(itemsFor('full')).toBe(TYPES_ITEMS);
});

test('no item labels the person with two unflattering options', () => {
  const t30 = TYPES_ITEMS.find((i) => i.id === 't30')!;
  expect(t30.prompt).not.toMatch(/others sometimes see you/i);
  expect(`${t30.a.text} ${t30.b.text}`).not.toMatch(/detached|intensely/i);
});

test('always choosing Introverted Intuition makes it dominant', () => {
  const r = scoreTypes(always(TYPES_ITEMS, 'Ni'), '2026-10-13');
  expect(r.dominant).toBe('Ni');
  expect(r.inferior).toBe('Se');
  expect(['Te', 'Fe']).toContain(r.auxiliary);
  expect(r.scores.Ni).toBe(100);
  expect(r.depth).toBe('full');
});

test('quick read: a function chosen every time it is offered scores 100, however often it appears', () => {
  // Ti appears twice and Te three times in the quick set; both are picked every time they are offered.
  const answers = QUICK_ITEMS.map((i): TypesAnswer => (i.a.fn === 'Ti' || i.a.fn === 'Te' ? 'a' : i.b.fn === 'Ti' || i.b.fn === 'Te' ? 'b' : 'neither'));
  const r = scoreTypes(answers, '2026-10-14', 'quick');
  expect(appearances(QUICK_ITEMS, 'Ti')).toBe(2);
  expect(appearances(QUICK_ITEMS, 'Te')).toBe(3);
  expect(r.depth).toBe('quick');
  // t5 sets Te against Ti, so neither can be chosen every time; each is chosen whenever the other is absent.
  expect(r.scores.Te + r.scores.Ti).toBeGreaterThan(100);
  const q = scoreTypes(always(QUICK_ITEMS, 'Ni', 'neither'), '2026-10-14', 'quick');
  expect(q.dominant).toBe('Ni');
  expect(q.scores.Ni).toBe(100);
});

test('"Neither" counts as offered but not chosen, and many of them lower confidence', () => {
  const allNeither = scoreTypes(TYPES_ITEMS.map(() => 'neither'), '2026-10-14');
  expect(Object.values(allNeither.scores).every((s) => s === 0)).toBe(true);
  expect(allNeither.confidence).toBe('low');

  // Ni chosen whenever offered and everything else "neither": a clear lead, but under 60% decisive.
  const mostlyNeither = scoreTypes(always(TYPES_ITEMS, 'Ni', 'neither'), '2026-10-14');
  expect(mostlyNeither.dominant).toBe('Ni');
  expect(mostlyNeither.confidence).toBe('low');
});

test('confidence: high needs the full quiz, mostly decisive answers and a clear lead; quick tops out at medium', () => {
  // Choose Fe whenever offered and alternate otherwise, so no rival climbs near Fe (next best: Si at 75).
  const fe = (items: typeof TYPES_ITEMS) => items.map((i, k): TypesAnswer => (i.a.fn === 'Fe' ? 'a' : i.b.fn === 'Fe' ? 'b' : k % 2 ? 'a' : 'b'));
  const full = scoreTypes(fe(TYPES_ITEMS), '2026-10-14');
  expect(full.dominant).toBe('Fe');
  expect(full.scores.Fe - Math.max(...FUNCTIONS.filter((f) => f !== 'Fe').map((f) => full.scores[f]))).toBeGreaterThanOrEqual(25);
  expect(full.confidence).toBe('high');

  // The same pattern on the quick read ties Fe with Si: a level result is low confidence, never high.
  const quick = scoreTypes(fe(QUICK_ITEMS), '2026-10-14', 'quick');
  expect(quick.scores.Fe).toBe(quick.scores.Si);
  expect(quick.confidence).toBe('low');
});

test('inferior function and codes', () => {
  expect(inferiorOf('Ni')).toBe('Se');
  expect(inferiorOf('Te')).toBe('Fi');
  expect(inferiorOf('Fe')).toBe('Ti');
  expect(inferiorOf('Si')).toBe('Ne');
  expect(codeFor('Ni', 'Te')).toBe('INTJ');
  expect(codeFor('Fe', 'Si')).toBe('ESFJ');
});

test('requires an answer for every question of the chosen depth', () => {
  expect(() => scoreTypes(['a', 'b'], '2026-10-13')).toThrow();
  expect(() => scoreTypes(TYPES_ITEMS.map(() => 'a'), '2026-10-13', 'quick')).toThrow();
  expect(() => scoreTypes(QUICK_ITEMS.map(() => 'a'), '2026-10-13', 'quick')).not.toThrow();
});
