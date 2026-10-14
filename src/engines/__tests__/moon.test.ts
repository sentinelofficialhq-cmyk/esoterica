import { moonEvents, moonPhaseName } from '@/engines/moon';
import { utcYMD } from '@/lib/date';

test('January 2024 new and full moons', () => {
  expect(moonPhaseName('2024-01-25')).toBe('Full Moon');
  expect(moonPhaseName('2024-01-11')).toBe('New Moon');
  expect(moonEvents('2024-01-01', 31, utcYMD)).toEqual(
    expect.arrayContaining([
      { date: '2024-01-11', kind: 'newMoon' },
      { date: '2024-01-25', kind: 'fullMoon' },
    ]),
  );
});

test('events stay inside the window', () => {
  const events = moonEvents('2024-01-01', 31, utcYMD);
  events.forEach((e) => {
    expect(e.date >= '2024-01-01').toBe(true);
    expect(e.date < '2024-02-01').toBe(true);
  });
  expect(events.length).toBeGreaterThanOrEqual(4);
});
