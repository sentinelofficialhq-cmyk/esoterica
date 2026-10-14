import { Solar } from 'lunar-javascript';

import { parseYMD } from '@/lib/date';

export const ANIMALS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
] as const;
export type Animal = (typeof ANIMALS)[number];
export type CElement = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
export type ChineseSign = { animal: Animal; element: CElement; polarity: 'Yang' | 'Yin'; ganzhi: string };
export type Relation = 'secretFriend' | 'trine' | 'same' | 'neutral' | 'punishment' | 'harm' | 'clash';

const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const STEMS = '甲乙丙丁戊己庚辛壬癸';
const STEM_ELEMENT: CElement[] = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
const TRINES: Animal[][] = [
  ['Rat', 'Dragon', 'Monkey'], ['Ox', 'Snake', 'Rooster'], ['Tiger', 'Horse', 'Dog'], ['Rabbit', 'Goat', 'Pig'],
];
const SECRET_FRIENDS: Animal[][] = [
  ['Rat', 'Ox'], ['Tiger', 'Pig'], ['Rabbit', 'Dog'], ['Dragon', 'Rooster'], ['Snake', 'Monkey'], ['Horse', 'Goat'],
];
const HARMS: Animal[][] = [
  ['Rat', 'Goat'], ['Ox', 'Horse'], ['Tiger', 'Snake'], ['Rabbit', 'Dragon'], ['Monkey', 'Pig'], ['Rooster', 'Dog'],
];
const PUNISHMENTS: Animal[][] = [['Tiger', 'Snake', 'Monkey'], ['Ox', 'Goat', 'Dog'], ['Rat', 'Rabbit']];

const lunarOf = (date: string) => {
  const { y, m, d } = parseYMD(date);
  return Solar.fromYmd(y, m, d).getLunar();
};
const both = (groups: Animal[][], a: Animal, b: Animal) => groups.some((g) => g.includes(a) && g.includes(b));

/** Year sign by the Lunar New Year boundary (CUE's method), not Lichun. */
export function chineseSign(date: string): ChineseSign {
  const ganzhi = lunarOf(date).getYearInGanZhi();
  const stem = STEMS.indexOf(ganzhi[0]);
  return {
    animal: ANIMALS[BRANCHES.indexOf(ganzhi[1])],
    element: STEM_ELEMENT[stem],
    polarity: stem % 2 === 0 ? 'Yang' : 'Yin',
    ganzhi,
  };
}

export const dayAnimal = (date: string): Animal => ANIMALS[BRANCHES.indexOf(lunarOf(date).getDayInGanZhi()[1])];

export const isLunarNewYear = (date: string): boolean => lunarOf(date).getFestivals().includes('春节');

/** Strongest relation wins: secret friend > trine > clash > harm > punishment. */
export function relation(a: Animal, b: Animal): Relation {
  if (a === b) return 'same';
  if (both(SECRET_FRIENDS, a, b)) return 'secretFriend';
  if (both(TRINES, a, b)) return 'trine';
  if ((ANIMALS.indexOf(a) + 6) % 12 === ANIMALS.indexOf(b)) return 'clash';
  if (both(HARMS, a, b)) return 'harm';
  if (both(PUNISHMENTS, a, b)) return 'punishment';
  return 'neutral';
}

export function allies(a: Animal): Animal[] {
  const trine = TRINES.find((t) => t.includes(a))!.filter((x) => x !== a);
  const friend = SECRET_FRIENDS.find((p) => p.includes(a))!.find((x) => x !== a)!;
  return [...trine, friend];
}

export const enemy = (a: Animal): Animal => ANIMALS[(ANIMALS.indexOf(a) + 6) % 12];
