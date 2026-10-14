import type { Entity } from '@/data/entities';
import { INTENTS, type Intent } from '@/engines/bestDate';
import type { LetterSystem } from '@/engines/letterology';
import { allEntities } from '@/engines/matches';
import { buildProfile, type Profile } from '@/engines/profile';
import type { AlignmentResult, ArchetypeResult, TypesResult } from '@/jung/types';
import { parseYMD } from '@/lib/date';
import {
  alignmentReading,
  archetypeReading,
  bestDateReading,
  compatibilityReading,
  dailyReading,
  dateReading,
  familyReading,
  fullReading,
  nameReading,
  typeReading,
  weekReading,
  yearReading,
} from '@/readings/builders';
import type { ReadingDoc } from '@/readings/types';
import type { Person } from '@/store/peopleStore';

export type ReadingContext = {
  profile: Profile;
  people: Person[];
  customEntities: Entity[];
  quizzes: { types: TypesResult | null; archetypes: ArchetypeResult | null; alignment: AlignmentResult | null };
  today: string;
  letterSystem: LetterSystem;
};

export type ReadingParams = Record<string, string | undefined>;

const validDate = (s: string | undefined): s is string => {
  if (!s) return false;
  try {
    parseYMD(s);
    return true;
  } catch {
    return false;
  }
};

/** "me", "person:<id>", "entity:<id>" or "date:YYYY-MM-DD" → a labelled profile. */
export function resolveSubject(ref: string, ctx: ReadingContext): { label: string; profile: Profile } | null {
  if (ref === 'me') return { label: ctx.profile.name || 'You', profile: ctx.profile };
  const [kind, id] = [ref.slice(0, ref.indexOf(':')), ref.slice(ref.indexOf(':') + 1)];
  if (kind === 'person') {
    const p = ctx.people.find((x) => x.id === id);
    return p ? { label: p.name, profile: buildProfile({ name: p.name, birthName: p.birthName, birthDate: p.birthDate }) } : null;
  }
  if (kind === 'entity') {
    const e = allEntities(ctx.customEntities).find((x) => x.id === id);
    return e ? { label: e.name, profile: buildProfile({ name: '', birthDate: e.date }) } : null;
  }
  if (kind === 'date' && validDate(id)) return { label: id, profile: buildProfile({ name: '', birthDate: id }) };
  return null;
}

/** Build the reading a URL asks for, or null if its inputs are missing or invalid. */
export function buildReading(params: ReadingParams, ctx: ReadingContext): ReadingDoc | null {
  try {
    switch (params.type) {
      case 'full':
        return fullReading(ctx.profile, ctx.quizzes, ctx.today);
      case 'date':
        return validDate(params.date) ? dateReading(params.date, params.label) : null;
      case 'name': {
        const names = (params.names ?? ctx.profile.birthName).split('|').map((n) => n.trim()).filter(Boolean);
        const system = params.system === 'chaldean' ? 'chaldean' : ctx.letterSystem;
        return names.length ? nameReading(names, system, ctx.profile.lifePath.root) : null;
      }
      case 'compatibility': {
        const a = resolveSubject(params.a ?? 'me', ctx);
        const b = params.b ? resolveSubject(params.b, ctx) : null;
        return a && b ? compatibilityReading(a.profile, b.profile, { a: a.label, b: params.blabel || b.label }) : null;
      }
      case 'daily':
        return dailyReading(ctx.profile, validDate(params.date) ? params.date : ctx.today);
      case 'week':
        return weekReading(ctx.profile, validDate(params.start) ? params.start : ctx.today);
      case 'year':
        return yearReading(ctx.profile, Number(params.year) || Number(ctx.today.slice(0, 4)));
      case 'bestDate': {
        const intent = (params.intent && params.intent in INTENTS ? params.intent : 'start') as Intent;
        const days = Math.min(120, Math.max(1, Number(params.days) || 30));
        return bestDateReading(ctx.profile, intent, validDate(params.start) ? params.start : ctx.today, days);
      }
      case 'family':
        return familyReading([
          { name: ctx.profile.name || 'You', relation: 'you', profile: ctx.profile },
          ...ctx.people.map((p) => ({ name: p.name, relation: p.relation, profile: buildProfile({ name: p.name, birthDate: p.birthDate }) })),
        ]);
      case 'type':
        return ctx.quizzes.types ? typeReading(ctx.quizzes.types) : null;
      case 'archetype':
        return ctx.quizzes.archetypes ? archetypeReading(ctx.quizzes.archetypes) : null;
      case 'alignment':
        return ctx.quizzes.alignment ? alignmentReading(ctx.quizzes.alignment) : null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}
