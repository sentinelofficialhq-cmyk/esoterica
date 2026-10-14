import { track } from '@/analytics/track';
import { paywallVariant } from '@/experiments/enroll';
import { type PlanId, PLAN_ORDER, PLANS } from '@/purchases/plans';
import { type Entitlement, useEntitlementStore } from '@/store/entitlementStore';

/** What the store sells, with its localized price when known. */
export type Offering = { plan: PlanId; productId: string; price: string; trialDays: number };

/** The purchase layer: RevenueCat on phones and the web when configured; a local mock in development builds. */
export interface PurchasesClient {
  readonly kind: 'mock' | 'revenuecat';
  offerings(): Promise<Offering[]>;
  /** Resolves with the new entitlement; rejects with { cancelled: true } when the person backs out. */
  purchase(plan: PlanId): Promise<Entitlement>;
  restore(): Promise<Entitlement>;
}

const DAY = 86_400_000;

/** Grants Premium locally. For development and web previews only; never in a store build. */
export function createMockPurchases(now: () => Date = () => new Date()): PurchasesClient {
  return {
    kind: 'mock',
    async offerings() {
      return PLAN_ORDER.map((id) => ({ plan: id, productId: PLANS[id].productId, price: PLANS[id].price, trialDays: PLANS[id].trialDays }));
    },
    async purchase(plan) {
      const p = PLANS[plan];
      const start = now().getTime();
      const periodDays = p.period === 'year' ? 365 : p.period === 'month' ? 30 : 7;
      return {
        active: true,
        productId: p.productId,
        trialEndsAt: p.trialDays ? new Date(start + p.trialDays * DAY).toISOString() : null,
        expiresAt: new Date(start + (p.trialDays + periodDays) * DAY).toISOString(),
        source: 'mock',
      };
    },
    async restore() {
      return useEntitlementStore.getState().premium;
    },
  };
}

/** Release builds without RevenueCat keys sell nothing, rather than granting Premium for free. */
export function createUnavailablePurchases(): PurchasesClient {
  const unavailable = () => Promise.reject(new Error('Subscriptions aren’t available in this version yet.'));
  return { kind: 'mock', offerings: async () => [], purchase: unavailable, restore: unavailable };
}

let client: PurchasesClient = __DEV__ ? createMockPurchases() : createUnavailablePurchases();

export const purchases = (): PurchasesClient => client;
export function setPurchasesClient(c: PurchasesClient): void {
  client = c;
}

/** Buy a plan from a paywall: stores the entitlement and records trial_start or purchase with the paywall variant. */
export async function buy(plan: PlanId): Promise<Entitlement> {
  const e = await client.purchase(plan);
  useEntitlementStore.getState().setPremium(e);
  const props = { product: PLANS[plan].productId, variant: paywallVariant() };
  if (e.trialEndsAt) track('trial_start', props);
  else track('purchase', props);
  return e;
}

export async function restorePurchases(): Promise<boolean> {
  const e = await client.restore();
  const restored = e.active;
  if (restored) useEntitlementStore.getState().setPremium(e);
  track('restore', { restored });
  return restored;
}

/** Thrown by `purchase` when the person backs out of the store sheet. */
export const isCancelled = (err: unknown): boolean => !!(err as { cancelled?: boolean } | null)?.cancelled;
