import { FUNCTIONS } from '@/content/functions';
import { SHADOW_PROMPTS } from '@/content/shadowPrompts';

const withTag = (tag: string) => SHADOW_PROMPTS.filter((p) => (p.tags as string[]).includes(tag));

test('at least 90 prompts with unique ids', () => {
  expect(SHADOW_PROMPTS.length).toBeGreaterThanOrEqual(90);
  expect(new Set(SHADOW_PROMPTS.map((p) => p.id)).size).toBe(SHADOW_PROMPTS.length);
  SHADOW_PROMPTS.forEach((p) => expect(p.text.length).toBeGreaterThan(20));
});

test('coverage per function and theme', () => {
  for (const fn of FUNCTIONS) expect(withTag(fn).length).toBeGreaterThanOrEqual(8);
  for (const tag of ['persona', 'anima', 'projection']) expect(withTag(tag).length).toBeGreaterThanOrEqual(10);
  expect(withTag('self').length).toBeGreaterThanOrEqual(5);
  expect(withTag('general').length).toBeGreaterThanOrEqual(5);
});
