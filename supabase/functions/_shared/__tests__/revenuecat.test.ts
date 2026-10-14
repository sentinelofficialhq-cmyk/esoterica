import { entitlementFromSubscriber, type RevenueCatEvent, rowsFor, sameSecret, userIdOf } from '../revenuecat';

const USER = '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b';
const now = new Date('2026-10-14T12:00:00Z');
const DAY = 86_400_000;
const base: RevenueCatEvent = {
  id: 'evt-1',
  type: 'INITIAL_PURCHASE',
  app_user_id: USER,
  product_id: 'esoterica_yearly_11111',
  period_type: 'TRIAL',
  event_timestamp_ms: now.getTime() - 1000,
  expiration_at_ms: now.getTime() + 7 * DAY,
  store: 'APP_STORE',
  entitlement_ids: ['premium'],
};

test('a trial start grants Premium until the trial ends and is logged', () => {
  const r = rowsFor(base, now);
  expect(r.entitlement).toMatchObject({ user_id: USER, active: true, period_type: 'TRIAL', expires_at: '2026-10-21T12:00:00.000Z', store: 'APP_STORE' });
  expect(r.purchase).toMatchObject({ id: 'evt-1', type: 'INITIAL_PURCHASE', period_type: 'TRIAL' });
});

test('cancelling keeps access until expiration; expiration ends it', () => {
  expect(rowsFor({ ...base, type: 'CANCELLATION' }, now).entitlement?.active).toBe(true);
  expect(rowsFor({ ...base, type: 'CANCELLATION', expiration_at_ms: now.getTime() - 1 }, now).entitlement?.active).toBe(false);
  expect(rowsFor({ ...base, type: 'EXPIRATION' }, now).entitlement?.active).toBe(false);
});

test('renewals after a trial are paid periods', () => {
  const r = rowsFor({ ...base, id: 'evt-2', type: 'RENEWAL', period_type: 'NORMAL', expiration_at_ms: now.getTime() + 365 * DAY }, now);
  expect(r.entitlement).toMatchObject({ active: true, period_type: 'NORMAL' });
  expect(r.purchase?.type).toBe('RENEWAL');
});

test('anonymous RevenueCat ids are skipped; aliases can carry the Supabase id', () => {
  expect(rowsFor({ ...base, app_user_id: '$RCAnonymousID:abc' }, now)).toEqual({ entitlement: null, purchase: null, userId: null });
  expect(userIdOf({ app_user_id: '$RCAnonymousID:abc', aliases: ['$RCAnonymousID:abc', USER.toUpperCase()] })).toBe(USER);
});

test('events for other entitlements, and informational events, change nothing', () => {
  expect(rowsFor({ ...base, entitlement_ids: ['something_else'] }, now).entitlement).toBeNull();
  const test = rowsFor({ ...base, type: 'TEST' }, now);
  expect(test.entitlement).toBeNull();
  expect(test.purchase).not.toBeNull();
});

test('the webhook secret must match exactly', () => {
  expect(sameSecret('Bearer abc', 'Bearer abc')).toBe(true);
  expect(sameSecret('Bearer abd', 'Bearer abc')).toBe(false);
  expect(sameSecret('Bearer ab', 'Bearer abc')).toBe(false);
  expect(sameSecret(null, 'Bearer abc')).toBe(false);
  expect(sameSecret('x', '')).toBe(false);
});

test('a subscriber record gives the current Premium state', () => {
  const res = {
    subscriber: {
      entitlements: { premium: { expires_date: '2027-10-14T12:00:00Z', product_identifier: 'esoterica_yearly_11111' } },
      subscriptions: { esoterica_yearly_11111: { period_type: 'normal', store: 'app_store', expires_date: '2027-10-14T12:00:00Z' } },
    },
  };
  expect(entitlementFromSubscriber(res, USER, now)).toMatchObject({ active: true, product_id: 'esoterica_yearly_11111', period_type: 'NORMAL', store: 'APP_STORE', expires_at: '2027-10-14T12:00:00.000Z' });
  expect(entitlementFromSubscriber({ subscriber: { entitlements: {} } }, USER, now)).toMatchObject({ active: false, product_id: null });
  const lapsed = { subscriber: { entitlements: { premium: { expires_date: '2026-10-01T00:00:00Z', product_identifier: 'p' } } } };
  expect(entitlementFromSubscriber(lapsed, USER, now).active).toBe(false);
});
