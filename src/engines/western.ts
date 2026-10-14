import * as Astronomy from 'astronomy-engine';

import { noonUTC } from '@/lib/date';

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;
export type Sign = (typeof SIGNS)[number];
export type WElement = 'Fire' | 'Earth' | 'Air' | 'Water';
export type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

const ELEMENTS: WElement[] = ['Fire', 'Earth', 'Air', 'Water'];
const MODALITIES: Modality[] = ['Cardinal', 'Fixed', 'Mutable'];
const RULERS: Record<Sign, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun', Virgo: 'Mercury',
  Libra: 'Venus', Scorpio: 'Pluto', Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};
export const GLYPHS: Record<Sign, string> = {
  Aries: '♈︎', Taurus: '♉︎', Gemini: '♊︎', Cancer: '♋︎', Leo: '♌︎', Virgo: '♍︎',
  Libra: '♎︎', Scorpio: '♏︎', Sagittarius: '♐︎', Capricorn: '♑︎', Aquarius: '♒︎', Pisces: '♓︎',
};

export type WesternSign = {
  sign: Sign;
  element: WElement;
  modality: Modality;
  ruler: string;
  polarity: 'Yang' | 'Yin';
  glyph: string;
  cuspWith: Sign | null;
};

export function signInfo(sign: Sign, cuspWith: Sign | null = null): WesternSign {
  const i = SIGNS.indexOf(sign);
  const element = ELEMENTS[i % 4];
  return {
    sign,
    element,
    modality: MODALITIES[i % 3],
    ruler: RULERS[sign],
    polarity: element === 'Fire' || element === 'Air' ? 'Yang' : 'Yin',
    glyph: GLYPHS[sign],
    cuspWith,
  };
}

/** Tropical Sun sign from the Sun's ecliptic longitude at 12:00 UTC; within 1° of a boundary = cusp. */
export function sunSign(date: string): WesternSign {
  const elon = Astronomy.SunPosition(noonUTC(date)).elon;
  const i = Math.floor(elon / 30) % 12;
  const within = elon - i * 30;
  const cusp = within < 1 ? SIGNS[(i + 11) % 12] : within > 29 ? SIGNS[(i + 1) % 12] : null;
  return signInfo(SIGNS[i], cusp);
}

export function signDistance(a: Sign, b: Sign): number {
  const d = Math.abs(SIGNS.indexOf(a) - SIGNS.indexOf(b));
  return Math.min(d, 12 - d);
}
