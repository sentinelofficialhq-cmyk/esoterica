import { buildProfile } from '@/engines/profile';

test("matches CUE's sample card (born 14 May 1990)", () => {
  const p = buildProfile({ name: 'Sample', birthDate: '1990-05-14' });
  expect(p.lifePath.display).toBe('29/11');
  expect(p.western).toMatchObject({ sign: 'Taurus', element: 'Earth' });
  expect(p.chinese.animal).toBe('Horse');
  expect(p.letters?.expression.value).toBeGreaterThan(0);
});

test('uses the birth name for letters when given', () => {
  const p = buildProfile({ name: 'Johnny', birthName: 'John Smith', birthDate: '1990-05-14' });
  expect(p.letters?.expression.display).toBe('44/8');
});

test('no letters for a nameless entity', () =>
  expect(buildProfile({ name: '', birthDate: '1990-05-14' }).letters).toBeNull());
