import * as DocumentPicker from 'expo-document-picker';

/**
 * Web: hand the file to the share sheet when the browser can share files (iPhone: Save to Files),
 * otherwise download it. Call straight from a tap: share needs the tap's user activation.
 */
export async function saveBackupFile(name: string, json: string): Promise<boolean> {
  const file = new File([json], name, { type: 'application/json' });
  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Esoterica backup' });
      return true;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return false;
      // Not allowed here (e.g. desktop policy): fall back to a download.
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return true;
}

/** Web: pick a backup file and return its text, or null if the picker was closed. */
export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ base64: false });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return asset.file ? asset.file.text() : (await fetch(asset.uri)).text();
}
