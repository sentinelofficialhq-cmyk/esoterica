import { ensureSession } from '@/backend/supabase';
import { setPurchasesClient } from '@/purchases/client';
import { useEntitlementStore } from '@/store/entitlementStore';

let started = false;

const hasRevenueCatKey = () =>
  !!(process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || process.env.EXPO_PUBLIC_REVENUECAT_WEB_KEY);

/**
 * Connects RevenueCat as the signed-in person (their Supabase user id, so the webhook can match
 * purchases to them) and refreshes Premium from the store. Does nothing without keys or a session.
 */
export async function startPurchases(): Promise<void> {
  if (started || !hasRevenueCatKey()) return;
  const session = await ensureSession();
  if (!session) return;
  // Loaded only when configured, so builds and tests without RevenueCat never touch the native module.
  const { createRevenueCatPurchases, fetchEntitlement, revenueCatKey } = await import('@/purchases/revenuecat');
  if (started || !revenueCatKey()) return;
  started = true;
  const { setPremium } = useEntitlementStore.getState();
  setPurchasesClient(createRevenueCatPurchases(session.user.id, setPremium));
  try {
    setPremium(await fetchEntitlement());
  } catch {
    // Offline: keep the last known state until the next launch or purchase.
  }
}
