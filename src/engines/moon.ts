import * as Astronomy from 'astronomy-engine';

import { addDays, localYMD, noonUTC, parseYMD } from '@/lib/date';

export const MOON_PHASES = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent',
] as const;
export type MoonPhaseName = (typeof MOON_PHASES)[number];
export type MoonEvent = { date: string; kind: 'newMoon' | 'firstQuarter' | 'fullMoon' | 'lastQuarter' };

const QUARTER_KIND = ['newMoon', 'firstQuarter', 'fullMoon', 'lastQuarter'] as const;

export function moonPhaseName(date: string): MoonPhaseName {
  // 0 = new, 90 = first quarter, 180 = full, 270 = last quarter
  const angle = Astronomy.MoonPhase(noonUTC(date));
  return MOON_PHASES[Math.floor(((angle + 22.5) % 360) / 45)];
}

/** Quarter events whose date (local by default) falls in [start, start + days). */
export function moonEvents(start: string, days: number, toDate: (d: Date) => string = localYMD): MoonEvent[] {
  const end = addDays(start, days);
  const { y, m, d } = parseYMD(addDays(start, -1));
  let q = Astronomy.SearchMoonQuarter(new Date(Date.UTC(y, m - 1, d)));
  const out: MoonEvent[] = [];
  for (let i = 0; i < Math.ceil(days / 7) + 4; i++) {
    const date = toDate(q.time.date);
    if (date >= end) break;
    if (date >= start) out.push({ date, kind: QUARTER_KIND[q.quarter] });
    q = Astronomy.NextMoonQuarter(q);
  }
  return out;
}
