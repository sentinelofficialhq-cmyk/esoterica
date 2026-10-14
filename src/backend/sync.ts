import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { QueuedEvent } from '@/analytics/events';
import { type AnalyticsTransport, flush, setAnalyticsTransport } from '@/analytics/track';
import { ensureSession, supabase } from '@/backend/supabase';
import { EXPERIMENT_KEYS, type ExperimentConfig, type ExperimentKey } from '@/experiments/config';
import { startPurchases } from '@/purchases/start';
import { useExperimentStore } from '@/store/experimentStore';

type ExperimentRow = { key: string; variants: unknown; status: string; winner: string | null };

/** Server rows → experiment settings, skipping anything malformed so a bad edit can't break assignment. */
export function parseExperimentRows(rows: ExperimentRow[]): Partial<Record<ExperimentKey, ExperimentConfig>> {
  const out: Partial<Record<ExperimentKey, ExperimentConfig>> = {};
  for (const row of rows) {
    if (!(EXPERIMENT_KEYS as string[]).includes(row.key)) continue;
    if (row.status !== 'running' && row.status !== 'stopped') continue;
    if (!Array.isArray(row.variants)) continue;
    const variants = row.variants.filter(
      (v): v is { id: string; weight: number } => !!v && typeof v.id === 'string' && typeof v.weight === 'number' && v.weight >= 0 && Number.isFinite(v.weight),
    );
    if (!variants.length || variants.length !== row.variants.length) continue;
    if (row.status === 'running' && !variants.some((v) => v.weight > 0)) continue;
    const winner = row.winner && variants.some((v) => v.id === row.winner) ? row.winner : null;
    out[row.key as ExperimentKey] = { key: row.key as ExperimentKey, variants, status: row.status, winner };
  }
  return out;
}

export const eventRow = (e: QueuedEvent) => ({
  id: e.id,
  install_id: e.installId,
  name: e.name,
  props: e.props,
  variants: e.variants,
  client_ts: e.ts,
  app_version: e.appVersion,
  platform: e.platform,
});

/** Records this install and its test groups on the server, once per signed-in user. */
async function registerInstall(userId: string): Promise<void> {
  const sb = supabase();
  const ex = useExperimentStore.getState();
  if (!sb || !ex.installId || !ex.firstOpenAt || ex.registeredFor === userId) return;
  const { error } = await sb.from('installs').upsert(
    {
      install_id: ex.installId,
      enrolled: ex.enrolled,
      first_open_at: ex.firstOpenAt,
      platform: Platform.OS,
      app_version: Constants.expoConfig?.version ?? 'unknown',
    },
    { onConflict: 'install_id', ignoreDuplicates: true },
  );
  if (error) throw error;
  const assignments = Object.entries(ex.assignments).map(([experiment, a]) => ({
    install_id: ex.installId,
    experiment,
    variant: a!.variant,
    assigned_at: a!.at,
  }));
  if (assignments.length) {
    const { error: aErr } = await sb.from('assignments').upsert(assignments, { onConflict: 'install_id,experiment', ignoreDuplicates: true });
    if (aErr) throw aErr;
  }
  ex.markRegistered(userId);
}

/** Sends queued events: signs in if needed, makes sure the install is registered, then inserts (duplicates ignored). */
export const supabaseTransport: AnalyticsTransport = {
  async send(events) {
    const sb = supabase();
    const session = await ensureSession();
    if (!sb || !session) throw new Error('offline');
    await registerInstall(session.user.id);
    const { error } = await sb.from('events').upsert(events.map(eventRow), { onConflict: 'install_id,id', ignoreDuplicates: true });
    if (error) throw error;
  },
};

/** Caches the server's test settings (weights, stopped tests and winners) for the next enrollment. */
export async function refreshExperimentSettings(): Promise<void> {
  const sb = supabase();
  if (!sb) return;
  const { data, error } = await sb.from('experiments').select('key, variants, status, winner');
  if (error || !data) return;
  useExperimentStore.getState().setRemote(parseExperimentRows(data as ExperimentRow[]));
}

/** Connects analytics and purchases to the server when a project is configured. Safe to call more than once. */
export function startBackendSync(): void {
  if (!supabase()) return;
  setAnalyticsTransport(supabaseTransport);
  void flush();
  void refreshExperimentSettings();
  void startPurchases();
}
