import { AppState, type AppStateStatus } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { isReturnVisit, RETURN_AFTER_MS, useLaunchTracking } from '@/analytics/launch';
import { useAnalyticsQueue } from '@/analytics/track';
import { useExperimentStore } from '@/store/experimentStore';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';

let onChange: ((s: AppStateStatus) => void) | null = null;
let mounted: ReactTestRenderer | null = null;

beforeEach(() => {
  jest.useFakeTimers({ now: new Date('2026-10-14T09:00:00Z') });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, fn) => {
    onChange = fn as (s: AppStateStatus) => void;
    return { remove: () => (onChange = null) } as ReturnType<typeof AppState.addEventListener>;
  });
  useAnalyticsQueue.getState().clear();
  useSettingsStore.setState({ shareUsage: true, theme: 'ember' });
  useProfileStore.setState({ onboarded: false });
  useExperimentStore.setState({ installId: null, enrolled: false, firstOpenAt: null, assignments: {}, remote: {} });
});

afterEach(() => {
  act(() => mounted?.unmount());
  mounted = null;
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function Probe({ hydrated, onReady }: { hydrated: boolean; onReady: (ready: boolean) => void }) {
  onReady(useLaunchTracking(hydrated));
  return null;
}

function render(el: React.ReactElement): { update: (next: React.ReactElement) => void } {
  // act() from react-test-renderer; async acts flush the launch effect's promise chain.
  act(() => {
    mounted = create(el);
  });
  return { update: (next) => act(() => mounted!.update(next)) };
}

const names = () => useAnalyticsQueue.getState().events.map((e) => `${e.name}${e.name === 'app_open' ? `:${e.props.cold}` : ''}`);

test('a return counts only after half an hour away', () => {
  expect(isReturnVisit(null, 1_000)).toBe(false);
  expect(isReturnVisit(0, RETURN_AFTER_MS - 1)).toBe(false);
  expect(isReturnVisit(0, RETURN_AFTER_MS)).toBe(true);
});

test('waits for storage, then enrolls, starts the assigned look and records the launch', async () => {
  const ready: boolean[] = [];
  const view = render(<Probe hydrated={false} onReady={(r) => ready.push(r)} />);
  expect(useExperimentStore.getState().installId).toBeNull();
  expect(names()).toEqual([]);

  view.update(<Probe hydrated onReady={(r) => ready.push(r)} />);
  // No server is configured in tests, so the settings lookup returns at once.
  await act(async () => {});
  const ex = useExperimentStore.getState();
  expect(ex.installId).not.toBeNull();
  expect(ex.enrolled).toBe(true);
  expect(useSettingsStore.getState().theme).toBe(ex.assignments.theme!.variant);
  expect(names()).toEqual(['experiment_assigned', 'experiment_assigned', 'app_open:true']);
  expect(ready[0]).toBe(false);
  expect(ready[ready.length - 1]).toBe(true);
});

test('records a warm open after 30 minutes in the background, not after a short switch', async () => {
  render(<Probe hydrated onReady={() => {}} />);
  await act(async () => {});
  useAnalyticsQueue.getState().clear();

  act(() => onChange!('background'));
  jest.advanceTimersByTime(5 * 60 * 1000);
  act(() => onChange!('active'));
  expect(names()).toEqual([]);

  act(() => onChange!('background'));
  jest.advanceTimersByTime(RETURN_AFTER_MS);
  act(() => onChange!('active'));
  expect(names()).toEqual(['app_open:false']);
});
