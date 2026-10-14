import { reduce, type Reduced } from '@/engines/numerology';

/** "11:11" → core 11 (master); "1212" → 12/3; "333" → 3; anything else → its digit sum. */
export function numberMeaning(raw: string): { raw: string; core: number; reduced: Reduced } {
  const digits = raw.replace(/\D/g, '');
  for (let len = 1; len <= digits.length / 2; len++) {
    let block = digits.slice(0, len);
    if (digits.length % len === 0 && block.repeat(digits.length / len) === digits) {
      // An even run of 1s, 2s or 3s ("11:11", "2222") reads as the master number 11/22/33.
      if (len === 1 && digits.length % 2 === 0 && '123'.includes(block)) block = block + block;
      return { raw, core: Number(block), reduced: reduce(Number(block)) };
    }
  }
  const sum = digits.split('').reduce((a, ch) => a + Number(ch), 0);
  return { raw, core: sum, reduced: reduce(sum) };
}

export const numbersIn = (text: string) => (text.match(/\d+(?::\d+)?/g) ?? []).map(numberMeaning);

/** How often each number has been logged, most frequent first. */
export function frequentNumbers(entries: string[][]): [string, number][] {
  const counts = new Map<string, number>();
  for (const nums of entries) for (const n of new Set(nums)) counts.set(n, (counts.get(n) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
