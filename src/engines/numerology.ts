import { parseYMD } from '@/lib/date';

const MASTER = [11, 22, 33];
const KARMIC = [13, 14, 16, 19];

export type Reduced = {
  /** First sum, e.g. 28. */
  compound: number;
  /** Final value: 1–9, or a master number 11/22/33. */
  value: number;
  /** Always 1–9 (11→2, 22→4, 33→6); used for comparisons. */
  root: number;
  master: boolean;
  karmicDebt: number | null;
  /** "28/1", "29/11", "22", "7" */
  display: string;
};

const sumDigits = (n: number): number => String(n).split('').reduce((a, ch) => a + Number(ch), 0);
const digitTotal = (s: string): number =>
  s.replace(/\D/g, '').split('').reduce((a, ch) => a + Number(ch), 0);

/** Reduce to a single digit, stopping at master numbers and noting karmic debt on the way. */
export function reduce(n: number): Reduced {
  const chain = [n];
  let v = n;
  while (v > 9 && !MASTER.includes(v)) {
    v = sumDigits(v);
    chain.push(v);
  }
  const master = MASTER.includes(v);
  return {
    compound: n,
    value: v,
    root: master ? sumDigits(v) : v,
    master,
    karmicDebt: chain.find((x) => KARMIC.includes(x)) ?? null,
    display: v === n ? String(v) : `${n}/${v}`,
  };
}

/** GG33/CUE style: add every digit of the birth date. */
export function lifePath(birth: string): Reduced {
  parseYMD(birth);
  return reduce(digitTotal(birth));
}

export function birthdayNumber(birth: string): Reduced {
  return reduce(parseYMD(birth).d);
}

export function attitudeNumber(birth: string): Reduced {
  const { m, d } = parseYMD(birth);
  return reduce(m + d);
}

export function personalYear(birth: string, year: number): Reduced {
  const { m, d } = parseYMD(birth);
  return reduce(sumDigits(m) + sumDigits(d) + sumDigits(year));
}

export function personalMonth(birth: string, year: number, month: number): Reduced {
  return reduce(personalYear(birth, year).root + month);
}

export function personalDay(birth: string, date: string): Reduced {
  const { y, m, d } = parseYMD(date);
  return reduce(personalMonth(birth, y, m).root + d);
}

export function universalDay(date: string): Reduced {
  parseYMD(date);
  return reduce(digitTotal(date));
}

export function luckyNumbers(birth: string): number[] {
  return [...new Set([lifePath(birth).root, birthdayNumber(birth).root, attitudeNumber(birth).root])];
}
