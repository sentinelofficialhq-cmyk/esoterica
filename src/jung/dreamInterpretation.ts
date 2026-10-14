import { z } from 'zod';

import type { AIProvider, StoredMessage, Usage } from '@/ai/types';
import type { Dream } from '@/jung/types';
import { formatDate } from '@/lib/date';

export const MOODS: Record<Dream['mood'], string> = { 1: 'distressed', 2: 'uneasy', 3: 'neutral', 4: 'calm', 5: 'joyful' };

export const DREAM_FIGURES = ['shadow', 'anima', 'animus', 'wise-elder', 'child', 'trickster', 'mother', 'father', 'stranger', 'animal', 'other'] as const;

export const DreamSchema = z.object({
  symbols: z.array(z.string()),
  figures: z.array(z.enum(DREAM_FIGURES)),
  themes: z.array(z.string()),
});
export type DreamExtraction = z.infer<typeof DreamSchema>;

/** What the dreamer tells Jung: the dream, how they woke, and the last few dreams for context. */
export function dreamPrompt(dream: Dream, recent: Dream[]): string {
  const flags = [dream.recurring ? 'This is a recurring dream.' : '', dream.lucid ? 'I knew I was dreaming.' : '']
    .filter(Boolean)
    .join(' ');
  const series = recent.length
    ? `\n\nMy recent dreams, for context:\n${recent
        .slice(0, 5)
        .map((d) => `- ${formatDate(d.date)}${d.title ? ` "${d.title}"` : ''}: ${d.text.slice(0, 140)}${d.symbols.length ? ` (symbols: ${d.symbols.join(', ')})` : ''}`)
        .join('\n')}`
    : '';
  return `Here is a dream I had on ${formatDate(dream.date)}${dream.title ? `, which I call "${dream.title}"` : ''}:\n\n${dream.text}\n\nOn waking I felt ${MOODS[dream.mood]}.${flags ? ` ${flags}` : ''}${dream.tags.length ? ` My own tags: ${dream.tags.join(', ')}.` : ''}${series}`;
}

const EXTRACTOR = 'You index dreams for a dream journal. List the concrete symbols (short nouns), the dream figures by Jungian role, and one to three short themes.';

/** Stream Jung's interpretation, then extract symbols/figures/themes for the motif tracker. */
export async function interpretDream(opts: {
  provider: AIProvider;
  system: string;
  dream: Dream;
  recent: Dream[];
  signal?: AbortSignal;
  onText: (delta: string) => void;
}): Promise<{ text: string; user: StoredMessage; assistant: StoredMessage; extraction: DreamExtraction; usage: Usage[] }> {
  const content = dreamPrompt(opts.dream, opts.recent);
  const user: StoredMessage = { role: 'user', content, text: `My dream: ${opts.dream.title || formatDate(opts.dream.date)}`, status: 'ok' };
  const res = await opts.provider.streamReply({ system: opts.system, messages: [user], effort: 'medium', signal: opts.signal, onText: opts.onText });
  const { data, usage } = await opts.provider.extract({
    system: EXTRACTOR,
    prompt: `Dream:\n${opts.dream.text}`,
    schema: DreamSchema,
    effort: 'low',
  });
  return { text: res.assistant.text, user, assistant: res.assistant, extraction: data, usage: [res.usage, usage] };
}
