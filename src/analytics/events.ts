/**
 * Every event Esoterica can record, with its allowed properties. Only counts, ids of app content
 * (a tool, a reading type) and test groups: never names, birth data, chat text, dreams or journals.
 */
export type EventProps = {
  app_open: { cold: boolean };
  experiment_assigned: { experiment: string; variant: string };
  onboarding_step: { step: string };
  onboarding_complete: Record<string, never>;
  paywall_view: { placement: 'onboarding' | 'limit' | 'feature' | 'settings'; variant: string; feature?: string };
  paywall_dismiss: { placement: 'onboarding' | 'limit' | 'feature' | 'settings'; variant: string };
  trial_start: { product: string; variant: string };
  purchase: { product: string; variant: string };
  restore: { restored: boolean };
  theme_change: { from: string; to: string };
  chat_message_sent: { guide: string };
  free_limit_reached: Record<string, never>;
  feature_open: { feature: string };
  quiz_complete: { quiz: string; depth?: string };
  reading_view: { reading: string };
  notification_optin: { granted: boolean };
};

export type EventName = keyof EventProps;

export type QueuedEvent = {
  id: string;
  name: EventName;
  props: Record<string, string | number | boolean>;
  /** Client time, ISO. */
  ts: string;
  installId: string;
  /** The install's test groups when the event happened. */
  variants: Record<string, string>;
  appVersion: string;
  platform: string;
};
