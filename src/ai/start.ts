import { describeUser, type UserSnapshot } from '@/ai/context';
import { DEFAULT_GEMINI_MODEL, DEFAULT_MODEL } from '@/ai/models';
import { guideOfMode, type AnyModeId } from '@/ai/modes';
import { buildSystemPrompt } from '@/ai/persona';
import type { StoredMessage } from '@/ai/types';
import { topSymbols } from '@/jung/dreams';
import { currentJourney } from '@/jung/useJourney';
import { todayLocal } from '@/lib/date';
import { useChatStore } from '@/store/chatStore';
import { useImaginationStore } from '@/store/imaginationStore';
import { useJournalStore } from '@/store/journalStore';
import { useMemoryStore } from '@/store/memoryStore';
import { profileFromState, useProfileStore } from '@/store/profileStore';
import { useQuizStore } from '@/store/quizStore';
import { useSettingsStore } from '@/store/settingsStore';

/** Everything Jung should know about the person right now, read from the stores. */
export function currentSnapshot(opts: { aims?: boolean } = {}): UserSnapshot | null {
  const profile = profileFromState(useProfileStore.getState());
  if (!profile) return null;
  const quizzes = useQuizStore.getState();
  const journal = useJournalStore.getState();
  return {
    profile,
    date: todayLocal(),
    types: quizzes.types,
    archetypes: quizzes.archetypes,
    alignment: quizzes.alignment[0] ?? null,
    journeyStage: journeyLine(),
    dreamSymbols: topSymbols(journal.dreams).slice(0, 5),
    syncNumbers: journal.synchronicities.slice(0, 5).flatMap((s) => s.numbers).slice(0, 6),
    ...(opts.aims
      ? { aims: useImaginationStore.getState().aims.filter((a) => a.status === 'open').slice(0, 5).map((a) => `${a.title} (scene: ${a.scene})`) }
      : {}),
  };
}

function journeyLine(): string {
  const j = currentJourney();
  const done = j.stages.reduce((a, s) => a + s.done, 0);
  const total = j.stages.reduce((a, s) => a + s.total, 0);
  const stage = j.stages.find((s) => s.id === j.currentStage);
  return stage ? `${stage.name} stage (${done} of ${total} milestones done)` : `every milestone done (${total} of ${total})`;
}

/** The system prompt a new conversation in this mode would get right now. */
export function systemPromptFor(mode: AnyModeId, customFocus?: string): string {
  const snapshot = currentSnapshot({ aims: guideOfMode(mode) === 'neville' });
  const settings = useSettingsStore.getState();
  return buildSystemPrompt({
    mode,
    customFocus,
    userContext: snapshot ? describeUser(snapshot) : 'Not known yet.',
    notes: settings.memoryEnabled ? useMemoryStore.getState().notes.map((n) => n.text) : [],
  });
}

/**
 * Create a conversation with its system prompt frozen now; returns its id.
 * Pass `system` when continuing an exchange that already happened under that exact prompt.
 */
export function startConversation(opts: { mode: AnyModeId; customFocus?: string; seed?: StoredMessage[]; title?: string; system?: string }): string {
  const settings = useSettingsStore.getState();
  const system = opts.system ?? systemPromptFor(opts.mode, opts.customFocus);
  const model =
    settings.provider === 'openai'
      ? settings.openaiModel
      : settings.provider === 'gemini'
        ? settings.geminiModel || DEFAULT_GEMINI_MODEL
        : settings.provider === 'mock'
          ? 'mock-jung'
          : settings.anthropicModel || DEFAULT_MODEL;
  return useChatStore.getState().newConversation({
    mode: opts.mode,
    customFocus: opts.customFocus,
    system,
    provider: settings.provider,
    model,
    seed: opts.seed,
    title: opts.title,
  });
}
