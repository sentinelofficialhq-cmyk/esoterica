import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { startConversation } from '@/ai/start';
import { SHADOW_PROMPTS } from '@/content/shadowPrompts';
import { useTodaysPrompt } from '@/jung/useTodaysPrompt';
import { formatDate, todayLocal } from '@/lib/date';
import { useJournalStore } from '@/store/journalStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { TextField } from '@/ui/TextField';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

const promptText = (id: string) => SHADOW_PROMPTS.find((p) => p.id === id)?.text ?? '';

const THEMES = { persona: 'Persona', anima: 'Anima / Animus', self: 'Self', projection: 'Projection' } as const;
type Theme = keyof typeof THEMES;

export default function ShadowWork() {
  const { colors } = useTheme();
  const { theme: themeParam } = useLocalSearchParams<{ theme?: string }>();
  const theme = themeParam && themeParam in THEMES ? (themeParam as Theme) : undefined;
  const today = todayLocal();
  const prompt = useTodaysPrompt(theme);
  const entries = useJournalStore((s) => s.shadowEntries);
  const projections = useJournalStore((s) => s.projections);
  const addShadowEntry = useJournalStore((s) => s.addShadowEntry);
  const answered = entries.find((e) => e.date === today && e.promptId === prompt.id);
  const [draft, setDraft] = useState('');

  const askJung = (q: string) => {
    const id = startConversation({ mode: 'shadow' });
    router.push({ pathname: '/chat', params: { id, q } });
  };

  return (
    <Screen header={<ScreenHeader title="Shadow work" />}>
      <Txt variant="bodyDim">
        The shadow holds what we refuse to see in ourselves, and also the gifts we never lived. One honest question a day is enough.
      </Txt>

      <Card tone="ember">
        <SectionLabel>{theme ? `${THEMES[theme]} reflection` : `Today · ${formatDate(today)}`}</SectionLabel>
        <Txt variant="heading">{prompt.text}</Txt>
        {answered ? (
          <>
            <Txt variant="body">{answered.text}</Txt>
            <Button label="Explore this with Jung" variant="ghost" onPress={() => askJung(`Today’s shadow prompt was: “${prompt.text}” My answer: ${answered.text}`)} />
          </>
        ) : (
          <>
            <TextField value={draft} onChangeText={setDraft} placeholder="Write freely. No one else will read this." multiline />
            <Button
              label="Save"
              disabled={!draft.trim()}
              onPress={() => {
                addShadowEntry({ date: today, promptId: prompt.id, text: draft.trim() });
                setDraft('');
              }}
            />
          </>
        )}
      </Card>

      <Card onPress={() => router.push('/projection')}>
        <Txt variant="heading">Projection check</Txt>
        <Txt variant="small">Someone got under your skin? Five questions to find what in you they are reflecting.</Txt>
      </Card>

      {entries.length ? (
        <View style={styles.list}>
          <Txt variant="label">Past entries</Txt>
          {entries.map((e) => (
            <Card key={e.id}>
              <Txt variant="small">{formatDate(e.date)}</Txt>
              <Txt variant="body" italic>
                {promptText(e.promptId)}
              </Txt>
              <Txt variant="bodyDim">{e.text}</Txt>
            </Card>
          ))}
        </View>
      ) : null}

      {projections.length ? (
        <View style={styles.list}>
          <Txt variant="label">Projection checks</Txt>
          {projections.map((p) => (
            <Card key={p.id}>
              <Txt variant="small">{formatDate(p.date)}</Txt>
              <Txt variant="body">{`${p.who}: ${p.quality}`}</Txt>
              <Txt variant="bodyDim">{p.inMe}</Txt>
              <Txt
                variant="small"
                color={colors.accent}
                onPress={() =>
                  askJung(
                    `A projection check. Who triggered me: ${p.who}. What they did: ${p.what}. The quality it shows: ${p.quality}. Where it might live in me: ${p.inMe}. Owning a little of it might look like: ${p.owning}.`,
                  )
                }>
                Explore with Jung
              </Txt>
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ list: { gap: space(2) } });
