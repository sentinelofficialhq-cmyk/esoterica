import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { persistStorage } from '@/store/storage';

/**
 * The Supabase project, from EXPO_PUBLIC_* variables (both are public; row-level security protects
 * the data). Without them the app runs offline-only: events stay queued and Jung needs a personal key.
 */
export const backendConfig = () => ({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  key: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
});

export const hasBackend = (): boolean => {
  const { url, key } = backendConfig();
  return !!url && !!key;
};

/** The session lives in the app's own storage: IndexedDB on the web, AsyncStorage on native. */
const authStorage = {
  getItem: async (key: string) => (await persistStorage.getItem(key)) as string | null,
  setItem: async (key: string, value: string) => void (await persistStorage.setItem(key, value)),
  removeItem: async (key: string) => void (await persistStorage.removeItem(key)),
};

let client: SupabaseClient | null | undefined;

/** The shared client, or null when no project is configured (or during the static web render). */
export function supabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (!hasBackend() || (Platform.OS === 'web' && typeof window === 'undefined')) return null;
  const { url, key } = backendConfig();
  client = createClient(url, key, {
    auth: { storage: authStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  });
  if (Platform.OS !== 'web') {
    // Refresh the session only while the app is in front (Supabase's guidance for React Native).
    AppState.addEventListener('change', (state) => {
      if (state === 'active') client?.auth.startAutoRefresh();
      else client?.auth.stopAutoRefresh();
    });
  }
  return client;
}

let pending: Promise<Session | null> | null = null;

/**
 * The person's session, signing in anonymously the first time. No account or email is asked for:
 * people can link Apple, Google or email later. Null when offline or no project is configured.
 */
export function ensureSession(): Promise<Session | null> {
  const sb = supabase();
  if (!sb) return Promise.resolve(null);
  if (pending) return pending;
  pending = (async () => {
    try {
      const { data } = await sb.auth.getSession();
      if (data.session) return data.session;
      const { data: signedIn, error } = await sb.auth.signInAnonymously();
      return error ? null : signedIn.session;
    } catch {
      return null;
    } finally {
      pending = null;
    }
  })();
  return pending;
}
