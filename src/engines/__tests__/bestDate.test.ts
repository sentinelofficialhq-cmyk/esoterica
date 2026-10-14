import { bestDates, intentBonus } from '@/engines/bestDate';
import { buildProfile } from '@/engines/profile';

const profile = buildProfile({ name: 'A', birthDate: '1976-04-01' });

test('bonuses', () => {
  expect(intentBonus('start', { personalDay: 1, moon: 'New Moon', rel: 'trine' }).delta).toBe(19);
  expect(intentBonus('sign', { personalDay: 8, moon: 'Full Moon', rel: 'clash' }).delta).toBe(-8);
});

test('ranks top 5 within range', () => {
  const r = bestDates(profile, 'start', '2026-10-13', 30);
  expect(r).toHaveLength(5);
  r.slice(1).forEach((d, i) => expect(d.total).toBeLessThanOrEqual(r[i].total));
  r.forEach((d) => {
    expect(d.date >= '2026-10-13').toBe(true);
    expect(d.date < '2026-11-12').toBe(true);
  });
});

test('range limits', () => {
  expect(() => bestDates(profile, 'rest', '2026-10-13', 0)).toThrow();
  expect(() => bestDates(profile, 'rest', '2026-10-13', 121)).toThrow();
});
