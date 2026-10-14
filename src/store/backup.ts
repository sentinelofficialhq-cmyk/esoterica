import { localYMD, parseYMD } from '@/lib/date';
import { useChatStore } from '@/store/chatStore';
import { useImaginationStore } from '@/store/imaginationStore';
import { useJournalStore } from '@/store/journalStore';
import { useMemoryStore } from '@/store/memoryStore';
import { usePeopleStore } from '@/store/peopleStore';
import { useProfileStore } from '@/store/profileStore';
import { useQuizStore } from '@/store/quizStore';
import { useReadingStore } from '@/store/readingStore';
import { useSettingsStore } from '@/store/settingsStore';

export type Backup = { app: 'esoterica' | 'rocket'; version: 1; exportedAt: string; data: Record<string, unknown> };

export const buildBackup = (data: Record<string, unknown>, now = new Date()): Backup => ({
  app: 'esoterica',
  version: 1,
  exportedAt: now.toISOString(),
  data,
});

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export function parseBackup(json: string): Backup {
  let b: unknown;
  try {
    b = JSON.parse(json);
  } catch {
    throw new Error('This file is not an Esoterica backup (it is not JSON).');
  }
  if (!isRecord(b) || (b.app !== 'esoterica' && b.app !== 'rocket')) throw new Error('This file is not an Esoterica backup.');
  if (b.version !== 1) throw new Error(`This backup is version ${String(b.version)}, which this version of Esoterica can’t read.`);
  if (typeof b.exportedAt !== 'string' || Number.isNaN(Date.parse(b.exportedAt))) throw new Error('This backup has no export date.');
  if (!isRecord(b.data)) throw new Error('This backup has no data.');
  return b as Backup;
}

/** A store as the backup sees it. Method syntax keeps each typed zustand store assignable. */
type BackupStore = {
  getState(): object;
  getInitialState(): object;
  setState(state: object, replace: true): void;
};

/** Every persisted store, under its storage name. API keys live in secure storage and never appear here. */
const STORES: Record<string, BackupStore> = {
  'rocket-profile': useProfileStore,
  'rocket-people': usePeopleStore,
  'rocket-journal': useJournalStore,
  'rocket-quizzes': useQuizStore,
  'rocket-readings': useReadingStore,
  'rocket-memory': useMemoryStore,
  'rocket-settings': useSettingsStore,
  'rocket-chats': useChatStore,
  'rocket-imagination': useImaginationStore,
};

/** Plain data from every store (the JSON round trip drops the actions). */
export function collectData(): Record<string, unknown> {
  return Object.fromEntries(Object.entries(STORES).map(([name, store]) => [name, JSON.parse(JSON.stringify(store.getState()))]));
}

/** Replace each store's data with the backup's. A store the backup doesn't include is left as it is. */
export function restoreData(backup: Backup): void {
  for (const [name, store] of Object.entries(STORES)) {
    const saved = backup.data[name];
    if (isRecord(saved)) store.setState({ ...store.getInitialState(), ...saved }, true);
  }
  // The data on this device is now exactly as safe as that backup.
  useSettingsStore.getState().update({ lastBackupAt: localYMD(new Date(backup.exportedAt)) });
}

export const backupFileName = (today: string) => `esoterica-backup-${today}.json`;

const dayNumber = (ymd: string) => {
  const { y, m, d } = parseYMD(ymd);
  return Date.UTC(y, m - 1, d) / 86_400_000;
};

/** Weekly reminder, once there is something worth saving. */
export function needsBackup(lastBackupAt: string | null, today: string, hasData: boolean): boolean {
  if (!hasData) return false;
  if (!lastBackupAt) return true;
  return dayNumber(today) - dayNumber(lastBackupAt) >= 7;
}

/** True when the person has written, saved or taken anything beyond onboarding. */
export function useHasUserData(): boolean {
  const journal = useJournalStore((s) => s.dreams.length + s.shadowEntries.length + s.projections.length + s.synchronicities.length);
  const chats = useChatStore((s) => s.conversations.length);
  const readings = useReadingStore((s) => s.readings.length);
  const people = usePeopleStore((s) => s.people.length);
  const quizzes = useQuizStore((s) => Number(!!s.types) + Number(!!s.archetypes) + s.alignment.length);
  const notes = useMemoryStore((s) => s.notes.length);
  const imagination = useImaginationStore((s) => s.aims.length + s.sessions.length);
  return journal + chats + readings + people + quizzes + notes + imagination > 0;
}
