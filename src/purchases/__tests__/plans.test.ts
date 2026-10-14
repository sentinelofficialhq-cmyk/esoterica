import { ctaFor, FREE_MESSAGES_PER_DAY, PLANS, planForProduct, termsFor, YEARLY_SAVING } from '@/purchases/plans';
import { freeMessagesLeft, isPremium, useEntitlementStore } from '@/store/entitlementStore';

test('prices, per-week figures and the yearly saving match the agreed pricing', () => {
  expect(PLANS.weekly.price).toBe('$11.11');
  expect(PLANS.monthly.price).toBe('$33.33');
  expect(PLANS.yearly.price).toBe('$111.11');
  expect(PLANS.yearly.perWeek).toBe(`$${(111.11 / 52).toFixed(2)}`);
  expect(PLANS.monthly.perWeek).toBe(`$${((33.33 * 12) / 52).toFixed(2)}`);
  expect(YEARLY_SAVING).toBe('81%');
  expect(PLANS.yearly.trialDays).toBe(7);
  expect(PLANS.monthly.trialDays + PLANS.weekly.trialDays).toBe(0);
  expect(planForProduct('esoterica_monthly_3333')?.id).toBe('monthly');
});

test('button and auto-renew disclosure say what will be charged and when', () => {
  expect(ctaFor(PLANS.yearly)).toBe('Start my 7-day free trial');
  expect(ctaFor(PLANS.weekly)).toBe('Subscribe for $11.11 a week');
  const t = termsFor(PLANS.yearly, 'apple');
  expect(t).toMatch(/Free for 7 days, then \$111\.11 a year/);
  expect(t).toMatch(/Apple ID/);
  expect(t).toMatch(/24 hours before/);
  expect(termsFor(PLANS.monthly, 'google')).toMatch(/Google Play/);
});

test('premium is active until its expiry', () => {
  const now = new Date('2026-10-14T12:00:00Z');
  expect(isPremium({ active: true, productId: 'p', trialEndsAt: null, expiresAt: null, source: 'store' }, now)).toBe(true);
  expect(isPremium({ active: true, productId: 'p', trialEndsAt: null, expiresAt: '2026-10-15T00:00:00Z', source: 'store' }, now)).toBe(true);
  expect(isPremium({ active: true, productId: 'p', trialEndsAt: null, expiresAt: '2026-10-13T00:00:00Z', source: 'store' }, now)).toBe(false);
  expect(isPremium({ active: false, productId: null, trialEndsAt: null, expiresAt: null, source: null }, now)).toBe(false);
});

test('three free Jung messages a day, reset at local midnight; premium is unlimited', () => {
  const s = useEntitlementStore.getState();
  s.clearPremium();
  useEntitlementStore.setState({ free: { day: '', used: 0 } });
  const left = () => freeMessagesLeft(useEntitlementStore.getState(), '2026-10-14');
  expect(left()).toBe(FREE_MESSAGES_PER_DAY);
  for (let i = 0; i < 3; i++) useEntitlementStore.getState().spendFreeMessage('2026-10-14');
  expect(left()).toBe(0);
  useEntitlementStore.getState().spendFreeMessage('2026-10-14');
  expect(left()).toBe(0);
  expect(freeMessagesLeft(useEntitlementStore.getState(), '2026-10-15')).toBe(3);
  useEntitlementStore.getState().setPremium({ active: true, productId: 'esoterica_yearly_11111', trialEndsAt: null, expiresAt: null, source: 'mock' });
  expect(left()).toBe(Infinity);
});
