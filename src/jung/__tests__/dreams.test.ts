import { topSymbols } from '@/jung/dreams';
import type { Dream } from '@/jung/types';

const dream = (symbols: string[], tags: string[] = []): Dream => ({
  id: Math.random().toString(),
  date: '2026-10-13',
  title: 't',
  text: 'x',
  mood: 3,
  tags,
  lucid: false,
  recurring: false,
  symbols,
  figures: [],
  themes: [],
});

test('counts symbols and tags case-insensitively, most frequent first', () => {
  const result = topSymbols([dream(['Water', 'house']), dream(['water'], ['Snake']), dream(['snake', 'WATER'])]);
  expect(result).toEqual([
    ['water', 3],
    ['snake', 2],
    ['house', 1],
  ]);
});

test('a symbol counts once per dream', () => {
  expect(topSymbols([dream(['sea', 'Sea'], ['sea'])])).toEqual([['sea', 1]]);
});
