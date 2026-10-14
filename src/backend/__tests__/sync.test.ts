import type { QueuedEvent } from '@/analytics/events';

const mockCalls: { table: string; rows: unknown; opts: unknown }[] = [];
let mockSession: { user: { id: string } } | null = { user: { id: 'user-1' } };

jest.mock('@/backend/supabase', () => ({
  supabase: () => ({
    from: (table: string) => ({
      upsert: async (rows: unknown, opts: unknown) => {
        mockCalls.push({ table, rows, opts });
        return { error: null };
      },
    }),
  }),
  ensureSession: async () => mockSession,
}));

import { parseExperimentRows, supabaseTransport } from '@/backend/sync';
import { useExperimentStore } from '@/store/experimentStore';

const event: QueuedEvent = {
  id: 'evt1',
  name: 'app_open',
  props: { cold: true },
  ts: '2026-10-14T09:00:00.000Z',
  installId: 'install-1',
  variants: { theme: 'daylight' },
  appVersion: '1.0.0',
  platform: 'ios',
};

beforeEach(() => {
  mockCalls.length = 0;
  mockSession = { user: { id: 'user-1' } };
  useExperimentStore.setState({
    installId: 'install-1',
    enrolled: true,
    firstOpenAt: '2026-10-14T08:59:00.000Z',
    assignments: { theme: { variant: 'daylight', at: '2026-10-14T08:59:00.000Z' }, paywall: { variant: 'jung', at: '2026-10-14T08:59:00.000Z' } },
    remote: {},
    registeredFor: null,
  });
});

test('server settings are read, and malformed rows are skipped', () => {
  const parsed = parseExperimentRows([
    { key: 'theme', variants: [{ id: 'ember', weight: 1 }, { id: 'daylight', weight: 2 }], status: 'stopped', winner: 'daylight' },
    { key: 'paywall', variants: [{ id: 'jung', weight: -1 }], status: 'running', winner: null },
    { key: 'unknown', variants: [{ id: 'x', weight: 1 }], status: 'running', winner: null },
  ]);
  expect(parsed).toEqual({ theme: { key: 'theme', variants: [{ id: 'ember', weight: 1 }, { id: 'daylight', weight: 2 }], status: 'stopped', winner: 'daylight' } });
  expect(parseExperimentRows([{ key: 'theme', variants: [{ id: 'ember', weight: 0 }], status: 'running', winner: null }])).toEqual({});
  expect(parseExperimentRows([{ key: 'theme', variants: [{ id: 'ember', weight: 1 }], status: 'stopped', winner: 'gone' }]).theme?.winner).toBeNull();
});

test('the first send registers the install and its groups, then later sends only add events', async () => {
  await supabaseTransport.send([event]);
  expect(mockCalls.map((c) => c.table)).toEqual(['installs', 'assignments', 'events']);
  expect(mockCalls[0].rows).toMatchObject({ install_id: 'install-1', enrolled: true, first_open_at: '2026-10-14T08:59:00.000Z' });
  expect(mockCalls[1].rows).toEqual([
    { install_id: 'install-1', experiment: 'theme', variant: 'daylight', assigned_at: '2026-10-14T08:59:00.000Z' },
    { install_id: 'install-1', experiment: 'paywall', variant: 'jung', assigned_at: '2026-10-14T08:59:00.000Z' },
  ]);
  expect(mockCalls[2]).toMatchObject({
    rows: [{ id: 'evt1', install_id: 'install-1', name: 'app_open', props: { cold: true }, client_ts: '2026-10-14T09:00:00.000Z' }],
    opts: { onConflict: 'install_id,id', ignoreDuplicates: true },
  });
  mockCalls.length = 0;
  await supabaseTransport.send([event]);
  expect(mockCalls.map((c) => c.table)).toEqual(['events']);
});

test('without a session the send fails, so the events stay queued', async () => {
  mockSession = null;
  await expect(supabaseTransport.send([event])).rejects.toThrow('offline');
  expect(mockCalls).toEqual([]);
});
