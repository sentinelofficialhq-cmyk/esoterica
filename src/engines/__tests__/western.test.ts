import { signDistance, signInfo, sunSign } from '@/engines/western';

test.each([
  ['1976-04-01', 'Aries'],
  ['1990-05-14', 'Taurus'],
  ['1995-07-20', 'Cancer'],
  ['1875-07-26', 'Leo'],
  ['2000-01-01', 'Capricorn'],
  ['1985-11-29', 'Sagittarius'],
])('%s is %s', (date, sign) => expect(sunSign(date).sign).toBe(sign));

test('sign facts', () =>
  expect(signInfo('Leo')).toMatchObject({ element: 'Fire', modality: 'Fixed', ruler: 'Sun', polarity: 'Yang' }));

test('cusp flag on the 2026 March equinox', () => expect(sunSign('2026-03-20').cuspWith).not.toBeNull());

test('no cusp mid-sign', () => expect(sunSign('1990-05-14').cuspWith).toBeNull());

test('distance', () => {
  expect(signDistance('Aries', 'Leo')).toBe(4);
  expect(signDistance('Pisces', 'Aries')).toBe(1);
});
