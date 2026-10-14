import { LETTER_MEANINGS } from '@/content/letters';
import { letterValue } from '@/engines/letterology';

test('A–Z all present with pythagorean values', () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (const letter of letters) {
    const m = LETTER_MEANINGS[letter];
    expect(m).toBeDefined();
    expect(m.value).toBe(letterValue(letter));
    expect(m.traits.length).toBeGreaterThanOrEqual(3);
    expect(m.asCornerstone.length).toBeGreaterThan(20);
  }
});
