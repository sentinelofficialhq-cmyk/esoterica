import { chineseScore, combine, compatibility, numberPairScore, westernScore } from '@/engines/compatibility';
import { buildProfile } from '@/engines/profile';

test('number pairs', () =>
  expect([[1, 1], [1, 5], [1, 4], [1, 3], [2, 6]].map(([a, b]) => numberPairScore(a, b))).toEqual([78, 88, 40, 62, 58]));

test('western', () => {
  expect(westernScore('Aries', 'Leo')).toBe(90);
  expect(westernScore('Aries', 'Cancer')).toBe(45);
  expect(westernScore('Aries', 'Libra')).toBe(62);
  expect(westernScore('Pisces', 'Aries')).toBe(55);
});

test('chinese with elements', () => {
  expect(
    chineseScore({ animal: 'Rat', element: 'Wood', polarity: 'Yang', ganzhi: '' }, { animal: 'Ox', element: 'Fire', polarity: 'Yin', ganzhi: '' }),
  ).toBe(100);
  expect(
    chineseScore({ animal: 'Tiger', element: 'Metal', polarity: 'Yang', ganzhi: '' }, { animal: 'Monkey', element: 'Wood', polarity: 'Yang', ganzhi: '' }),
  ).toBe(15);
});

test('combine', () => {
  expect(combine({ chinese: 95, numerology: 88, western: 90 })).toEqual({ overall: 91, label: 'Strong' });
  expect(combine({ chinese: 20, numerology: 40, western: 45 })).toEqual({ overall: 33, label: 'Friction' });
});

test('full pair: 1995-07-20 vs 1990-05-14', () => {
  const a = buildProfile({ name: 'A', birthDate: '1995-07-20' });
  const b = buildProfile({ name: 'B', birthDate: '1990-05-14' });
  expect(compatibility(a, b)).toMatchObject({
    chinese: 55, numerology: 55, western: 80, overall: 61, label: 'Mixed', chineseRelation: 'neutral',
  });
  expect(compatibility(b, a).overall).toBe(61); // symmetric
});
