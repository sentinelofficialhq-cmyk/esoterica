import type { Entity } from '@/data/entities';
import { allEntities, mostFriction, randomEntity, searchEntities, topMatches } from '@/engines/matches';
import { buildProfile } from '@/engines/profile';

const FIXTURE: Entity[] = [
  { id: 'apple', name: 'Apple', category: 'company', date: '1976-04-01', note: 'Founded' },
  { id: 'amazon', name: 'Amazon', category: 'company', date: '1994-07-05', note: 'Founded' },
  { id: 'bmw', name: 'BMW', category: 'car', date: '1916-03-07', note: 'Founded' },
  { id: 'applebees', name: "Applebee's", category: 'brand', date: '1980-11-19', note: 'Founded' },
  { id: 'china', name: 'China', category: 'country', date: '1949-10-01', note: 'Founded' },
];
const me = buildProfile({ name: 'Sam', birthDate: '1990-05-14' });

test('top matches are sorted best first and respect category and limit', () => {
  const top = topMatches(me, FIXTURE, { limit: 5 });
  expect(top).toHaveLength(5);
  top.slice(1).forEach((m, i) => expect(m.compat.overall).toBeLessThanOrEqual(top[i].compat.overall));
  expect(topMatches(me, FIXTURE, { category: 'company' }).every((m) => m.entity.category === 'company')).toBe(true);
  const worst = mostFriction(me, FIXTURE, { limit: 2 });
  expect(worst[0].compat.overall).toBeLessThanOrEqual(worst[1].compat.overall);
});

test('search: prefix matches first, accent-insensitive', () => {
  expect(searchEntities(FIXTURE, 'app').map((e) => e.id)).toEqual(['apple', 'applebees']);
  expect(searchEntities(FIXTURE, 'MAZ').map((e) => e.id)).toEqual(['amazon']);
  expect(searchEntities(allEntities([]), 'brasilia')[0]?.id).toBe('brasilia');
  expect(searchEntities(FIXTURE, '')).toEqual([]);
});

test('random is deterministic per seed', () => {
  expect(randomEntity(FIXTURE, 'x').id).toBe(randomEntity(FIXTURE, 'x').id);
});

test('custom entities override built-ins by id', () => {
  const merged = allEntities([{ id: 'apple', name: 'Apple', category: 'company', date: '1977-01-03', note: 'Incorporated' }]);
  expect(merged.find((e) => e.id === 'apple')?.date).toBe('1977-01-03');
});
