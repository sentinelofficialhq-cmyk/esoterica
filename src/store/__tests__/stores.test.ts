jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { useJournalStore } from '@/store/journalStore';
import { useMemoryStore } from '@/store/memoryStore';
import { usePeopleStore } from '@/store/peopleStore';
import { profileFromState, useProfileStore } from '@/store/profileStore';
import { useReadingStore } from '@/store/readingStore';
import { useSettingsStore } from '@/store/settingsStore';

test('no profile before onboarding', () => {
  expect(profileFromState(useProfileStore.getState())).toBeNull();
  useProfileStore.getState().setProfile({ name: 'Sam', birthDate: '1990-05-14' });
  expect(profileFromState(useProfileStore.getState())?.lifePath.display).toBe('29/11');
});

test('journal CRUD for dreams', () => {
  const j = useJournalStore.getState();
  const id = j.addDream({ date: '2026-10-13', title: 'The tower', text: 'A stone tower by a lake', mood: 4, tags: ['water'], lucid: false, recurring: false });
  expect(useJournalStore.getState().dreams[0]).toMatchObject({ id, title: 'The tower', symbols: [], figures: [], themes: [] });
  useJournalStore.getState().updateDream(id, { title: 'The tower at Bollingen' });
  expect(useJournalStore.getState().dreams[0].title).toBe('The tower at Bollingen');
  useJournalStore.getState().removeDream(id);
  expect(useJournalStore.getState().dreams).toHaveLength(0);
});

test('people add and remove', () => {
  const id = usePeopleStore.getState().addPerson({ name: 'Ana', birthDate: '1992-03-03', relation: 'friend' });
  expect(usePeopleStore.getState().people.map((p) => p.id)).toContain(id);
  usePeopleStore.getState().removePerson(id);
  expect(usePeopleStore.getState().people).toHaveLength(0);
});

test('readings save and ai attach', () => {
  const id = useReadingStore.getState().saveReading({ type: 'date', title: 'Apple', sections: [], facts: { lifePath: '28/1' } });
  useReadingStore.getState().setAi(id, { text: 'A reading', model: 'claude-opus-5-5' });
  expect(useReadingStore.getState().readings[0]).toMatchObject({ id, ai: { text: 'A reading' } });
});

test('memory notes are capped and deduped by the store setter', () => {
  useMemoryStore.getState().setNotes([
    { text: 'Loves the sea', category: 'life' },
    { text: 'loves the sea ', category: 'life' },
  ]);
  expect(useMemoryStore.getState().notes).toHaveLength(1);
});

test('usage accumulates per month and model', () => {
  const s = useSettingsStore.getState();
  s.addUsage('claude-opus-5-5', { inputTokens: 10, outputTokens: 5, cacheReadTokens: 0, cacheWriteTokens: 0 }, '2026-10');
  s.addUsage('claude-opus-5-5', { inputTokens: 1, outputTokens: 1, cacheReadTokens: 2, cacheWriteTokens: 3 }, '2026-10');
  expect(useSettingsStore.getState().usage).toEqual({
    month: '2026-10',
    byModel: { 'claude-opus-5-5': { inputTokens: 11, outputTokens: 6, cacheReadTokens: 2, cacheWriteTokens: 3 } },
  });
  s.addUsage('claude-opus-5-5', { inputTokens: 1, outputTokens: 1, cacheReadTokens: 0, cacheWriteTokens: 0 }, '2026-11');
  expect(useSettingsStore.getState().usage.month).toBe('2026-11');
  expect(useSettingsStore.getState().usage.byModel['claude-opus-5-5'].inputTokens).toBe(1);
});
