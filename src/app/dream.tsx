import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { describeAIError, getProvider, NoKeyError } from '@/ai/client';
import { startConversation, systemPromptFor } from '@/ai/start';
import type { StoredMessage } from '@/ai/types';
import { interpretDream, MOODS } from '@/jung/dreamInterpretation';
import type { Dream } from '@/jung/types';
import { confirm } from '@/lib/confirm';
import { parseYMD, todayLocal } from '@/lib/date';
import { useJournalStore } from '@/store/journalStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Markdown } from '@/ui/Markdown';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { TextField } from '@/ui/TextField';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

const MOOD_VALUES: Dream['mood'][] = [1, 2, 3, 4, 5];

export default function DreamEditor() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const [id, setId] = useState<string | undefined>(params.id);
  const existing = useJournalStore((s) => (id ? s.dreams.find((d) => d.id === id) : undefined));
  const { addDream, updateDream, removeDream } = useJournalStore.getState();

  const [date, setDate] = useState(existing?.date ?? todayLocal());
  const [title, setTitle] = useState(existing?.title ?? '');
  const [text, setText] = useState(existing?.text ?? '');
  const [mood, setMood] = useState<Dream['mood']>(existing?.mood ?? 3);
  const [tags, setTags] = useState(existing?.tags.join(', ') ?? '');
  const [lucid, setLucid] = useState(existing?.lucid ?? false);
  const [recurring, setRecurring] = useState(existing?.recurring ?? false);

  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [error, setError] = useState<{ text: string; noKey: boolean } | null>(null);
  const exchange = useRef<{ system: string; user: StoredMessage; assistant: StoredMessage } | null>(null);

  const validDate = () => {
    try {
      parseYMD(date);
      return date;
    } catch {
      return todayLocal();
    }
  };

  const fields = () => ({
    date: validDate(),
    title: title.trim(),
    text: text.trim(),
    mood,
    tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    lucid,
    recurring,
  });

  const save = (): string | undefined => {
    if (!text.trim()) return undefined;
    if (id) {
      updateDream(id, fields());
      return id;
    }
    const newId = addDream(fields());
    setId(newId);
    return newId;
  };

  const interpret = async () => {
    const dreamId = save();
    if (!dreamId) return;
    setBusy(true);
    setError(null);
    setStreaming('');
    try {
      const settings = useSettingsStore.getState();
      const provider = await getProvider(settings);
      const dream = useJournalStore.getState().dreams.find((d) => d.id === dreamId)!;
      const recent = useJournalStore.getState().dreams.filter((d) => d.id !== dreamId).slice(0, 5);
      const system = systemPromptFor('dreams');
      let buffer = '';
      const r = await interpretDream({
        provider,
        system,
        dream,
        recent,
        onText: (d) => {
          buffer += d;
          setStreaming(buffer);
        },
      });
      r.usage.forEach((u) => settings.addUsage(provider.model, u, todayLocal().slice(0, 7)));
      exchange.current = { system, user: r.user, assistant: r.assistant };
      updateDream(dreamId, {
        symbols: r.extraction.symbols,
        figures: r.extraction.figures,
        themes: r.extraction.themes,
        interpretation: { text: r.text, model: provider.model, createdAt: new Date().toISOString() },
      });
    } catch (err) {
      setError({ text: describeAIError(err), noKey: err instanceof NoKeyError });
    } finally {
      setBusy(false);
      setStreaming('');
    }
  };

  const discuss = () => {
    if (!existing?.interpretation) return;
    const ex = exchange.current;
    const conv = ex
      ? startConversation({ mode: 'dreams', system: ex.system, seed: [ex.user, ex.assistant], title: existing.title || 'A dream' })
      : startConversation({
          mode: 'dreams',
          title: existing.title || 'A dream',
          seed: [
            { role: 'user', content: `My dream: ${existing.text}`, text: `My dream: ${existing.title || existing.date}`, status: 'ok' },
            { role: 'assistant', content: existing.interpretation.text, text: existing.interpretation.text, status: 'ok' },
          ],
        });
    router.push({ pathname: '/chat', params: { id: conv } });
  };

  return (
    <Screen header={<ScreenHeader title={existing ? 'Dream' : 'Log a dream'} />}>
      <TextField label="Title (optional)" value={title} onChangeText={setTitle} placeholder="A few words to remember it by" />
      <TextField label="The dream" value={text} onChangeText={setText} placeholder="Write it as you remember it, fragments are fine…" multiline />
      <TextField label="Date" value={date} onChangeText={setDate} autoCapitalize="none" />
      <Txt variant="label">On waking I felt</Txt>
      <View style={styles.chips}>
        {MOOD_VALUES.map((m) => (
          <Chip key={m} label={MOODS[m]} selected={mood === m} onPress={() => setMood(m)} />
        ))}
      </View>
      <View style={styles.chips}>
        <Chip label="Recurring" selected={recurring} onPress={() => setRecurring(!recurring)} />
        <Chip label="Lucid" selected={lucid} onPress={() => setLucid(!lucid)} />
      </View>
      <TextField label="Your tags (comma separated)" value={tags} onChangeText={setTags} placeholder="water, house, mother" autoCapitalize="none" />

      <Button
        label={id ? 'Save changes' : 'Save dream'}
        variant="ghost"
        disabled={!text.trim()}
        onPress={() => {
          save();
          if (!id) router.back();
        }}
      />

      <Card tone="violet">
        <Txt variant="label" color={colors.violet}>
          {existing?.interpretation ? 'Jung’s reading of the dream' : 'Ask Jung to interpret'}
        </Txt>
        {streaming || existing?.interpretation ? (
          <Markdown serif>{streaming || existing!.interpretation!.text}</Markdown>
        ) : (
          <Txt variant="small" color={colors.text}>
            Jung looks at what your dream might be compensating for, the figures in it, and how it connects to your recent dreams.
          </Txt>
        )}
        {busy && !streaming ? (
          <Txt variant="bodyDim" italic>
            Jung is reading your dream…
          </Txt>
        ) : null}
        {error ? (
          <Txt variant="small" color={colors.danger} onPress={error.noKey ? () => router.push('/settings') : undefined}>
            {error.text}
          </Txt>
        ) : null}
        {!busy && existing?.interpretation ? (
          <>
            {existing.symbols.length || existing.figures.length ? (
              <View style={styles.chips}>
                {existing.figures.map((f) => (
                  <Chip key={`f-${f}`} label={f} tone="gold" />
                ))}
                {existing.symbols.map((s) => (
                  <Chip key={`s-${s}`} label={s} />
                ))}
              </View>
            ) : null}
            <Button label="Discuss with Jung" variant="ghost" onPress={discuss} />
          </>
        ) : null}
        {!busy && !existing?.interpretation ? <Button label="Interpret this dream" disabled={!text.trim()} onPress={interpret} /> : null}
      </Card>

      {existing ? (
        <Button
          label="Delete dream"
          variant="ghost"
          onPress={async () => {
            if (await confirm('Delete dream?', 'This dream and its interpretation will be removed.', 'Delete')) {
              removeDream(existing.id);
              router.back();
            }
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) } });
