import type { QueuedEvent } from '@/analytics/events';
import { BATCH_SIZE, flush, forgetQueuedEvents, MAX_QUEUE, setAnalyticsTransport, track, useAnalyticsQueue } from '@/analytics/track';
import { useExperimentStore } from '@/store/experimentStore';
import { useSettingsStore } from '@/store/settingsStore';

beforeEach(() => {
  setAnalyticsTransport(null);
  useAnalyticsQueue.getState().clear();
  useSettingsStore.setState({ shareUsage: true });
  useExperimentStore.setState({
    installId: 'install-1',
    enrolled: true,
    firstOpenAt: '2026-10-14T00:00:00.000Z',
    assignments: { theme: { variant: 'daylight', at: '' }, paywall: { variant: 'jung', at: '' } },
    remote: {},
  });
});

test('events carry the install, its test groups, the platform and only the given props', () => {
  track('feature_open', { feature: 'dreams' });
  track('onboarding_complete');
  const [a, b] = useAnalyticsQueue.getState().events;
  expect(a).toMatchObject({ name: 'feature_open', props: { feature: 'dreams' }, installId: 'install-1', variants: { theme: 'daylight', paywall: 'jung' } });
  expect(typeof a.ts).toBe('string');
  expect(typeof a.platform).toBe('string');
  expect(b.props).toEqual({});
});

test('nothing is recorded when sharing is off, or before enrollment', () => {
  useSettingsStore.setState({ shareUsage: false });
  track('app_open', { cold: true });
  useSettingsStore.setState({ shareUsage: true });
  useExperimentStore.setState({ installId: null });
  track('app_open', { cold: true });
  expect(useAnalyticsQueue.getState().events).toHaveLength(0);
});

test('the queue keeps only the newest events when it overflows', () => {
  for (let i = 0; i < MAX_QUEUE + 25; i++) track('chat_message_sent', { guide: `g${i}` });
  const events = useAnalyticsQueue.getState().events;
  expect(events).toHaveLength(MAX_QUEUE);
  expect(events[events.length - 1].props.guide).toBe(`g${MAX_QUEUE + 24}`);
});

test('flush sends in batches and removes what was sent', async () => {
  const sent: QueuedEvent[][] = [];
  setAnalyticsTransport({ send: async (batch) => void sent.push(batch) });
  for (let i = 0; i < BATCH_SIZE + 10; i++) track('app_open', { cold: false });
  await flush();
  expect(sent.map((b) => b.length)).toEqual([BATCH_SIZE, 10]);
  expect(useAnalyticsQueue.getState().events).toHaveLength(0);
});

test('a failed send keeps the events for the next flush', async () => {
  let fail = true;
  const sent: QueuedEvent[] = [];
  setAnalyticsTransport({
    send: async (batch) => {
      if (fail) throw new Error('offline');
      sent.push(...batch);
    },
  });
  track('reading_view', { reading: 'daily' });
  await flush();
  expect(useAnalyticsQueue.getState().events).toHaveLength(1);
  fail = false;
  await flush();
  expect(sent).toHaveLength(1);
  expect(useAnalyticsQueue.getState().events).toHaveLength(0);
});

test('without a backend, flush keeps everything queued; forgetting clears it', async () => {
  track('app_open', { cold: true });
  await flush();
  expect(useAnalyticsQueue.getState().events).toHaveLength(1);
  forgetQueuedEvents();
  expect(useAnalyticsQueue.getState().events).toHaveLength(0);
});
