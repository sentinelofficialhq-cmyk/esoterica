import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { FREE_MESSAGES_PER_DAY } from '@/purchases/plans';
import { persistStorage } from '@/store/storage';

export type Entitlement = {
  active: boolean;
  productId: string | null;
  /** ISO end of the free trial, when the subscription is in one. */
  trialEndsAt: string | null;
  /** ISO end of the paid period; null when active with no known end (the store renews it). */
  expiresAt: string | null;
  source: 'mock' | 'store' | 'server' | null;
};

const NONE: Entitlement = { active: false, productId: null, trialEndsAt: null, expiresAt: null, source: null };

type EntitlementState = {
  premium: Entitlement;
  /** Free Jung messages used, per local day (YYYY-MM-DD). */
  free: { day: string; used: number };
  setPremium: (e: Entitlement) => void;
  clearPremium: () => void;
  /** Count one free message for `today`. */
  spendFreeMessage: (today: string) => void;
};

/**
 * Premium status and the free-message counter. The server (RevenueCat) is the source of truth;
 * this is the on-device copy so the app works offline. Not part of backups.
 */
export const useEntitlementStore = create<EntitlementState>()(
  persist(
    (set) => ({
      premium: NONE,
      free: { day: '', used: 0 },
      setPremium: (premium) => set({ premium }),
      clearPremium: () => set({ premium: NONE }),
      spendFreeMessage: (today) => set((s) => ({ free: { day: today, used: s.free.day === today ? s.free.used + 1 : 1 } })),
    }),
    { name: 'esoterica-entitlement', storage: createJSONStorage(() => persistStorage) },
  ),
);

/** Premium right now: active, and not past its expiry when one is known. */
export function isPremium(e: Entitlement, now: Date = new Date()): boolean {
  return e.active && (!e.expiresAt || Date.parse(e.expiresAt) > now.getTime());
}

export const usePremium = (): boolean => isPremium(useEntitlementStore((s) => s.premium));

/** Free messages left today (Premium is unlimited: Infinity). */
export function freeMessagesLeft(state: Pick<EntitlementState, 'premium' | 'free'>, today: string, now: Date = new Date()): number {
  if (isPremium(state.premium, now)) return Infinity;
  const used = state.free.day === today ? state.free.used : 0;
  return Math.max(0, FREE_MESSAGES_PER_DAY - used);
}
