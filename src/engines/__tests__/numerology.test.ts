import {
  attitudeNumber,
  birthdayNumber,
  lifePath,
  luckyNumbers,
  personalDay,
  personalMonth,
  personalYear,
  reduce,
  universalDay,
} from '@/engines/numerology';

describe('reduce', () => {
  test('keeps master numbers', () => {
    expect(reduce(29)).toMatchObject({ value: 11, root: 2, master: true, display: '29/11' });
    expect(reduce(22)).toMatchObject({ value: 22, root: 4, master: true, display: '22' });
  });

  test('flags karmic debt anywhere in the chain', () => {
    expect(reduce(13)).toMatchObject({ value: 4, karmicDebt: 13, display: '13/4' });
    expect(reduce(49)).toMatchObject({ value: 4, karmicDebt: 13 }); // 49 → 13 → 4
    expect(reduce(28).karmicDebt).toBeNull();
  });
});

test.each([
  ['1976-04-01', '28/1'], // Apple (CUE University)
  ['1994-07-05', '35/8'], // Amazon
  ['1850-03-18', '26/8'], // American Express
  ['1922-10-18', '24/6'], // BBC
  ['2009-01-03', '15/6'], // Bitcoin
  ['1916-03-07', '27/9'], // BMW
  ['1850-09-09', '32/5'], // California
  ['1949-10-01', '25/7'], // China
  ['1990-05-14', '29/11'], // CUE homepage sample
  ['1995-08-01', '33'], // master 33
])('life path %s → %s', (birth, display) => expect(lifePath(birth).display).toBe(display));

test('birthday and attitude numbers', () => {
  expect(birthdayNumber('1985-11-29').display).toBe('29/11');
  expect(birthdayNumber('1990-05-14')).toMatchObject({ value: 5, karmicDebt: 14 });
  expect(attitudeNumber('1976-04-01').value).toBe(5);
});

test('personal cycles for 1976-04-01 on 2026-10-13', () => {
  expect(personalYear('1976-04-01', 2026).value).toBe(6);
  expect(personalMonth('1976-04-01', 2026, 10).value).toBe(7);
  expect(personalDay('1976-04-01', '2026-10-13').value).toBe(2);
  expect(universalDay('2026-10-13').value).toBe(6);
});

test('lucky numbers are unique roots', () => expect(luckyNumbers('1976-04-01')).toEqual([1, 5]));

test('rejects malformed dates', () => expect(() => lifePath('1976-4-1')).toThrow());
