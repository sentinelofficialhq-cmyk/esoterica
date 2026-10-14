import { z } from 'zod';

import { getProvider } from '@/ai/client';
import type { AIProvider, StoredMessage, Usage } from '@/ai/types';
import { todayLocal } from '@/lib/date';
import { getConversation, useChatStore } from '@/store/chatStore';
import { MEMORY_CATEGORIES, normalizeNotes, useMemoryStore, type MemoryCategory } from '@/store/memoryStore';
import { useSettingsStore } from '@/store/settingsStore';

export const MemorySchema = z.object({
  notes: z.array(z.object({ text: z.string(), category: z.enum(MEMORY_CATEGORIES) })),
});

const counted = (messages: StoredMessage[]) => messages.filter((m) => m.status !== 'failed' && m.status !== 'stopped');

export function shouldExtract(conv: { messages: StoredMessage[]; extractedAt: number }, memoryEnabled: boolean): boolean {
  return memoryEnabled && counted(conv.messages).length - conv.extractedAt >= 4;
}

/** Plain-text transcript for the note-taker (display text, so no daily-context prefixes). */
export function transcriptOf(messages: StoredMessage[], maxChars = 12000): string {
  const t = counted(messages)
    .map((m) => `${m.role === 'user' ? 'Person' : 'Jung'}: ${m.text}`)
    .join('\n\n');
  return t.length > maxChars ? t.slice(t.length - maxChars) : t;
}

const NOTE_TAKER = `You keep Jung's private notes about a person he talks with in the Esoterica app. Notes help him remember them next time.`;

export async function updateMemory(
  provider: AIProvider,
  existing: { text: string; category: MemoryCategory }[],
  transcript: string,
): Promise<{ notes: { text: string; category: MemoryCategory }[]; usage: Usage }> {
  const prompt = `Existing notes:\n${existing.length ? existing.map((n) => `- [${n.category}] ${n.text}`).join('\n') : '(none)'}\n\nNew conversation:\n${transcript}\n\nReturn the full updated list of durable notes about this person, at most 40. Merge duplicates, drop trivia and anything outdated, and keep their own words where possible. Each note is one short sentence. Do not record crisis details beyond a gentle reminder to check in.`;
  const { data, usage } = await provider.extract({ system: NOTE_TAKER, prompt, schema: MemorySchema, effort: 'low' });
  return { notes: normalizeNotes(data.notes), usage };
}

let catchingUp = false;

/**
 * Update memory from every conversation that has 4+ unprocessed messages. Runs at app start and
 * when the Ask tab opens, so closing the app mid-chat never loses a conversation's notes.
 */
export async function catchUpMemory(): Promise<void> {
  if (catchingUp) return;
  catchingUp = true;
  try {
    const enabled = useSettingsStore.getState().memoryEnabled;
    for (const c of useChatStore.getState().conversations) {
      if (shouldExtract(c, enabled)) await maybeUpdateMemory(c.id);
    }
  } finally {
    catchingUp = false;
  }
}

/** Called when the user leaves a chat. Never throws: memory is a nice-to-have. */
export async function maybeUpdateMemory(convId: string): Promise<void> {
  try {
    const conv = getConversation(convId);
    const settings = useSettingsStore.getState();
    if (!conv || !shouldExtract(conv, settings.memoryEnabled)) return;
    const provider = await getProvider(settings);
    const existing = useMemoryStore.getState().notes.map(({ text, category }) => ({ text, category }));
    const { notes, usage } = await updateMemory(provider, existing, transcriptOf(conv.messages));
    useMemoryStore.getState().setNotes(notes);
    useChatStore.getState().markExtracted(convId, counted(conv.messages).length);
    settings.addUsage(provider.model, usage, todayLocal().slice(0, 7));
  } catch (err) {
    console.warn('Memory update skipped:', err);
  }
}
