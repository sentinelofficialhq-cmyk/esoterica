/**
 * Esoterica Premium plans. Store product ids must match App Store Connect, Google Play and the
 * RevenueCat/Stripe setup in docs/BACKEND-SETUP.md. Prices shown before the store answers; the
 * store's localized price replaces them when available.
 */
export type PlanId = 'yearly' | 'monthly' | 'weekly';

export type Plan = {
  id: PlanId;
  productId: string;
  name: string;
  /** Display price in USD before the store's localized price arrives. */
  price: string;
  period: 'year' | 'month' | 'week';
  /** Price per week, for comparing plans. */
  perWeek: string;
  trialDays: number;
};

export const PLANS: Record<PlanId, Plan> = {
  yearly: { id: 'yearly', productId: 'esoterica_yearly_11111', name: 'Yearly', price: '$111.11', period: 'year', perWeek: '$2.14', trialDays: 7 },
  monthly: { id: 'monthly', productId: 'esoterica_monthly_3333', name: 'Monthly', price: '$33.33', period: 'month', perWeek: '$7.69', trialDays: 0 },
  weekly: { id: 'weekly', productId: 'esoterica_weekly_1111', name: 'Weekly', price: '$11.11', period: 'week', perWeek: '$11.11', trialDays: 0 },
};

export const PLAN_ORDER: PlanId[] = ['yearly', 'monthly', 'weekly'];

/** Yearly against paying weekly for a year: 1 − 111.11 / (11.11 × 52) ≈ 81%. */
export const YEARLY_SAVING = `${Math.round((1 - 111.11 / (11.11 * 52)) * 100)}%`;

export const planForProduct = (productId: string): Plan | undefined => Object.values(PLANS).find((p) => p.productId === productId);

/** The button label for a plan. */
export const ctaFor = (plan: Plan): string => (plan.trialDays ? `Start my ${plan.trialDays}-day free trial` : `Subscribe for ${plan.price} a ${plan.period}`);

/** The auto-renew disclosure Apple and Google require next to the button. */
export function termsFor(plan: Plan, store: 'apple' | 'google' | 'web'): string {
  const account = store === 'apple' ? 'your Apple ID' : store === 'google' ? 'your Google Play account' : 'your card';
  const renew = `Renews automatically at ${plan.price} a ${plan.period} until you cancel, at least 24 hours before the period ends.`;
  return plan.trialDays
    ? `Free for ${plan.trialDays} days, then ${plan.price} a ${plan.period}, charged to ${account}. ${renew}`
    : `${plan.price} a ${plan.period}, charged to ${account}. ${renew}`;
}

/** Free plan: this many Jung messages per local day. */
export const FREE_MESSAGES_PER_DAY = 3;

/** Everything Premium unlocks beyond the free plan (daily reading, calculator, calendar, Learn, quick quiz, 3 Jung messages a day). */
export type PremiumFeature =
  | 'unlimitedJung'
  | 'dreamInterpretation'
  | 'compatibility'
  | 'family'
  | 'bestDate'
  | 'forecasts'
  | 'neville'
  | 'scripture'
  | 'memory'
  | 'deepQuiz';

export const FEATURE_COPY: Record<PremiumFeature, { title: string; line: string }> = {
  unlimitedJung: { title: 'Unlimited Jung', line: 'Talk with Jung as long as you like.' },
  dreamInterpretation: { title: 'Dream interpretation', line: 'A full reading of each dream, saved to your journal.' },
  compatibility: { title: 'Compatibility', line: 'How your pattern meets anyone else’s.' },
  family: { title: 'Family patterns', line: 'Read your whole family together.' },
  bestDate: { title: 'Best days', line: 'The right day to start, sign, travel or ask.' },
  forecasts: { title: 'Week and year ahead', line: 'Your timing, week by week and month by month.' },
  neville: { title: 'Neville and Scripture', line: 'Imagination practices and the mystical reading of verses.' },
  scripture: { title: 'Mind and Scripture', line: 'Verses matched to your numbers, read inwardly.' },
  memory: { title: 'Jung remembers you', line: 'Carries what matters from one talk to the next.' },
  deepQuiz: { title: 'Deep-dive analysis', line: 'The 32-question Psychological Types reading.' },
};
