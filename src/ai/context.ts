import { ARCHETYPES, type ArchetypeId } from '@/content/archetypes';
import { FUNCTION_MEANINGS } from '@/content/functions';
import { allies, enemy } from '@/engines/chinese';
import { personalMonth, personalYear } from '@/engines/numerology';
import type { Profile } from '@/engines/profile';
import type { DayEnergy } from '@/engines/timing';
import type { AlignmentResult, ArchetypeResult, TypesResult } from '@/jung/types';
import { formatDate, parseYMD, weekday } from '@/lib/date';

export type UserSnapshot = {
  profile: Profile;
  /** The day the conversation starts (local). */
  date: string;
  types?: TypesResult | null;
  archetypes?: ArchetypeResult | null;
  alignment?: AlignmentResult | null;
  journeyStage?: string | null;
  dreamSymbols?: [string, number][];
  syncNumbers?: string[];
  /** Open imagination aims (only given to the Neville guide). */
  aims?: string[];
};

/** Compact, labelled facts about the person for the system prompt. */
export function describeUser(s: UserSnapshot): string {
  const p = s.profile;
  const { y, m } = parseYMD(s.date);
  const lines = [
    `Name: ${p.name || 'not given'}`,
    `Born: ${formatDate(p.birthDate)}`,
    `Life Path: ${p.lifePath.display}${p.lifePath.master ? ' (master number)' : ''}${p.lifePath.karmicDebt ? ` (karmic debt ${p.lifePath.karmicDebt})` : ''}`,
    `Birthday number: ${p.birthday.display}${p.birthday.karmicDebt ? ` (karmic debt ${p.birthday.karmicDebt})` : ''}; attitude number: ${p.attitude.display}`,
    `Western: ${p.western.sign}, ${p.western.element}, ${p.western.modality}, ruled by ${p.western.ruler}${p.western.cuspWith ? ` (on the cusp with ${p.western.cuspWith})` : ''}`,
    `Chinese: ${p.chinese.element} ${p.chinese.animal} (${p.chinese.polarity}); allies ${allies(p.chinese.animal).join(', ')}; clash ${enemy(p.chinese.animal)}`,
  ];
  if (p.letters) {
    lines.push(
      `Name numbers (birth name "${p.birthName}"): Expression ${p.letters.expression.display}, Soul Urge ${p.letters.soulUrge.display}, Personality ${p.letters.personality.display}${p.letters.karmicLessons.length ? `; karmic lessons ${p.letters.karmicLessons.join(', ')}` : ''}`,
    );
  }
  lines.push(`Current cycles: Personal Year ${personalYear(p.birthDate, y).display}, Personal Month ${personalMonth(p.birthDate, y, m).display}`);
  if (s.types) {
    lines.push(
      `Psychological type: dominant ${FUNCTION_MEANINGS[s.types.dominant].name}, auxiliary ${FUNCTION_MEANINGS[s.types.auxiliary].name}, inferior ${FUNCTION_MEANINGS[s.types.inferior].name} (${s.types.code})`,
    );
  }
  if (s.archetypes) {
    const names = s.archetypes.top.map((id) => ARCHETYPES[id as ArchetypeId]?.name).filter(Boolean);
    lines.push(`Archetypes: ${names.join(', ')}; shadow form: ${s.archetypes.shadowForm}`);
  }
  if (s.alignment) lines.push(`Persona and Self alignment: ${s.alignment.percent}% (${s.alignment.tier})`);
  if (s.journeyStage) lines.push(`Individuation journey: ${s.journeyStage}`);
  if (s.dreamSymbols?.length) lines.push(`Recurring dream symbols: ${s.dreamSymbols.map(([sym, n]) => `${sym} (${n})`).join(', ')}`);
  if (s.syncNumbers?.length) lines.push(`Recent synchronicities: ${s.syncNumbers.join(', ')}`);
  if (s.aims?.length) lines.push(`Imagination aims they are holding: ${s.aims.join('; ')}`);
  return lines.join('\n');
}

/** Prepended to the first message of each day: "[Today is Tue 13 Oct 2026 · energy 44 Low · …]". */
export function dailyContextLine(e: DayEnergy): string {
  return `[Today is ${weekday(e.date)} ${formatDate(e.date)} · energy ${e.score} ${e.label} · personal day ${e.personalDayDisplay} · ${e.moon} · ${e.dayAnimal} day]`;
}
