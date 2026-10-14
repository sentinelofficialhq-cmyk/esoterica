import { addDays, parseYMD } from '@/lib/date';
import { hash } from '@/lib/hash';

test('parses valid dates', () => expect(parseYMD('1976-04-01')).toEqual({ y: 1976, m: 4, d: 1 }));

test('rejects impossible or malformed dates', () => {
  expect(() => parseYMD('2026-02-30')).toThrow();
  expect(() => parseYMD('1976-4-1')).toThrow();
});

test('adds days across year end and leap day', () => {
  expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
});

test('hash is stable', () => {
  expect(hash('2026-10-13')).toBe(hash('2026-10-13'));
  expect(hash('2026-10-13')).not.toBe(hash('2026-10-14'));
});

test('long names, ordinals and week starts', () => {
  const { weekdayLong, monthLong, ordinal, weekStart } = require('@/lib/date');
  expect(weekdayLong('2026-10-14')).toBe('Wednesday');
  expect(monthLong(10)).toBe('October');
  expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 31].map(ordinal)).toEqual(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '23rd', '31st']);
  expect(weekStart('2026-10-14')).toBe('2026-10-12');
  expect(weekStart('2026-10-18')).toBe('2026-10-12');
  expect(weekStart('2026-10-12')).toBe('2026-10-12');
});
