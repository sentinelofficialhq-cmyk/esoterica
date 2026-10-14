import AsyncStorage from '@react-native-async-storage/async-storage';
import { del, get, set } from 'idb-keyval';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

// Store names keep their original 'rocket-' prefix so data saved before the Esoterica rename still loads.
// During static web export the app renders in Node, where IndexedDB doesn't exist: no-op there.
const hasIDB = () => typeof indexedDB !== 'undefined';

/** Zustand persist storage: IndexedDB on web (roomier than localStorage), AsyncStorage on native. */
export const persistStorage: StateStorage =
  Platform.OS === 'web'
    ? {
        getItem: async (name) => (hasIDB() ? ((await get<string>(name)) ?? null) : null),
        setItem: async (name, value) => {
          if (hasIDB()) await set(name, value);
        },
        removeItem: async (name) => {
          if (hasIDB()) await del(name);
        },
      }
    : {
        getItem: (name) => AsyncStorage.getItem(name),
        setItem: (name, value) => AsyncStorage.setItem(name, value),
        removeItem: (name) => AsyncStorage.removeItem(name),
      };

let persistRequested = false;

/** Ask the browser not to evict Esoterica's storage under pressure (best effort, web only). */
export function requestPersistence(): void {
  if (Platform.OS !== 'web' || persistRequested) return;
  persistRequested = true;
  try {
    void navigator.storage?.persist?.();
  } catch {
    // Older browsers: nothing to do.
  }
}
