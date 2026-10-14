import { Platform } from 'react-native';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import type { Offering, PurchasesClient } from '@/purchases/client';
import { type PlanId, planForProduct, PLANS } from '@/purchases/plans';
import type { Entitlement } from '@/store/entitlementStore';

/** RevenueCat's entitlement that every plan unlocks (see docs/BACKEND-SETUP.md). */
export const ENTITLEMENT_ID = 'premium';

/** The public SDK key for this platform, or '' when RevenueCat isn't set up for it. */
export const revenueCatKey = (): string =>
  (Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY
    : Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_WEB_KEY) ?? '';

type EntitlementInfo = Pick<CustomerInfo['entitlements']['active'][string], 'isActive' | 'periodType' | 'expirationDate' | 'productIdentifier'>;

/** RevenueCat's view of the person → the app's entitlement. */
export function entitlementFrom(active: Record<string, EntitlementInfo>): Entitlement {
  const e = active[ENTITLEMENT_ID];
  if (!e?.isActive) return { active: false, productId: null, trialEndsAt: null, expiresAt: null, source: 'store' };
  return {
    active: true,
    productId: e.productIdentifier,
    trialEndsAt: e.periodType.toUpperCase() === 'TRIAL' ? e.expirationDate : null,
    expiresAt: e.expirationDate,
    source: 'store',
  };
}

const UNIT_DAYS: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

/** Free-trial length from the store's introductory offer, falling back to the plan's. */
export function trialDaysOf(pkg: Pick<PurchasesPackage, 'product'>, plan: PlanId): number {
  const intro = pkg.product.introPrice;
  if (intro && intro.price === 0) return (UNIT_DAYS[intro.periodUnit.toUpperCase()] ?? 0) * intro.periodNumberOfUnits * Math.max(1, intro.cycles);
  return PLANS[plan].trialDays;
}

class Cancelled extends Error {
  readonly cancelled = true;
}

/** Purchases through RevenueCat (App Store, Google Play, or Stripe on the web), signed in as `appUserID`. */
export function createRevenueCatPurchases(appUserID: string, onChange: (e: Entitlement) => void): PurchasesClient {
  Purchases.configure({ apiKey: revenueCatKey(), appUserID });
  Purchases.addCustomerInfoUpdateListener((info) => onChange(entitlementFrom(info.entitlements.active)));

  let packages: Map<PlanId, PurchasesPackage> | null = null;
  async function load(): Promise<Map<PlanId, PurchasesPackage>> {
    if (packages) return packages;
    const offerings = await Purchases.getOfferings();
    const map = new Map<PlanId, PurchasesPackage>();
    for (const pkg of offerings.current?.availablePackages ?? []) {
      const plan = planForProduct(pkg.product.identifier);
      if (plan) map.set(plan.id, pkg);
    }
    packages = map;
    return map;
  }

  return {
    kind: 'revenuecat',
    async offerings(): Promise<Offering[]> {
      const map = await load();
      return [...map.entries()].map(([plan, pkg]) => ({ plan, productId: pkg.product.identifier, price: pkg.product.priceString, trialDays: trialDaysOf(pkg, plan) }));
    },
    async purchase(plan) {
      const pkg = (await load()).get(plan);
      if (!pkg) throw new Error('That plan isn’t available right now.');
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        return entitlementFrom(customerInfo.entitlements.active);
      } catch (err) {
        if ((err as { userCancelled?: boolean | null }).userCancelled) throw new Cancelled('cancelled');
        throw err;
      }
    },
    async restore() {
      return entitlementFrom((await Purchases.restorePurchases()).entitlements.active);
    },
  };
}

/** The current entitlement from RevenueCat, for launch. */
export async function fetchEntitlement(): Promise<Entitlement> {
  return entitlementFrom((await Purchases.getCustomerInfo()).entitlements.active);
}
