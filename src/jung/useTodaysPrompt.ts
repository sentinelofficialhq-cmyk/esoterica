import type { PromptTag, ShadowPrompt } from '@/content/shadowPrompts';
import { dailyPrompt } from '@/jung/dailyPrompt';
import { todayLocal } from '@/lib/date';
import { useJournalStore } from '@/store/journalStore';
import { useQuizStore } from '@/store/quizStore';

/**
 * Today's shadow prompt (optionally from one theme). Entries written today don't count as "recent",
 * so the prompt stays put after answering.
 */
export function useTodaysPrompt(theme?: PromptTag): ShadowPrompt {
  const today = todayLocal();
  const inferior = useQuizStore((s) => s.types?.inferior ?? null);
  const entries = useJournalStore((s) => s.shadowEntries);
  const recent = entries.filter((e) => e.date !== today).slice(0, 30).map((e) => e.promptId);
  return dailyPrompt(today, inferior, recent, theme);
}
