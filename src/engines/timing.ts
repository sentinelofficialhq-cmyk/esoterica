import { chineseSign, dayAnimal, isLunarNewYear, relation, type Animal, type Relation } from '@/engines/chinese';
import { numberHarmony } from '@/engines/harmony';
import { moonEvents, moonPhaseName, type MoonEvent, type MoonPhaseName } from '@/engines/moon';
import { personalDay, personalYear, universalDay } from '@/engines/numerology';
import type { Profile } from '@/engines/profile';
import { addDays, localYMD } from '@/lib/date';

export type DayInputs = {
  lifePathRoot: number;
  personalDay: number;
  universalDay: number;
  universalMaster?: boolean;
  userAnimal: Animal;
  dayAnimal: Animal;
  moon: MoonPhaseName;
};
export type Factor = { label: string; delta: number };
export type DayLabel = 'High' | 'Good' | 'Steady' | 'Low' | 'Caution';

const ANIMAL_DELTA: Record<Relation, number> = {
  secretFriend: 12, trine: 10, same: 4, neutral: 0, punishment: -5, harm: -7, clash: -15,
};
export const RELATION_LABEL: Record<Relation, string> = {
  secretFriend: 'a secret friend',
  trine: 'an ally',
  same: 'your own sign',
  neutral: 'neutral',
  punishment: 'a testing sign',
  harm: 'a harm sign',
  clash: 'your clash sign',
};
const MOON_DELTA: Record<MoonPhaseName, number> = {
  'New Moon': 4, 'Waxing Crescent': 2, 'First Quarter': 2, 'Waxing Gibbous': 2,
  'Full Moon': 0, 'Waning Gibbous': -2, 'Last Quarter': -2, 'Waning Crescent': -2,
};

export const labelFor = (s: number): DayLabel =>
  s >= 75 ? 'High' : s >= 60 ? 'Good' : s >= 45 ? 'Steady' : s >= 30 ? 'Low' : 'Caution';

/** Base 50, plus explainable factors, clamped to 3–98. See Learn → "How Esoterica scores". */
export function scoreDay(i: DayInputs): { score: number; label: DayLabel; factors: Factor[] } {
  const factors: Factor[] = [];
  const pd = numberHarmony(i.personalDay, i.lifePathRoot);
  if (pd === 'same') factors.push({ label: `Personal day ${i.personalDay} matches your Life Path`, delta: 10 });
  else if (pd === 'family') factors.push({ label: `Personal day ${i.personalDay} is in your number family`, delta: 8 });
  else if (pd === 'friction') factors.push({ label: `Personal day ${i.personalDay} rubs against your Life Path`, delta: -8 });

  const ud = numberHarmony(i.universalDay, i.lifePathRoot);
  if (ud === 'same' || ud === 'family') factors.push({ label: `Universal day ${i.universalDay} supports you`, delta: 4 });
  else if (ud === 'friction') factors.push({ label: `Universal day ${i.universalDay} pulls the other way`, delta: -4 });

  const rel = relation(i.userAnimal, i.dayAnimal);
  if (ANIMAL_DELTA[rel] !== 0) {
    factors.push({ label: `${i.dayAnimal} day: ${RELATION_LABEL[rel]} for your ${i.userAnimal}`, delta: ANIMAL_DELTA[rel] });
  }
  if (MOON_DELTA[i.moon] !== 0) factors.push({ label: i.moon, delta: MOON_DELTA[i.moon] });
  if (i.universalMaster) factors.push({ label: 'Master-number day', delta: 3 });

  const score = Math.max(3, Math.min(98, 50 + factors.reduce((a, f) => a + f.delta, 0)));
  return { score, label: labelFor(score), factors };
}

export type DayContext = DayInputs & { date: string; personalDayDisplay: string; universalDayDisplay: string };

export function dayContext(p: Profile, date: string): DayContext {
  const pd = personalDay(p.birthDate, date);
  const ud = universalDay(date);
  return {
    date,
    lifePathRoot: p.lifePath.root,
    personalDay: pd.root,
    universalDay: ud.root,
    universalMaster: ud.master,
    userAnimal: p.chinese.animal,
    dayAnimal: dayAnimal(date),
    moon: moonPhaseName(date),
    personalDayDisplay: pd.display,
    universalDayDisplay: ud.display,
  };
}

export type DayEnergy = DayContext & ReturnType<typeof scoreDay>;

export function energyFor(p: Profile, date: string): DayEnergy {
  const c = dayContext(p, date);
  return { ...c, ...scoreDay(c) };
}

export const forecast = (p: Profile, start: string, days = 7): DayEnergy[] =>
  Array.from({ length: days }, (_, i) => energyFor(p, addDays(start, i)));

export type EnergyEvent = {
  date: string;
  kind: 'clash' | 'ally' | 'return' | 'master' | 'birthday' | 'personalNewYear' | 'lunarNewYear' | MoonEvent['kind'];
  title: string;
  detail: string;
};

export function energyEvents(p: Profile, start: string, days: number, toDate: (d: Date) => string = localYMD): EnergyEvent[] {
  const out: EnergyEvent[] = [];
  const birthMD = p.birthDate.slice(5);
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    const c = dayContext(p, date);
    const rel = relation(c.userAnimal, c.dayAnimal);
    if (rel === 'clash') out.push({ date, kind: 'clash', title: 'Clash day', detail: `${c.dayAnimal} day opposes your ${c.userAnimal}` });
    if (rel === 'secretFriend' || rel === 'trine') {
      out.push({ date, kind: 'ally', title: 'Ally day', detail: `${c.dayAnimal} day supports your ${c.userAnimal}` });
    }
    if (c.personalDay === p.lifePath.root) {
      out.push({ date, kind: 'return', title: 'Return day', detail: `Personal day ${c.personalDay} echoes your Life Path` });
    }
    if (c.universalMaster) out.push({ date, kind: 'master', title: 'Master-number day', detail: `Universal day ${c.universalDayDisplay}` });
    if (date.slice(5) === birthMD) out.push({ date, kind: 'birthday', title: 'Solar return', detail: 'Your birthday: a new solar year begins' });
    if (date.slice(5) === '01-01') {
      const py = personalYear(p.birthDate, Number(date.slice(0, 4)));
      out.push({ date, kind: 'personalNewYear', title: `Personal Year ${py.display} begins`, detail: '' });
    }
    if (isLunarNewYear(date)) {
      out.push({ date, kind: 'lunarNewYear', title: 'Lunar New Year', detail: `Year of the ${chineseSign(date).animal}` });
    }
  }
  for (const e of moonEvents(start, days, toDate)) {
    if (e.kind === 'newMoon' || e.kind === 'fullMoon') {
      out.push({ date: e.date, kind: e.kind, title: e.kind === 'newMoon' ? 'New Moon' : 'Full Moon', detail: '' });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
