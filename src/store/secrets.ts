import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type KeyProvider = 'anthropic' | 'openai' | 'gemini';

const keyName = (p: KeyProvider) => `rocket-key-${p}`;

/** API keys never enter backups or app state: SecureStore on native, localStorage on web. */
export async function getKey(p: KeyProvider): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return typeof localStorage === 'undefined' ? null : localStorage.getItem(keyName(p));
    return await SecureStore.getItemAsync(keyName(p));
  } catch {
    return null;
  }
}

export async function setKey(p: KeyProvider, value: string | null): Promise<void> {
  const v = value?.trim() || null;
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return;
    if (v) localStorage.setItem(keyName(p), v);
    else localStorage.removeItem(keyName(p));
    return;
  }
  if (v) await SecureStore.setItemAsync(keyName(p), v);
  else await SecureStore.deleteItemAsync(keyName(p));
}
