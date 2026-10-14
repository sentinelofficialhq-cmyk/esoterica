import { mixedHash, newInstallId, pickVariant } from '@/experiments/assign';
import { BUILT_IN_EXPERIMENTS, type ExperimentConfig } from '@/experiments/config';
import { ensureEnrollment, paywallVariant } from '@/experiments/enroll';
import { useAnalyticsQueue } from '@/analytics/track';
import { useExperimentStore } from '@/store/experimentStore';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { THEME_IDS } from '@/ui/themes';

const ids = (n: number) => Array.from({ length: n }, (_, i) => `install-${i}-${(i * 7919) % 104729}`);

beforeEach(() => {
  useExperimentStore.setState({ installId: null, enrolled: false, firstOpenAt: null, assignments: {}, remote: {} });
  useProfileStore.getState().reset();
  useAnalyticsQueue.getState().clear();
  useSettingsStore.setState({ theme: 'ember', shareUsage: true });
});

test('the built-in theme experiment covers exactly the six looks', () => {
  expect(BUILT_IN_EXPERIMENTS.theme.variants.map((v) => v.id).sort()).toEqual([...THEME_IDS].sort());
});

test('assignment is stable for an install', () => {
  for (const id of ids(50)) expect(pickVariant(id, BUILT_IN_EXPERIMENTS.theme)).toBe(pickVariant(id, BUILT_IN_EXPERIMENTS.theme));
});

test('six looks split evenly (within ±2 points) across 60,000 installs', () => {
  const counts = new Map<string, number>();
  for (const id of ids(60000)) {
    const v = pickVariant(id, BUILT_IN_EXPERIMENTS.theme);
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  expect(counts.size).toBe(6);
  for (const n of counts.values()) expect(Math.abs(n / 60000 - 1 / 6)).toBeLessThan(0.02);
});

test('look and paywall are assigned independently: all 18 combinations near 1/18', () => {
  const cells = new Map<string, number>();
  const N = 72000;
  for (const id of ids(N)) {
    const key = `${pickVariant(id, BUILT_IN_EXPERIMENTS.theme)}|${pickVariant(id, BUILT_IN_EXPERIMENTS.paywall)}`;
    cells.set(key, (cells.get(key) ?? 0) + 1);
  }
  expect(cells.size).toBe(18);
  for (const n of cells.values()) expect(Math.abs(n / N - 1 / 18)).toBeLessThan(0.01);
});

test('weights are respected, zero-weight variants are never assigned, and a stopped test gives everyone the winner', () => {
  const weighted: ExperimentConfig = { key: 'paywall', status: 'running', variants: [{ id: 'timeline', weight: 3 }, { id: 'locked', weight: 1 }, { id: 'jung', weight: 0 }] };
  const tally = { timeline: 0, locked: 0, jung: 0 } as Record<string, number>;
  for (const id of ids(40000)) tally[pickVariant(id, weighted)] += 1;
  expect(tally.jung).toBe(0);
  expect(Math.abs(tally.timeline / 40000 - 0.75)).toBeLessThan(0.02);
  const stopped: ExperimentConfig = { ...weighted, status: 'stopped', winner: 'locked' };
  for (const id of ids(100)) expect(pickVariant(id, stopped)).toBe('locked');
});

test('the mixed hash spreads one-character changes across all bits', () => {
  const a = mixedHash('abc:theme');
  const b = mixedHash('abc:themf');
  let differing = 0;
  for (let bit = 0; bit < 32; bit++) if (((a ^ b) >>> bit) & 1) differing++;
  expect(differing).toBeGreaterThan(8);
});

test('install ids are random and unique', () => {
  const set = new Set(Array.from({ length: 1000 }, newInstallId));
  expect(set.size).toBe(1000);
});

test('a new install is enrolled, starts in its assigned look, and records both assignments', () => {
  ensureEnrollment(new Date('2026-10-14T12:00:00Z'));
  const ex = useExperimentStore.getState();
  expect(ex.installId).toBeTruthy();
  expect(ex.enrolled).toBe(true);
  expect(ex.firstOpenAt).toBe('2026-10-14T12:00:00.000Z');
  expect(THEME_IDS).toContain(ex.assignments.theme?.variant);
  expect(useSettingsStore.getState().theme).toBe(ex.assignments.theme?.variant);
  expect(['timeline', 'locked', 'jung']).toContain(paywallVariant());
  const names = useAnalyticsQueue.getState().events.map((e) => [e.name, e.props.experiment]);
  expect(names).toEqual([
    ['experiment_assigned', 'theme'],
    ['experiment_assigned', 'paywall'],
  ]);
  // Running again changes nothing.
  const before = useExperimentStore.getState().assignments;
  ensureEnrollment();
  expect(useExperimentStore.getState().assignments).toBe(before);
});

test('an install set up before the test keeps its look and is left out', () => {
  useProfileStore.getState().setProfile({ name: 'Ezekiel', birthDate: '2005-09-21' });
  useProfileStore.getState().completeOnboarding();
  useSettingsStore.setState({ theme: 'gilded' });
  ensureEnrollment();
  const ex = useExperimentStore.getState();
  expect(ex.enrolled).toBe(false);
  expect(ex.assignments).toEqual({});
  expect(useSettingsStore.getState().theme).toBe('gilded');
  expect(paywallVariant()).toBe('timeline');
});
