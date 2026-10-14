import { DAY_HEADLINES, MOON_NOTES, RELATION_NOTES, dayAdvice, dayNotes, inline } from '@/content/dayNotes';
import { ANIMALS, relation } from '@/engines/chinese';
import { MOON_PHASES } from '@/engines/moon';

test('a headline and advice for every personal day 1–9', () => {
  for (let n = 1; n <= 9; n++) {
    expect(DAY_HEADLINES[n]).toMatch(/^A day for [a-z]+$/);
    // One strength (or a pair), then one caution, each in lower case after the lead-in.
    expect(dayAdvice(n)).toMatch(/^Best for [a-z][^.]+\. Watch for [a-z][^.]+\.$/);
    expect(dayAdvice(n)).not.toMatch(/ and .+ and .+ and /);
  }
  expect(dayAdvice(1)).toBe('Best for starting something new and taking the lead. Watch for impatience.');
  expect(dayAdvice(6)).toBe('Best for home and family. Watch for controlling through care.');
});

test('a short note for every moon phase', () => {
  for (const phase of MOON_PHASES) {
    expect(MOON_NOTES[phase].length).toBeGreaterThan(5);
    expect(MOON_NOTES[phase].length).toBeLessThanOrEqual(30);
  }
});

test('a note for every relation between two animals', () => {
  for (const a of ANIMALS) for (const b of ANIMALS) expect(RELATION_NOTES[relation(a, b)]).toBeTruthy();
});

test('dayNotes reads the day', () => {
  const notes = dayNotes({ personalDay: 1, moon: 'Waxing Crescent', userAnimal: 'Rooster', dayAnimal: 'Rooster' });
  expect(notes).toEqual({
    headline: 'A day for beginnings',
    advice: 'Best for starting something new and taking the lead. Watch for impatience.',
    moon: 'Nurture what you’ve started',
    relation: 'Your own sign returns',
  });
  expect(dayNotes({ personalDay: 4, moon: 'Full Moon', userAnimal: 'Rat', dayAnimal: 'Horse' }).relation).toBe(RELATION_NOTES.clash);
  expect(inline(notes.moon)).toBe('nurture what you’ve started');
});
