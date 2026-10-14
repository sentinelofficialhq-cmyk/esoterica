import { isVowelAt, letterValue, nameNumbers } from '@/engines/letterology';

test('pythagorean values', () =>
  expect(['A', 'I', 'J', 'R', 'S', 'Z'].map((c) => letterValue(c))).toEqual([1, 9, 1, 9, 1, 8]));

test('chaldean values', () =>
  expect(['A', 'F', 'O', 'Z', 'W'].map((c) => letterValue(c, 'chaldean'))).toEqual([1, 8, 7, 7, 6]));

test('Y rule', () => {
  expect(isVowelAt('MARY', 3)).toBe(true);
  expect(isVowelAt('LYNN', 1)).toBe(true);
  expect(isVowelAt('YOLANDA', 0)).toBe(false);
});

test('John Smith', () => {
  const n = nameNumbers('John Smith');
  expect(n.expression.display).toBe('44/8');
  expect(n.soulUrge.display).toBe('15/6');
  expect(n.personality.display).toBe('29/11');
  expect(n.hiddenPassion).toEqual([1, 8]);
  expect(n.karmicLessons).toEqual([3, 7]);
  expect([n.cornerstone, n.capstone, n.firstVowel]).toEqual(['J', 'N', 'O']);
});

test('accents are ignored', () =>
  expect(nameNumbers('José').expression.value).toBe(nameNumbers('Jose').expression.value));

test('chaldean John = 18/9', () => expect(nameNumbers('John', 'chaldean').expression.display).toBe('18/9'));

test('empty name throws', () => expect(() => nameNumbers('  ')).toThrow());
