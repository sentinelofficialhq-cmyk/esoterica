jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { replyTo, sendMessage } from '@/ai/chat';
import { createMockProvider } from '@/ai/mock';
import type { AIProvider, StoredMessage } from '@/ai/types';
import { useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';

const provider = createMockProvider({ delayMs: 0 });
const base = { provider, effort: 'low' as const, dailyLine: '[Today is Tue 13 Oct 2026]', onText: () => {} };

const newChat = () =>
  useChatStore.getState().newConversation({ mode: 'general', system: 'You are Jung.', provider: 'mock', model: 'mock-jung' });
const messages = (id: string) => useChatStore.getState().conversations.find((c) => c.id === id)!.messages;

test('history is append-only across turns', async () => {
  const id = newChat();
  await sendMessage({ ...base, convId: id, text: 'First', today: '2026-10-13' });
  const snapshot = JSON.parse(JSON.stringify(messages(id))) as StoredMessage[];
  await sendMessage({ ...base, convId: id, text: 'Second', today: '2026-10-13' });
  await sendMessage({ ...base, convId: id, text: 'Third', today: '2026-10-13' });
  expect(messages(id)).toHaveLength(6);
  expect(messages(id).slice(0, 2)).toEqual(snapshot);
  expect(useSettingsStore.getState().usage.byModel['mock-jung'].inputTokens).toBeGreaterThan(0);
});

test('daily context is added to the first message of each day only', async () => {
  const id = newChat();
  await sendMessage({ ...base, convId: id, text: 'Morning', today: '2026-10-13' });
  await sendMessage({ ...base, convId: id, text: 'Later', today: '2026-10-13' });
  await sendMessage({ ...base, convId: id, text: 'Next day', today: '2026-10-14', dailyLine: '[Today is Wed 14 Oct 2026]' });
  const users = messages(id).filter((m) => m.role === 'user');
  expect(users[0].content).toBe('[Today is Tue 13 Oct 2026]\n\nMorning');
  expect(users[0].text).toBe('Morning');
  expect(users[1].content).toBe('Later');
  expect(users[2].content).toBe('[Today is Wed 14 Oct 2026]\n\nNext day');
});

test('a failed send can be retried without duplicating the message', async () => {
  const id = newChat();
  await expect(sendMessage({ ...base, provider: createMockProvider({ fail: true }), convId: id, text: 'Hello?', today: '2026-10-13' })).rejects.toThrow();
  expect(messages(id)).toHaveLength(1);
  expect(messages(id)[0].status).toBe('failed');
  await replyTo({ ...base, convId: id, today: '2026-10-13' });
  expect(messages(id)).toHaveLength(2);
  expect(messages(id)[0].status).toBe('ok');
  expect(messages(id)[1].role).toBe('assistant');
});

test('a stopped reply is kept for display but never sent again', async () => {
  const id = newChat();
  const controller = new AbortController();
  const stopper = createMockProvider({ delayMs: 1 });
  const p = sendMessage({ ...base, provider: stopper, convId: id, text: 'Tell me a long story', today: '2026-10-13', signal: controller.signal, onText: () => controller.abort() });
  await expect(p).resolves.toMatchObject({ stopped: true });
  expect(messages(id)[1]).toMatchObject({ role: 'assistant', status: 'stopped' });

  let seen: StoredMessage[] = [];
  const spy: AIProvider = { ...provider, streamReply: async (req) => { seen = req.messages; return provider.streamReply(req); } };
  await sendMessage({ ...base, provider: spy, convId: id, text: 'Go on', today: '2026-10-13' });
  expect(seen.some((m) => m.status === 'stopped')).toBe(true); // stored…
  // …but the provider adapters drop stopped turns before sending (see anthropic/openai tests).
});
