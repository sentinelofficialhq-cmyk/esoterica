import { shouldExtract, transcriptOf, updateMemory } from '@/ai/memory';
import { createMockProvider } from '@/ai/mock';
import type { StoredMessage } from '@/ai/types';

const msgs = (n: number): StoredMessage[] =>
  Array.from({ length: n }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}`, text: `m${i}`, status: 'ok' }) as StoredMessage);

test('extract only when memory is on and 4+ new messages exist', () => {
  expect(shouldExtract({ messages: msgs(4), extractedAt: 0 }, true)).toBe(true);
  expect(shouldExtract({ messages: msgs(4), extractedAt: 0 }, false)).toBe(false);
  expect(shouldExtract({ messages: msgs(6), extractedAt: 4 }, true)).toBe(false);
  expect(shouldExtract({ messages: [...msgs(3), { role: 'assistant', content: '', text: '', status: 'stopped' }], extractedAt: 0 }, true)).toBe(false);
});

test('transcript uses display text, labels speakers, and skips stopped turns', () => {
  const t = transcriptOf([
    { role: 'user', content: '[Today is …]\n\nHello', text: 'Hello', status: 'ok' },
    { role: 'assistant', content: 'Hi', text: 'Hi', status: 'ok' },
    { role: 'assistant', content: 'cut', text: 'cut', status: 'stopped' },
  ]);
  expect(t).toBe('Person: Hello\n\nJung: Hi');
});

test('updateMemory returns normalized notes from the provider', async () => {
  const { notes } = await updateMemory(createMockProvider({ delayMs: 0 }), [{ text: 'Loves the sea', category: 'life' }], 'Person: hi');
  expect(notes).toEqual([{ text: 'Is curious about their dreams', category: 'dreams' }]);
});
