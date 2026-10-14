import { relation, type Relation } from '@/engines/chinese';
import type { MoonPhaseName } from '@/engines/moon';
import type { Profile } from '@/engines/profile';
import { forecast, type DayEnergy } from '@/engines/timing';

export const INTENTS = {
  start: 'Start or launch',
  sign: 'Sign or commit',
  move: 'Travel or move',
  love: 'Meet or connect',
  rest: 'Rest or reflect',
} as const;
export type Intent = keyof typeof INTENTS;

const WAXING: MoonPhaseName[] = ['Waxing Crescent', 'First Quarter', 'Waxing Gibbous'];
const WANING: MoonPhaseName[] = ['Waning Gibbous', 'Last Quarter', 'Waning Crescent'];

export function intentBonus(
  intent: Intent,
  d: { personalDay: number; moon: MoonPhaseName; rel: Relation },
): { delta: number; reasons: string[] } {
  const r: [number, string][] = [];
  const ally = d.rel === 'secretFriend' || d.rel === 'trine';
  if (intent === 'start') {
    if (d.personalDay === 1) r.push([8, 'Personal day 1: beginnings']);
    if (d.moon === 'New Moon') r.push([6, 'New Moon: seed time']);
    else if (WAXING.includes(d.moon)) r.push([3, 'Waxing Moon: building']);
    if (ally) r.push([5, 'Ally day']);
    if (d.rel === 'clash') r.push([-10, 'Clash day']);
  } else if (intent === 'sign') {
    if (d.personalDay === 4 || d.personalDay === 8) r.push([6, `Personal day ${d.personalDay}: structure and commitment`]);
    if (ally) r.push([6, 'Ally day']);
    if (d.rel === 'clash') r.push([-12, 'Clash day']);
    if (d.moon === 'Full Moon') r.push([-2, 'Full Moon: emotions run high']);
  } else if (intent === 'move') {
    if (d.personalDay === 5) r.push([8, 'Personal day 5: change and motion']);
    if (ally) r.push([5, 'Ally day']);
    if (d.rel === 'clash') r.push([-10, 'Clash day']);
  } else if (intent === 'love') {
    if (d.personalDay === 2 || d.personalDay === 6) r.push([8, `Personal day ${d.personalDay}: connection`]);
    if (d.moon === 'Full Moon') r.push([3, 'Full Moon: feelings surface']);
    if (d.rel === 'secretFriend') r.push([6, 'Secret-friend day']);
    else if (d.rel === 'trine') r.push([3, 'Ally day']);
    if (d.rel === 'clash') r.push([-8, 'Clash day']);
  } else {
    if (d.personalDay === 7 || d.personalDay === 9) r.push([8, `Personal day ${d.personalDay}: inward time`]);
    if (WANING.includes(d.moon)) r.push([3, 'Waning Moon: release']);
  }
  return { delta: r.reduce((a, [v]) => a + v, 0), reasons: r.map(([, s]) => s) };
}

export type RankedDay = DayEnergy & { total: number; reasons: string[] };

export function bestDates(p: Profile, intent: Intent, start: string, days: number, top = 5): RankedDay[] {
  if (days < 1 || days > 120) throw new Error('Range must be 1–120 days');
  return forecast(p, start, days)
    .map((e) => {
      const b = intentBonus(intent, { personalDay: e.personalDay, moon: e.moon, rel: relation(e.userAnimal, e.dayAnimal) });
      return { ...e, total: e.score + b.delta, reasons: b.reasons };
    })
    .sort((a, b) => b.total - a.total || a.date.localeCompare(b.date))
    .slice(0, top);
}
