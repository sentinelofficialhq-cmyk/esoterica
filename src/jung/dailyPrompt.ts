import type { Fn } from '@/content/functions';
import { SHADOW_PROMPTS, type PromptTag, type ShadowPrompt } from '@/content/shadowPrompts';
import { hash } from '@/lib/hash';

/**
 * Today's shadow prompt: stable for the whole day, aimed at the person's inferior function
 * (where the shadow tends to enter), and never one they answered recently if avoidable.
 * With `theme`, picks from that theme instead (used by the individuation journey).
 */
export function dailyPrompt(date: string, inferior: Fn | null, recentIds: string[], theme?: PromptTag): ShadowPrompt {
  const tagged = theme
    ? SHADOW_PROMPTS.filter((p) => p.tags.includes(theme))
    : SHADOW_PROMPTS.filter((p) => !inferior || p.tags.includes(inferior) || p.tags.includes('general'));
  const fresh = tagged.filter((p) => !recentIds.includes(p.id));
  const pool = fresh.length ? fresh : tagged;
  return pool[hash(date) % pool.length];
}
