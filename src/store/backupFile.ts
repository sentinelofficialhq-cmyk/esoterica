import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** Native: write the backup to the cache folder and open the share sheet (Save to Files, AirDrop, mail…). */
export async function saveBackupFile(name: string, json: string): Promise<boolean> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing isn’t available on this device.');
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(json);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Save your Esoterica backup' });
  return true;
}

/** Native: pick a backup file and return its text, or null if the picker was closed. */
export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
  if (result.canceled) return null;
  return new File(result.assets[0].uri).textSync();
}
