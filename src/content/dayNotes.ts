import { DAY_GUIDANCE } from '@/content/dayGuidance';
import { relation, type Animal, type Relation } from '@/engines/chinese';
import type { MoonPhaseName } from '@/engines/moon';

/** A one-line headline for each personal day 1–9 (Home's energy card in the calm looks). */
export const DAY_HEADLINES: Record<number, string> = {
  1: 'A day for beginnings',
  2: 'A day for partnership',
  3: 'A day for expression',
  4: 'A day for building',
  5: 'A day for change',
  6: 'A day for care',
  7: 'A day for reflection',
  8: 'A day for results',
  9: 'A day for completion',
};

/** Short forms of MOON_GUIDANCE that fit a tile or a ledger row. */
export const MOON_NOTES: Record<MoonPhaseName, string> = {
  'New Moon': 'Set an intention',
  'Waxing Crescent': 'Nurture what you’ve started',
  'First Quarter': 'Decide, then push through',
  'Waxing Gibbous': 'Refine and build',
  'Full Moon': 'Things come to light',
  'Waning Gibbous': 'Share what you’ve learned',
  'Last Quarter': 'Let go of what isn’t working',
  'Waning Crescent': 'Rest and reflect',
};

/** What today's animal means for the user's own, keyed by relation(userAnimal, dayAnimal). */
export const RELATION_NOTES: Record<Relation, string> = {
  same: 'Your own sign returns',
  secretFriend: 'A secret friend is on your side',
  trine: 'An ally sign lends support',
  neutral: 'A neutral day for your sign',
  punishment: 'A testing sign: go gently',
  harm: 'A harm sign: mind small frictions',
  clash: 'Your clash sign: move with care',
};

/** Lower-cases the first letter, for a note that follows a value ("Waxing Crescent · nurture what you’ve started"). */
export const inline = (note: string): string => note.charAt(0).toLowerCase() + note.slice(1);

/**
 * One line of advice from DAY_GUIDANCE: the first and last of what the day is best for (only the first
 * when either already pairs two things, as in "Home and family"), then the last thing to watch for.
 */
export function dayAdvice(personalDay: number): string {
  const { bestFor, watchOut } = DAY_GUIDANCE[personalDay] ?? DAY_GUIDANCE[1];
  const first = bestFor[0];
  const last = bestFor[bestFor.length - 1];
  const paired = last !== first && ![first, last].some((x) => x.includes(' and '));
  const best = paired ? `${first} and ${inline(last)}` : first;
  return `Best for ${inline(best)}. Watch for ${inline(watchOut[watchOut.length - 1])}.`;
}

export type DayNotes = { headline: string; advice: string; moon: string; relation: string };

/** Home's short notes for a day: the personal-day headline and advice, the moon phase and the day animal. */
export function dayNotes(day: { personalDay: number; moon: MoonPhaseName; userAnimal: Animal; dayAnimal: Animal }): DayNotes {
  return {
    headline: DAY_HEADLINES[day.personalDay] ?? DAY_HEADLINES[1],
    advice: dayAdvice(day.personalDay),
    moon: MOON_NOTES[day.moon],
    relation: RELATION_NOTES[relation(day.userAnimal, day.dayAnimal)],
  };
}
