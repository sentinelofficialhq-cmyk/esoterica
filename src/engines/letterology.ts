import { reduce, type Reduced } from '@/engines/numerology';

export type LetterSystem = 'pythagorean' | 'chaldean';

const CHALDEAN: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1, B: 2, K: 2, R: 2, C: 3, G: 3, L: 3, S: 3, D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5, U: 6, V: 6, W: 6, O: 7, Z: 7, F: 8, P: 8,
};
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export function letterValue(letter: string, system: LetterSystem = 'pythagorean'): number {
  const c = letter.toUpperCase();
  if (system === 'chaldean') return CHALDEAN[c] ?? 0;
  const i = c.charCodeAt(0) - 65;
  return i >= 0 && i < 26 ? (i % 9) + 1 : 0;
}

/** Y is a vowel unless the next letter is a vowel (Mary, Lynn → vowel; Yolanda → consonant). */
export function isVowelAt(word: string, i: number): boolean {
  const c = word[i];
  if (VOWELS.has(c)) return true;
  if (c !== 'Y') return false;
  const next = word[i + 1];
  return !(next !== undefined && VOWELS.has(next));
}

/** Upper-case A–Z words with accents stripped. */
export function nameWords(name: string): string[] {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .split(/[^A-Z]+/)
    .filter(Boolean);
}

export type NameNumbers = {
  expression: Reduced;
  soulUrge: Reduced;
  personality: Reduced;
  hiddenPassion: number[];
  karmicLessons: number[];
  cornerstone: string;
  capstone: string;
  firstVowel: string;
};

export function nameNumbers(fullName: string, system: LetterSystem = 'pythagorean'): NameNumbers {
  const words = nameWords(fullName);
  if (words.length === 0) throw new Error('Name has no letters');
  let all = 0;
  let vowels = 0;
  let consonants = 0;
  const counts = new Array<number>(10).fill(0);
  for (const w of words) {
    for (let i = 0; i < w.length; i++) {
      const v = letterValue(w[i], system);
      all += v;
      counts[v] += 1;
      if (isVowelAt(w, i)) vowels += v;
      else consonants += v;
    }
  }
  // Chaldean has no letter worth 9, so 9 can never be a lesson there.
  const range = system === 'chaldean' ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const max = Math.max(...range.map((n) => counts[n]));
  const first = words[0];
  const fv = [...first].findIndex((_, i) => isVowelAt(first, i));
  return {
    expression: reduce(all),
    soulUrge: reduce(vowels),
    personality: reduce(consonants),
    hiddenPassion: range.filter((n) => counts[n] === max),
    karmicLessons: range.filter((n) => counts[n] === 0),
    cornerstone: first[0],
    capstone: first[first.length - 1],
    firstVowel: fv >= 0 ? first[fv] : '',
  };
}
