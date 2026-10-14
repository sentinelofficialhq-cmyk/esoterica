import { SHADOW_PROMPTS } from '@/content/shadowPrompts';
import { journeyProgress, type JourneyState } from '@/jung/journey';
import { useChatStore, type Conversation } from '@/store/chatStore';
import { useJournalStore } from '@/store/journalStore';
import { useQuizStore } from '@/store/quizStore';
import { useReadingStore } from '@/store/readingStore';
import type { Dream, ShadowEntry, Synchronicity, Projection } from '@/jung/types';
import type { SavedReading } from '@/readings/types';

const tagsFor = (promptId: string): string[] => SHADOW_PROMPTS.find((p) => p.id === promptId)?.tags ?? [];

export function journeyStateFrom(d: {
  types: boolean;
  archetypes: boolean;
  alignment: boolean;
  shadowEntries: ShadowEntry[];
  projections: Projection[];
  dreams: Dream[];
  synchronicities: Synchronicity[];
  readings: SavedReading[];
  conversations: Conversation[];
}): JourneyState {
  return {
    types: d.types,
    archetypes: d.archetypes,
    alignment: d.alignment,
    shadowEntryTags: d.shadowEntries.map((e) => tagsFor(e.promptId)),
    projections: d.projections.length,
    dreamFigures: d.dreams.map((x) => x.figures),
    synchronicities: d.synchronicities.length,
    savedReadingTypes: d.readings.map((r) => r.doc.type),
    activeImaginationSessions: d.conversations.filter(
      (c) => c.mode === 'activeImagination' && c.messages.filter((m) => m.status !== 'failed' && m.status !== 'stopped').length >= 2,
    ).length,
  };
}

/** Journey progress, read once from the stores (for the AI's context). */
export function currentJourney() {
  const q = useQuizStore.getState();
  const j = useJournalStore.getState();
  return journeyProgress(
    journeyStateFrom({
      types: !!q.types,
      archetypes: !!q.archetypes,
      alignment: q.alignment.length > 0,
      shadowEntries: j.shadowEntries,
      projections: j.projections,
      dreams: j.dreams,
      synchronicities: j.synchronicities,
      readings: useReadingStore.getState().readings,
      conversations: useChatStore.getState().conversations,
    }),
  );
}

/** Journey progress that updates as the person journals, dreams and takes quizzes. */
export function useJourney() {
  const types = useQuizStore((s) => !!s.types);
  const archetypes = useQuizStore((s) => !!s.archetypes);
  const alignment = useQuizStore((s) => s.alignment.length > 0);
  const shadowEntries = useJournalStore((s) => s.shadowEntries);
  const projections = useJournalStore((s) => s.projections);
  const dreams = useJournalStore((s) => s.dreams);
  const synchronicities = useJournalStore((s) => s.synchronicities);
  const readings = useReadingStore((s) => s.readings);
  const conversations = useChatStore((s) => s.conversations);
  return journeyProgress(
    journeyStateFrom({ types, archetypes, alignment, shadowEntries, projections, dreams, synchronicities, readings, conversations }),
  );
}
