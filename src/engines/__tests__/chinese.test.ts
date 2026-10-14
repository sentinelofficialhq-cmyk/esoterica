import { allies, chineseSign, dayAnimal, enemy, isLunarNewYear, relation } from '@/engines/chinese';

test.each([
  ['1990-05-14', 'Horse', 'Metal', 'Yang'],
  ['1995-07-20', 'Pig', 'Wood', 'Yin'],
  ['1976-04-01', 'Dragon', 'Fire', 'Yang'],
  ['1875-07-26', 'Pig', 'Wood', 'Yin'],
  ['2024-02-09', 'Rabbit', 'Water', 'Yin'],
  ['2024-02-10', 'Dragon', 'Wood', 'Yang'],
  ['2026-02-16', 'Snake', 'Wood', 'Yin'],
  ['2026-02-17', 'Horse', 'Fire', 'Yang'],
])('%s → %s %s %s', (date, animal, element, polarity) =>
  expect(chineseSign(date)).toMatchObject({ animal, element, polarity }));

test('day animal (lunar-javascript docs: 2019-05-01 is a 戊戌 Dog day)', () =>
  expect(dayAnimal('2019-05-01')).toBe('Dog'));

test('lunar new year', () => {
  expect(isLunarNewYear('2024-02-10')).toBe(true);
  expect(isLunarNewYear('2024-02-09')).toBe(false);
});

test('relations with precedence', () => {
  expect(relation('Rat', 'Ox')).toBe('secretFriend');
  expect(relation('Rat', 'Monkey')).toBe('trine');
  expect(relation('Tiger', 'Monkey')).toBe('clash');
  expect(relation('Ox', 'Goat')).toBe('clash');
  expect(relation('Tiger', 'Snake')).toBe('harm');
  expect(relation('Ox', 'Dog')).toBe('punishment');
  expect(relation('Rat', 'Rabbit')).toBe('punishment');
  expect(relation('Dragon', 'Dragon')).toBe('same');
  expect(relation('Rat', 'Tiger')).toBe('neutral');
});

test('allies and enemy', () => {
  expect(allies('Rat')).toEqual(['Dragon', 'Monkey', 'Ox']);
  expect(enemy('Rat')).toBe('Horse');
});
