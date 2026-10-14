import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AnyModeId } from '@/ai/modes';
import type { ProviderId, StoredMessage } from '@/ai/types';
import { newId } from '@/lib/id';
import { persistStorage } from '@/store/storage';

export type Conversation = {
  id: string;
  title: string;
  /** Jung's or Neville's mode; the guide follows from it (see guideOfMode). */
  mode: AnyModeId;
  customFocus?: string;
  provider: ProviderId;
  model: string;
  /** Frozen at creation: every turn must send the identical system prompt. */
  system: string;
  createdAt: string;
  updatedAt: string;
  lastContextDate?: string;
  messages: StoredMessage[];
  /** Message count when memory was last extracted from this conversation. */
  extractedAt: number;
};

type NewConversation = { mode: AnyModeId; customFocus?: string; system: string; provider: ProviderId; model: string; title?: string; seed?: StoredMessage[] };

type ChatState = {
  conversations: Conversation[];
  newConversation: (c: NewConversation) => string;
  appendMessage: (id: string, m: StoredMessage) => void;
  replaceMessages: (id: string, messages: StoredMessage[]) => void;
  setMessageStatus: (id: string, index: number, status: StoredMessage['status']) => void;
  setLastContextDate: (id: string, date: string) => void;
  markExtracted: (id: string, count: number) => void;
  rename: (id: string, title: string) => void;
  remove: (id: string) => void;
};

const titleFrom = (text: string) => (text.length > 40 ? `${text.slice(0, 40).trim()}…` : text);

export const useChatStore = create<ChatState>()(
  persist(
    (set) => {
      const patch = (id: string, fn: (c: Conversation) => Partial<Conversation>) =>
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === id ? { ...c, ...fn(c), updatedAt: new Date().toISOString() } : c)),
        }));
      return {
        conversations: [],
        newConversation: (c) => {
          const id = newId();
          const now = new Date().toISOString();
          const conversation: Conversation = {
            id,
            title: c.title ?? 'New conversation',
            mode: c.mode,
            customFocus: c.customFocus,
            provider: c.provider,
            model: c.model,
            system: c.system,
            createdAt: now,
            updatedAt: now,
            messages: c.seed ?? [],
            extractedAt: 0,
          };
          set((s) => ({ conversations: [conversation, ...s.conversations] }));
          return id;
        },
        appendMessage: (id, m) =>
          patch(id, (c) => ({
            messages: [...c.messages, m],
            title: c.title === 'New conversation' && m.role === 'user' ? titleFrom(m.text) : c.title,
          })),
        replaceMessages: (id, messages) => patch(id, () => ({ messages })),
        setMessageStatus: (id, index, status) =>
          patch(id, (c) => ({ messages: c.messages.map((m, i) => (i === index ? { ...m, status } : m)) })),
        setLastContextDate: (id, date) => patch(id, () => ({ lastContextDate: date })),
        markExtracted: (id, count) => patch(id, () => ({ extractedAt: count })),
        rename: (id, title) => patch(id, () => ({ title })),
        remove: (id) => set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id) })),
      };
    },
    { name: 'rocket-chats', storage: createJSONStorage(() => persistStorage) },
  ),
);

export const getConversation = (id: string): Conversation | undefined => useChatStore.getState().conversations.find((c) => c.id === id);
