import { useChatStore } from '@/store/chatStore';
import { useImaginationStore } from '@/store/imaginationStore';
import { useJournalStore } from '@/store/journalStore';
import { useMemoryStore } from '@/store/memoryStore';
import { usePeopleStore } from '@/store/peopleStore';
import { useProfileStore } from '@/store/profileStore';
import { useQuizStore } from '@/store/quizStore';
import { useReadingStore } from '@/store/readingStore';
import { setKey } from '@/store/secrets';
import { useSettingsStore } from '@/store/settingsStore';

/** Erase everything Esoterica stores on this device, including API keys. */
export async function resetAllData(): Promise<void> {
  useProfileStore.setState(useProfileStore.getInitialState(), true);
  usePeopleStore.setState(usePeopleStore.getInitialState(), true);
  useJournalStore.setState(useJournalStore.getInitialState(), true);
  useQuizStore.setState(useQuizStore.getInitialState(), true);
  useReadingStore.setState(useReadingStore.getInitialState(), true);
  useMemoryStore.setState(useMemoryStore.getInitialState(), true);
  useSettingsStore.setState(useSettingsStore.getInitialState(), true);
  useChatStore.setState(useChatStore.getInitialState(), true);
  useImaginationStore.setState(useImaginationStore.getInitialState(), true);
  await setKey('anthropic', null);
  await setKey('openai', null);
}
