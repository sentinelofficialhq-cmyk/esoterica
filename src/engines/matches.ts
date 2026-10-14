import { ENTITIES, type Entity, type EntityCategory } from '@/data/entities';
import { compatibility, type Compatibility } from '@/engines/compatibility';
import { buildProfile, type Profile } from '@/engines/profile';
import { hash } from '@/lib/hash';

/** Built-in entities merged with the user's own; a custom entry with the same id overrides the built-in one. */
export function allEntities(custom: Entity[]): Entity[] {
  const overrides = new Map(custom.map((e) => [e.id, e]));
  const merged = ENTITIES.map((e) => overrides.get(e.id) ?? e);
  const extra = custom.filter((e) => !ENTITIES.some((b) => b.id === e.id));
  return [...merged, ...extra];
}

// Entity patterns only depend on the date, so compute each one once.
const profileCache = new Map<string, Profile>();
export function entityProfile(e: Entity): Profile {
  let p = profileCache.get(e.date);
  if (!p) {
    p = buildProfile({ name: '', birthDate: e.date });
    profileCache.set(e.date, p);
  }
  return p;
}

export type ScoredEntity = { entity: Entity; compat: Compatibility };

function score(profile: Profile, entities: Entity[], category?: EntityCategory): ScoredEntity[] {
  return entities
    .filter((e) => !category || e.category === category)
    .map((entity) => ({ entity, compat: compatibility(profile, entityProfile(entity)) }));
}

export function topMatches(profile: Profile, entities: Entity[], opts: { category?: EntityCategory; limit?: number } = {}): ScoredEntity[] {
  return score(profile, entities, opts.category)
    .sort((a, b) => b.compat.overall - a.compat.overall || a.entity.name.localeCompare(b.entity.name))
    .slice(0, opts.limit ?? 10);
}

export function mostFriction(profile: Profile, entities: Entity[], opts: { category?: EntityCategory; limit?: number } = {}): ScoredEntity[] {
  return score(profile, entities, opts.category)
    .sort((a, b) => a.compat.overall - b.compat.overall || a.entity.name.localeCompare(b.entity.name))
    .slice(0, opts.limit ?? 5);
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Case- and accent-insensitive name search; names that start with the query come first. */
export function searchEntities(entities: Entity[], query: string, limit = 30): Entity[] {
  const q = fold(query);
  if (!q) return [];
  const prefix: Entity[] = [];
  const contains: Entity[] = [];
  for (const e of entities) {
    const n = fold(e.name);
    if (n.startsWith(q)) prefix.push(e);
    else if (n.includes(q)) contains.push(e);
  }
  const byName = (a: Entity, b: Entity) => a.name.localeCompare(b.name);
  return [...prefix.sort(byName), ...contains.sort(byName)].slice(0, limit);
}

export function randomEntity(entities: Entity[], seed: string): Entity {
  return entities[hash(seed) % entities.length];
}
