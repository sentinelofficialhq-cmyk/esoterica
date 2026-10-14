import { describeUser, dailyContextLine } from '@/ai/context';
import { MODES } from '@/ai/modes';
import { buildSystemPrompt, JUNG_PERSONA } from '@/ai/persona';
import { buildProfile } from '@/engines/profile';
import { energyFor } from '@/engines/timing';

const profile = buildProfile({ name: 'Sam', birthName: 'John Smith', birthDate: '1990-05-14' });

test('persona names Jung and the safety lines', () => {
  expect(JUNG_PERSONA).toMatch(/Carl Gustav Jung/);
  expect(JUNG_PERSONA).toMatch(/988/);
  expect(JUNG_PERSONA).toMatch(/never invent quotations/i);
});

test('every mode has instructions and three starters', () => {
  for (const mode of Object.values(MODES)) {
    expect(mode.system.length).toBeGreaterThan(20);
    expect(mode.starters).toHaveLength(3);
  }
});

test('system prompt is deterministic and carries the user context', () => {
  const ctx = describeUser({ profile, date: '2026-10-13' });
  const a = buildSystemPrompt({ mode: 'dreams', userContext: ctx, notes: [] });
  const b = buildSystemPrompt({ mode: 'dreams', userContext: ctx, notes: [] });
  expect(a).toBe(b);
  expect(a).toContain('Life Path: 29/11');
  expect(a).toContain(MODES.dreams.system);
  expect(a).toContain('none yet');
  expect(buildSystemPrompt({ mode: 'custom', customFocus: 'my career change', userContext: ctx, notes: ['Works as a nurse'] })).toContain('my career change');
});

test('describeUser omits quiz lines until quizzes are taken', () => {
  const plain = describeUser({ profile, date: '2026-10-13' });
  expect(plain).not.toMatch(/Psychological type/);
  expect(plain).toMatch(/Chinese: Metal Horse/);
  const withType = describeUser({
    profile,
    date: '2026-10-13',
    types: { scores: { Te: 0, Ti: 0, Fe: 0, Fi: 0, Se: 0, Si: 0, Ne: 0, Ni: 100 }, dominant: 'Ni', auxiliary: 'Te', inferior: 'Se', code: 'INTJ', takenAt: '' },
  });
  expect(withType).toMatch(/Psychological type: dominant Introverted Intuition/);
});

test('daily context line', () => {
  const line = dailyContextLine(energyFor(profile, '2026-10-13'));
  expect(line).toMatch(/^\[Today is Tue 13 Oct 2026 · energy \d+ \w+ · personal day [\d/]+ · .+ · \w+ day\]$/);
});
