import { NEVILLE_PRACTICES, NEVILLE_TEACHINGS, practiceById } from '@/content/neville';
import { MIND_BY_NUMBER, mindFor, SCRIPTURE, verseById, verseOfDay } from '@/content/scripture';

test('every verse has a unique id, an exact reference, text and a mystical reading', () => {
  const ids = SCRIPTURE.map((v) => v.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const v of SCRIPTURE) {
    expect(v.ref).toMatch(/^[1-3]? ?[A-Z][a-z]+ \d+:\d+(–\d+)?$/);
    expect(v.text.length).toBeGreaterThan(20);
    expect(v.reading.length).toBeGreaterThan(40);
    expect(v.tags.length).toBeGreaterThan(0);
    if (v.excerpt) expect(v.text).toContain(v.excerpt.replace(/…$/, ''));
  }
});

test('the core manifestation verses are quoted exactly (KJV)', () => {
  expect(verseById('mark-11-24').text).toBe('Therefore I say unto you, What things soever ye desire, when ye pray, believe that ye receive them, and ye shall have them.');
  expect(verseById('exodus-3-14').text).toContain('I AM THAT I AM');
  expect(verseById('luke-17-21').text).toContain('the kingdom of God is within you');
});

test('every root and master number has a verse and a practice', () => {
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
    const m = MIND_BY_NUMBER[n];
    expect(verseById(m.verse)).toBeDefined();
    expect(practiceById(m.practice)).toBeDefined();
    expect(m.theme.length).toBeGreaterThan(3);
  }
  expect(mindFor(29).verse).toBe(MIND_BY_NUMBER[11].verse);
});

test('verse of the day is stable for a date and drawn from the number’s theme', () => {
  expect(verseOfDay('2026-10-14', 1).id).toBe(verseOfDay('2026-10-14', 1).id);
  const picks = new Set(['2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18'].map((d) => verseOfDay(d, 7).id));
  for (const id of picks) expect(verseById(id).tags).toContain(MIND_BY_NUMBER[7].theme);
});

test('Neville practices are complete and carry a caution', () => {
  expect(NEVILLE_PRACTICES.map((p) => p.id).sort()).toEqual(['diet', 'end', 'iam', 'revision', 'scene']);
  for (const p of NEVILLE_PRACTICES) {
    expect(p.steps.length).toBeGreaterThanOrEqual(3);
    expect(p.caution.length).toBeGreaterThan(30);
    expect(p.when.length).toBeGreaterThan(5);
  }
  expect(NEVILLE_TEACHINGS.length).toBeGreaterThanOrEqual(6);
});
