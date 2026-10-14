import { backupFileName, buildBackup, collectData, needsBackup, parseBackup, restoreData } from '@/store/backup';
import { useJournalStore } from '@/store/journalStore';
import { useSettingsStore } from '@/store/settingsStore';

const dream = {
  id: 'd1',
  date: '2026-10-12',
  title: 'The tower',
  text: 'I climbed a stone tower by a lake.',
  mood: 4 as const,
  tags: [],
  lucid: false,
  recurring: false,
  symbols: ['tower', 'lake'],
  figures: [],
  themes: [],
};

test('round trip through JSON keeps the data', () => {
  const data = { 'rocket-journal': { dreams: [dream] }, 'rocket-settings': { chatDepth: 'deep' } };
  const b = buildBackup(data, new Date('2026-10-13T09:00:00Z'));
  expect(b).toMatchObject({ app: 'esoterica', version: 1, exportedAt: '2026-10-13T09:00:00.000Z' });
  expect(parseBackup(JSON.stringify(b)).data).toEqual(data);
});

test('rejects files that are not Esoterica v1 backups', () => {
  expect(() => parseBackup('not json')).toThrow(/not JSON/);
  expect(() => parseBackup(JSON.stringify({ app: 'cue', version: 1, exportedAt: '2026-10-13T09:00:00Z', data: {} }))).toThrow(/not an Esoterica backup/);
  expect(() => parseBackup(JSON.stringify({ app: 'rocket', version: 2, exportedAt: '2026-10-13T09:00:00Z', data: {} }))).toThrow(/version 2/);
  expect(() => parseBackup(JSON.stringify({ app: 'rocket', version: 1, exportedAt: 'soon', data: {} }))).toThrow(/export date/);
  expect(() => parseBackup(JSON.stringify({ app: 'rocket', version: 1, exportedAt: '2026-10-13T09:00:00Z', data: [] }))).toThrow(/no data/);
});

test('backups made before the rename (app: rocket) still load', () => {
  const old = { app: 'rocket', version: 1, exportedAt: '2026-10-13T09:00:00Z', data: { 'rocket-settings': { chatDepth: 'deep' } } };
  expect(parseBackup(JSON.stringify(old)).data).toEqual(old.data);
});

test('collect then restore brings every store back, actions included', () => {
  useJournalStore.setState({ dreams: [dream] });
  const backup = parseBackup(JSON.stringify(buildBackup(collectData(), new Date('2026-10-13T12:00:00Z'))));
  expect(Object.keys(backup.data).sort()).toEqual(
    ['rocket-chats', 'rocket-imagination', 'rocket-journal', 'rocket-memory', 'rocket-people', 'rocket-profile', 'rocket-quizzes', 'rocket-readings', 'rocket-settings'],
  );

  useJournalStore.setState(useJournalStore.getInitialState(), true);
  expect(useJournalStore.getState().dreams).toHaveLength(0);

  restoreData(backup);
  expect(useJournalStore.getState().dreams).toEqual([dream]);
  expect(typeof useJournalStore.getState().addDream).toBe('function');
  expect(useSettingsStore.getState().lastBackupAt).toBe('2026-10-13');
});

test('a store missing from the backup is left alone', () => {
  useJournalStore.setState({ ...useJournalStore.getInitialState(), dreams: [dream] }, true);
  restoreData(buildBackup({ 'rocket-settings': { chatDepth: 'quick' } }));
  expect(useJournalStore.getState().dreams).toEqual([dream]);
  expect(useSettingsStore.getState().chatDepth).toBe('quick');
});

test('weekly reminder only once there is data', () => {
  expect(needsBackup(null, '2026-10-13', false)).toBe(false);
  expect(needsBackup(null, '2026-10-13', true)).toBe(true);
  expect(needsBackup('2026-10-10', '2026-10-13', true)).toBe(false);
  expect(needsBackup('2026-10-06', '2026-10-13', true)).toBe(true);
  expect(needsBackup('2026-12-29', '2027-01-05', true)).toBe(true);
});

test('file name carries the date', () => expect(backupFileName('2026-10-13')).toBe('esoterica-backup-2026-10-13.json'));
