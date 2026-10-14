import { createMockProvider } from '@/ai/mock';
import { dreamPrompt, interpretDream } from '@/jung/dreamInterpretation';
import type { Dream } from '@/jung/types';

const dream: Dream = {
  id: 'd1',
  date: '2026-10-12',
  title: 'The flooded house',
  text: 'Water was rising through the floor of my childhood house while a stranger watched from the stairs.',
  mood: 2,
  tags: ['water'],
  lucid: false,
  recurring: true,
  symbols: [],
  figures: [],
  themes: [],
};
const older: Dream = { ...dream, id: 'd0', date: '2026-10-01', title: 'Snake in the garden', text: 'A snake curled around a tree.', recurring: false, symbols: ['snake'] };

test('the prompt carries the dream, the mood, flags and recent dreams', () => {
  const p = dreamPrompt(dream, [older]);
  expect(p).toContain(dream.text);
  expect(p).toContain('The flooded house');
  expect(p).toMatch(/uneasy/i);
  expect(p).toMatch(/recurring/i);
  expect(p).toContain('Snake in the garden');
});

test('interpretation streams text, then extracts symbols and figures', async () => {
  const deltas: string[] = [];
  const r = await interpretDream({ provider: createMockProvider({ delayMs: 0 }), system: 'You are Jung.', dream, recent: [older], onText: (d) => deltas.push(d) });
  expect(r.text.length).toBeGreaterThan(0);
  expect(deltas.join('')).toBe(r.text);
  expect(r.extraction).toEqual({ symbols: ['water', 'house'], figures: ['shadow'], themes: ['transition'] });
  expect(r.user.role).toBe('user');
  expect(r.assistant.role).toBe('assistant');
});
