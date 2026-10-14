jest.mock('react-native-purchases', () => ({ __esModule: true, default: {} }));

import { entitlementFrom, trialDaysOf } from '@/purchases/revenuecat';

const info = (over: Partial<{ isActive: boolean; periodType: string; expirationDate: string | null; productIdentifier: string }> = {}) => ({
  isActive: true,
  periodType: 'TRIAL',
  expirationDate: '2026-10-21T12:00:00Z',
  productIdentifier: 'esoterica_yearly_11111',
  ...over,
});

test('an active trial maps to Premium with its trial end', () => {
  expect(entitlementFrom({ premium: info() })).toEqual({
    active: true,
    productId: 'esoterica_yearly_11111',
    trialEndsAt: '2026-10-21T12:00:00Z',
    expiresAt: '2026-10-21T12:00:00Z',
    source: 'store',
  });
});

test('a paid period has no trial end; no premium entitlement means free', () => {
  expect(entitlementFrom({ premium: info({ periodType: 'normal' }) }).trialEndsAt).toBeNull();
  expect(entitlementFrom({}).active).toBe(false);
  expect(entitlementFrom({ premium: info({ isActive: false }) }).active).toBe(false);
});

test('trial length comes from a free intro offer, else the plan', () => {
  const pkg = (introPrice: unknown) => ({ product: { introPrice } }) as never;
  expect(trialDaysOf(pkg({ price: 0, periodUnit: 'WEEK', periodNumberOfUnits: 1, cycles: 1 }), 'yearly')).toBe(7);
  expect(trialDaysOf(pkg({ price: 0, periodUnit: 'DAY', periodNumberOfUnits: 3, cycles: 1 }), 'yearly')).toBe(3);
  expect(trialDaysOf(pkg({ price: 1.99, periodUnit: 'WEEK', periodNumberOfUnits: 1, cycles: 1 }), 'monthly')).toBe(0);
  expect(trialDaysOf(pkg(null), 'yearly')).toBe(7);
});
