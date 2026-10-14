import { MIN_PER_GROUP, pct, verdict, wilson } from '@/experiments/stats';

test('wilson matches published values', () => {
  // 81 of 263: 0.3080, 95% interval 0.2553–0.3662 (Newcombe 1998, method 3).
  const a = wilson(81, 263);
  expect(a.p).toBeCloseTo(0.308, 3);
  expect(a.lo).toBeCloseTo(0.2553, 3);
  expect(a.hi).toBeCloseTo(0.3662, 3);
  // 0 of 10 still has a real upper bound.
  const b = wilson(0, 10);
  expect(b.lo).toBe(0);
  expect(b.hi).toBeCloseTo(0.2775, 3);
  expect(wilson(0, 0)).toEqual({ p: 0, lo: 0, hi: 1 });
});

test('too early until every group has enough people', () => {
  const v = verdict([
    { variant: 'a', rate: { eligible: 400, hit: 200 } },
    { variant: 'b', rate: { eligible: 60, hit: 10 } },
  ]);
  expect(v).toEqual({ kind: 'too-early', needed: MIN_PER_GROUP - 60 });
});

test('a leader only when its range clears every other group', () => {
  expect(
    verdict([
      { variant: 'a', rate: { eligible: 1000, hit: 420 } },
      { variant: 'b', rate: { eligible: 1000, hit: 340 } },
      { variant: 'c', rate: { eligible: 1000, hit: 330 } },
    ]),
  ).toEqual({ kind: 'leader', variant: 'a' });
  expect(
    verdict([
      { variant: 'a', rate: { eligible: 200, hit: 84 } },
      { variant: 'b', rate: { eligible: 200, hit: 70 } },
    ]),
  ).toEqual({ kind: 'no-clear-leader' });
});

test('pct formats shares', () => {
  expect(pct(0.3456)).toBe('34.6%');
  expect(pct(1, 0)).toBe('100%');
});
