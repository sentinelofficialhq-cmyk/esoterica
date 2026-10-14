import { ENTITIES, entityById, type EntityCategory } from '@/data/entities';
import { lifePath } from '@/engines/numerology';
import { parseYMD } from '@/lib/date';

const count = (...cats: EntityCategory[]) => ENTITIES.filter((e) => cats.includes(e.category)).length;

test('at least 300 entries, valid dates, unique ids', () => {
  expect(ENTITIES.length).toBeGreaterThanOrEqual(300);
  ENTITIES.forEach((e) => {
    expect(() => parseYMD(e.date)).not.toThrow();
    expect(e.date >= '1600-01-01').toBe(true);
    expect(e.note.length).toBeGreaterThan(3);
  });
  expect(new Set(ENTITIES.map((e) => e.id)).size).toBe(ENTITIES.length);
});

test('category minimums', () => {
  expect(count('country')).toBeGreaterThanOrEqual(30);
  expect(count('city')).toBeGreaterThanOrEqual(40);
  expect(count('brand', 'company')).toBeGreaterThanOrEqual(60);
  expect(count('car')).toBeGreaterThanOrEqual(30);
  expect(count('celebrity')).toBeGreaterThanOrEqual(60);
  expect(count('event')).toBeGreaterThanOrEqual(20);
});

test.each([
  ['apple', '1976-04-01', '28/1'],
  ['amazon', '1994-07-05', '35/8'],
  ['american-express', '1850-03-18', '26/8'],
  ['bbc', '1922-10-18', '24/6'],
  ['bitcoin', '2009-01-03', '15/6'],
  ['bmw', '1916-03-07', '27/9'],
  ['california', '1850-09-09', '32/5'],
  ['china', '1949-10-01', '25/7'],
])("CUE's published example %s", (id, date, display) => {
  const e = entityById(id);
  expect(e?.date).toBe(date);
  expect(lifePath(date).display).toBe(display);
});
