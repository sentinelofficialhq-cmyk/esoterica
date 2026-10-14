import { dayAnimal } from '@/engines/chinese';
import { familyOf, numberHarmony } from '@/engines/harmony';
import { buildProfile } from '@/engines/profile';
import { energyEvents, forecast, scoreDay } from '@/engines/timing';
import { utcYMD } from '@/lib/date';

test('number families and harmony', () => {
  expect([1, 2, 3].map(familyOf)).toEqual(['mind', 'builder', 'heart']);
  expect(numberHarmony(4, 4)).toBe('same');
  expect(numberHarmony(1, 7)).toBe('family');
  expect(numberHarmony(5, 8)).toBe('friction');
  expect(numberHarmony(3, 7)).toBe('neutral');
});

test('ally day with matching personal day', () => {
  const r = scoreDay({ lifePathRoot: 1, personalDay: 1, universalDay: 5, userAnimal: 'Rat', dayAnimal: 'Ox', moon: 'Waxing Gibbous' });
  expect(r.score).toBe(78);
  expect(r.label).toBe('High');
});

test('clash day', () => {
  const r = scoreDay({ lifePathRoot: 1, personalDay: 4, universalDay: 8, userAnimal: 'Rat', dayAnimal: 'Horse', moon: 'Waning Crescent' });
  expect(r.score).toBe(21);
  expect(r.label).toBe('Caution');
  expect(r.factors.map((f) => f.delta)).toEqual([-8, -4, -15, -2]);
});

test('master-number day', () => {
  expect(
    scoreDay({ lifePathRoot: 3, personalDay: 7, universalDay: 2, universalMaster: true, userAnimal: 'Rat', dayAnimal: 'Tiger', moon: 'Full Moon' }).score,
  ).toBe(53);
});

test('7-day forecast', () => {
  const days = forecast(buildProfile({ name: 'A', birthDate: '1976-04-01' }), '2026-10-13', 7);
  expect(days).toHaveLength(7);
  expect(days[0]).toMatchObject({ date: '2026-10-13', personalDay: 2 });
  expect(days[6].date).toBe('2026-10-19');
  days.forEach((d) => {
    expect(d.score).toBeGreaterThanOrEqual(3);
    expect(d.score).toBeLessThanOrEqual(98);
  });
});

test('energy events', () => {
  const horse = buildProfile({ name: 'H', birthDate: '1990-05-14' });
  expect(energyEvents(horse, '2024-02-08', 5, utcYMD)).toEqual(
    expect.arrayContaining([expect.objectContaining({ date: '2024-02-10', kind: 'lunarNewYear' })]),
  );
  const jan = energyEvents(horse, '2024-01-01', 31, utcYMD);
  expect(jan).toEqual(expect.arrayContaining([expect.objectContaining({ date: '2024-01-25', kind: 'fullMoon' })]));
  const clashes = jan.filter((e) => e.kind === 'clash');
  expect(clashes.length).toBeGreaterThan(0);
  clashes.forEach((e) => expect(dayAnimal(e.date)).toBe('Rat'));
});
