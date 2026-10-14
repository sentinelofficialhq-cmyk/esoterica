import { SHADOW_PROMPTS } from '@/content/shadowPrompts';
import { dailyPrompt } from '@/jung/dailyPrompt';
import { addDays } from '@/lib/date';

test('same date gives the same prompt', () => {
  expect(dailyPrompt('2026-10-13', null, []).id).toBe(dailyPrompt('2026-10-13', null, []).id);
});

test('recent prompts are skipped while alternatives exist', () => {
  const first = dailyPrompt('2026-10-13', null, []);
  expect(dailyPrompt('2026-10-13', null, [first.id]).id).not.toBe(first.id);
});

test('with an inferior function, prompts target it or are general', () => {
  for (let i = 0; i < 40; i++) {
    const p = dailyPrompt(addDays('2026-10-01', i), 'Se', []);
    expect(p.tags.some((t) => t === 'Se' || t === 'general')).toBe(true);
  }
});

test('a theme overrides the inferior-function filter', () => {
  for (let i = 0; i < 10; i++) {
    expect(dailyPrompt(addDays('2026-10-01', i), 'Se', [], 'persona').tags).toContain('persona');
  }
});

test('falls back to the full pool when everything was recent', () => {
  const all = SHADOW_PROMPTS.map((p) => p.id);
  expect(dailyPrompt('2026-10-13', null, all)).toBeDefined();
});
