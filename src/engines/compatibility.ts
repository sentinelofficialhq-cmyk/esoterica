import { relation, type CElement, type ChineseSign, type Relation } from '@/engines/chinese';
import { familyOf, numberHarmony } from '@/engines/harmony';
import type { Profile } from '@/engines/profile';
import { signDistance, type Sign } from '@/engines/western';

export type CompatLabel = 'Strong' | 'Good' | 'Mixed' | 'Friction';
export type Compatibility = {
  overall: number;
  label: CompatLabel;
  chinese: number;
  numerology: number;
  western: number;
  chineseRelation: Relation;
  aligned: string[];
  friction: string[];
};

export function numberPairScore(a: number, b: number): number {
  const h = numberHarmony(a, b);
  if (h === 'same') return 78;
  if (h === 'family') return 88;
  if (h === 'friction') return 40;
  return familyOf(a) === 'mind' || familyOf(b) === 'mind' ? 62 : 58;
}

export function numerologyScore(a: Profile, b: Profile): number {
  let lp = numberPairScore(a.lifePath.root, b.lifePath.root);
  if (a.lifePath.master && b.lifePath.master) lp = Math.min(100, lp + 4);
  return Math.round(0.7 * lp + 0.3 * numberPairScore(a.birthday.root, b.birthday.root));
}

/** Indexed by sign distance 0–6: conjunction, semi-sextile, sextile, square, trine, quincunx, opposition. */
const WEST_BY_DISTANCE = [75, 55, 80, 45, 90, 50, 62];
export const westernScore = (a: Sign, b: Sign): number => WEST_BY_DISTANCE[signDistance(a, b)];

const CHINESE_BASE: Record<Relation, number> = {
  secretFriend: 95, trine: 90, same: 70, neutral: 60, punishment: 45, harm: 40, clash: 20,
};
const GENERATES: Record<CElement, CElement> = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
const OVERCOMES: Record<CElement, CElement> = { Wood: 'Earth', Earth: 'Water', Water: 'Fire', Fire: 'Metal', Metal: 'Wood' };

export function chineseScore(a: ChineseSign, b: ChineseSign): number {
  let s = CHINESE_BASE[relation(a.animal, b.animal)];
  if (a.element === b.element) s += 3;
  else if (GENERATES[a.element] === b.element || GENERATES[b.element] === a.element) s += 5;
  else if (OVERCOMES[a.element] === b.element || OVERCOMES[b.element] === a.element) s -= 5;
  return Math.max(0, Math.min(100, s));
}

export function combine(s: { chinese: number; numerology: number; western: number }): { overall: number; label: CompatLabel } {
  const overall = Math.round(0.4 * s.chinese + 0.35 * s.numerology + 0.25 * s.western);
  return { overall, label: overall >= 80 ? 'Strong' : overall >= 65 ? 'Good' : overall >= 50 ? 'Mixed' : 'Friction' };
}

export function compatibility(a: Profile, b: Profile): Compatibility {
  const chinese = chineseScore(a.chinese, b.chinese);
  const numerology = numerologyScore(a, b);
  const western = westernScore(a.western.sign, b.western.sign);
  const rel = relation(a.chinese.animal, b.chinese.animal);
  const aligned: string[] = [];
  const friction: string[] = [];

  const pair = `${a.chinese.animal} and ${b.chinese.animal}`;
  if (rel === 'secretFriend') aligned.push(`${pair} are secret friends: quiet, loyal support`);
  if (rel === 'trine') aligned.push(`${pair} share a trine: naturally on the same side`);
  if (rel === 'clash') friction.push(`${pair} clash: opposite instincts on pace and priorities`);
  if (rel === 'harm') friction.push(`${pair} form a harm pair: small hurts add up`);
  if (rel === 'punishment') friction.push(`${pair} form a punishment pair: power struggles`);

  const h = numberHarmony(a.lifePath.root, b.lifePath.root);
  if (h === 'same' || h === 'family') aligned.push(`Life Paths ${a.lifePath.display} and ${b.lifePath.display} speak the same language`);
  if (h === 'friction') friction.push(`Life Paths ${a.lifePath.display} and ${b.lifePath.display} pull in different directions`);

  const d = signDistance(a.western.sign, b.western.sign);
  if (d === 2 || d === 4) aligned.push(`${a.western.sign} and ${b.western.sign} flow together (${d === 4 ? 'trine' : 'sextile'})`);
  if (d === 3) friction.push(`${a.western.sign} and ${b.western.sign} square off: growth through tension`);
  if (d === 6) aligned.push(`${a.western.sign} and ${b.western.sign} are opposites: magnetic, mirror-like`);

  return { ...combine({ chinese, numerology, western }), chinese, numerology, western, chineseRelation: rel, aligned, friction };
}
