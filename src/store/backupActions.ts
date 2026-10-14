import { confirm } from '@/lib/confirm';
import { formatDate, localYMD, todayLocal } from '@/lib/date';
import { backupFileName, buildBackup, collectData, parseBackup, restoreData } from '@/store/backup';
import { pickBackupFile, saveBackupFile } from '@/store/backupFile';
import { useSettingsStore } from '@/store/settingsStore';

/** Save everything (except API keys) to a file. Returns false if the person cancelled. Call straight from a tap. */
export async function exportBackup(): Promise<boolean> {
  const today = todayLocal();
  const saved = await saveBackupFile(backupFileName(today), JSON.stringify(buildBackup(collectData())));
  if (saved) useSettingsStore.getState().update({ lastBackupAt: today });
  return saved;
}

/** Pick a backup file, confirm, and replace this device's Esoterica data with it. Returns true once restored. */
export async function importBackup(): Promise<boolean> {
  const text = await pickBackupFile();
  if (text === null) return false;
  const backup = parseBackup(text);
  const ok = await confirm(
    'Restore this backup?',
    `This replaces the Esoterica data on this device with the backup from ${formatDate(localYMD(new Date(backup.exportedAt)))}. API keys are never in backups, so add yours again in Settings.`,
    'Restore',
  );
  if (!ok) return false;
  restoreData(backup);
  return true;
}
