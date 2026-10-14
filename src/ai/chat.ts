import type { AIProvider, Effort, StoredMessage } from '@/ai/types';
import { getConversation, useChatStore } from '@/store/chatStore';
import { useSettingsStore } from '@/store/settingsStore';

type ReplyDeps = {
  convId: string;
  provider: AIProvider;
  effort: Effort;
  /** Local date, YYYY-MM-DD. */
  today: string;
  signal?: AbortSignal;
  onText: (delta: string) => void;
};

export type ReplyOutcome = { refused: boolean; stopped?: boolean };

/**
 * Ask the provider to answer the conversation as it stands (the last message is the user's).
 * Successful replies are appended; a stopped reply is appended as "stopped" (shown, never sent);
 * a failure marks the last user message "failed" so it can be retried.
 */
export async function replyTo({ convId, provider, effort, today, signal, onText }: ReplyDeps): Promise<ReplyOutcome> {
  const store = useChatStore.getState();
  const conv = getConversation(convId);
  if (!conv) throw new Error('Conversation not found');

  // Retrying: a failed last user message becomes sendable again.
  const lastIndex = conv.messages.length - 1;
  if (conv.messages[lastIndex]?.role === 'user' && conv.messages[lastIndex].status === 'failed') {
    store.setMessageStatus(convId, lastIndex, 'ok');
  }
  const history = getConversation(convId)!.messages;

  let partial = '';
  try {
    const res = await provider.streamReply({
      system: conv.system,
      messages: history,
      effort,
      signal,
      onText: (d) => {
        partial += d;
        onText(d);
      },
    });
    if (res.strippedHistory) store.replaceMessages(convId, res.strippedHistory);
    store.appendMessage(convId, res.assistant);
    useSettingsStore.getState().addUsage(provider.model, res.usage, today.slice(0, 7));
    return { refused: res.refused };
  } catch (err) {
    if (signal?.aborted) {
      store.appendMessage(convId, { role: 'assistant', content: partial, text: partial, status: 'stopped' });
      return { refused: false, stopped: true };
    }
    const after = getConversation(convId)!.messages;
    const lastUser = after.map((m) => m.role).lastIndexOf('user');
    if (lastUser >= 0) store.setMessageStatus(convId, lastUser, 'failed');
    throw err;
  }
}

/** Append the user's message (with today's context on the first message of each day), then reply. */
export async function sendMessage(deps: ReplyDeps & { text: string; dailyLine: string }): Promise<ReplyOutcome> {
  const store = useChatStore.getState();
  const conv = getConversation(deps.convId);
  if (!conv) throw new Error('Conversation not found');
  const needsContext = conv.lastContextDate !== deps.today;
  const message: StoredMessage = {
    role: 'user',
    content: needsContext ? `${deps.dailyLine}\n\n${deps.text}` : deps.text,
    text: deps.text,
    status: 'ok',
  };
  store.appendMessage(deps.convId, message);
  if (needsContext) store.setLastContextDate(deps.convId, deps.today);
  return replyTo(deps);
}
