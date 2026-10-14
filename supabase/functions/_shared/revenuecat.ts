// Turns a RevenueCat webhook event into rows for `entitlements` and `purchase_events`.
// Plain TypeScript, tested by the app's Jest suite.
// Event fields: https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields

export type RevenueCatEvent = {
  id: string;
  type: string;
  app_user_id: string;
  original_app_user_id?: string;
  aliases?: string[];
  product_id?: string | null;
  period_type?: string | null;
  event_timestamp_ms: number;
  expiration_at_ms?: number | null;
  store?: string | null;
  environment?: string;
  entitlement_ids?: string[] | null;
  /** TRANSFER events only. */
  transferred_from?: string[];
  transferred_to?: string[];
};

export const ENTITLEMENT_ID = 'premium';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The Supabase user an event belongs to. The app logs in to RevenueCat with the Supabase user id,
 * so it is the app user id or one of its aliases; anonymous RevenueCat ids are skipped.
 */
export function userIdOf(e: Pick<RevenueCatEvent, 'app_user_id' | 'original_app_user_id' | 'aliases'>): string | null {
  const ids = [e.app_user_id, e.original_app_user_id, ...(e.aliases ?? [])];
  return ids.find((id): id is string => typeof id === 'string' && UUID.test(id))?.toLowerCase() ?? null;
}

export type EntitlementRow = {
  user_id: string;
  active: boolean;
  product_id: string | null;
  period_type: string | null;
  expires_at: string | null;
  store: string | null;
  updated_at: string;
};

export type PurchaseEventRow = {
  id: string;
  user_id: string;
  type: string;
  product_id: string | null;
  period_type: string | null;
  event_ts: string;
};

/** Events that change what a person has access to. Others (TEST, SUBSCRIBER_ALIAS, …) are only logged. */
const ACCESS_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'CANCELLATION',
  'UNCANCELLATION',
  'NON_RENEWING_PURCHASE',
  'SUBSCRIPTION_PAUSED',
  'EXPIRATION',
  'BILLING_ISSUE',
  'SUBSCRIPTION_EXTENDED',
  'TEMPORARY_ENTITLEMENT_GRANT',
]);

const iso = (ms: number) => new Date(ms).toISOString();

/**
 * What to write for one event. A cancellation only turns off auto-renew, so access lasts until the
 * expiration date; access ends on EXPIRATION, or once the expiration date has passed.
 */
export function rowsFor(e: RevenueCatEvent, now: Date): { entitlement: EntitlementRow | null; purchase: PurchaseEventRow | null; userId: string | null } {
  const userId = userIdOf(e);
  if (!userId) return { entitlement: null, purchase: null, userId: null };
  const purchase: PurchaseEventRow = {
    id: e.id,
    user_id: userId,
    type: e.type,
    product_id: e.product_id ?? null,
    period_type: e.period_type ?? null,
    event_ts: iso(e.event_timestamp_ms),
  };
  const grantsPremium = !e.entitlement_ids || e.entitlement_ids.includes(ENTITLEMENT_ID);
  if (!ACCESS_EVENTS.has(e.type) || !grantsPremium) return { entitlement: null, purchase, userId };
  const expires = e.expiration_at_ms ?? null;
  const active = e.type !== 'EXPIRATION' && (expires === null ? e.type === 'NON_RENEWING_PURCHASE' : expires > now.getTime());
  return {
    userId,
    purchase,
    entitlement: {
      user_id: userId,
      active,
      product_id: e.product_id ?? null,
      period_type: e.period_type ?? null,
      expires_at: expires === null ? null : iso(expires),
      store: e.store ?? null,
      updated_at: now.toISOString(),
    },
  };
}

/** Constant-time comparison for the webhook's Authorization header. */
export function sameSecret(given: string | null, expected: string): boolean {
  if (!given || !expected) return false;
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

/** The part of RevenueCat's GET /v1/subscribers/{id} response this app reads. */
export type SubscriberResponse = {
  subscriber?: {
    entitlements?: Record<string, { expires_date: string | null; product_identifier?: string; purchase_date?: string }>;
    subscriptions?: Record<string, { period_type?: string; store?: string; expires_date?: string | null }>;
  };
};

/**
 * A person's current Premium state from RevenueCat's subscriber record. Used after a TRANSFER,
 * whose webhook event doesn't say when the moved purchase expires.
 */
export function entitlementFromSubscriber(res: SubscriberResponse, userId: string, now: Date): EntitlementRow {
  const ent = res.subscriber?.entitlements?.[ENTITLEMENT_ID];
  const product = ent?.product_identifier ?? null;
  const sub = product ? res.subscriber?.subscriptions?.[product] : undefined;
  const expires = ent ? ent.expires_date : null;
  return {
    user_id: userId,
    active: !!ent && (expires === null || Date.parse(expires) > now.getTime()),
    product_id: product,
    period_type: sub?.period_type?.toUpperCase() ?? null,
    expires_at: expires ? new Date(expires).toISOString() : null,
    store: sub?.store?.toUpperCase() ?? null,
    updated_at: now.toISOString(),
  };
}
