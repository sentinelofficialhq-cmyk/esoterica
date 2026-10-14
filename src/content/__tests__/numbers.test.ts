import { DAY_GUIDANCE } from '@/content/dayGuidance';
import { KARMIC_MEANINGS, LOVE_AND_WORK, NUMBER_MEANINGS, loveAndWork, meaningFor } from '@/content/numbers';

test('every root and master number has a full meaning', () => {
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
    const m = NUMBER_MEANINGS[n];
    expect(m).toBeDefined();
    expect(m.title.length).toBeGreaterThan(0);
    expect(m.keywords.length).toBeGreaterThanOrEqual(3);
    for (const field of [m.light, m.shadow, m.jungNote]) expect(field.length).toBeGreaterThan(20);
  }
});

test('karmic debt numbers have lessons', () => {
  for (const n of [13, 14, 16, 19]) expect(KARMIC_MEANINGS[n].lesson.length).toBeGreaterThan(20);
});

test('meaningFor falls back to the root', () => {
  expect(meaningFor(11).n).toBe(11);
  expect(meaningFor(5).n).toBe(5);
});

test('day guidance covers personal days 1–9', () => {
  for (let n = 1; n <= 9; n++) {
    const g = DAY_GUIDANCE[n];
    expect(g.bestFor.length).toBeGreaterThanOrEqual(2);
    expect(g.watchOut.length).toBeGreaterThanOrEqual(1);
    expect(g.reflection.length).toBeGreaterThan(20);
  }
});

test('love and career guidance covers every root and master number', () => {
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) {
    expect(LOVE_AND_WORK[n].love.length).toBeGreaterThan(60);
    expect(LOVE_AND_WORK[n].career.length).toBeGreaterThan(60);
  }
  expect(loveAndWork(29).love).toBe(LOVE_AND_WORK[11].love);
});
