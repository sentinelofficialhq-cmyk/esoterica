import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { startConversation } from '@/ai/start';
import { meaningFor } from '@/content/numbers';
import { frequentNumbers, numberMeaning, numbersIn } from '@/jung/synchronicity';
import { formatDate, todayLocal } from '@/lib/date';
import { useJournalStore } from '@/store/journalStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { TextField } from '@/ui/TextField';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

export default function SynchronicityLog() {
  const { colors } = useTheme();
  const entries = useJournalStore((s) => s.synchronicities);
  const addSynchronicity = useJournalStore((s) => s.addSynchronicity);
  const [text, setText] = useState('');
  const [feeling, setFeeling] = useState('');
  const [meaning, setMeaning] = useState('');

  const live = numbersIn(text);
  const frequent = frequentNumbers(entries.map((e) => e.numbers)).slice(0, 5);

  const save = () => {
    addSynchronicity({ date: todayLocal(), text: text.trim(), numbers: live.map((n) => n.raw), feeling: feeling.trim(), meaning: meaning.trim() });
    setText('');
    setFeeling('');
    setMeaning('');
  };

  const askJung = (q: string) => {
    const id = startConversation({ mode: 'numbers' });
    router.push({ pathname: '/chat', params: { id, q } });
  };

  return (
    <Screen header={<ScreenHeader title="Synchronicity" />}>
      <Txt variant="bodyDim">
        Jung called it synchronicity: an inner state and an outer event that match in meaning, with no cause linking them. Repeating numbers,
        a symbol that keeps appearing, a call from the person you were just thinking of.
      </Txt>

      <Card>
        <TextField label="What happened?" value={text} onChangeText={setText} placeholder="e.g. Saw 11:11 right after deciding to call my sister" multiline />
        {live.length ? (
          <View style={styles.chips}>
            {live.map((n) => (
              <Chip key={n.raw} label={`${n.raw} → ${n.reduced.display} ${meaningFor(n.reduced.value).title}`} tone="gold" />
            ))}
          </View>
        ) : null}
        <TextField label="What were you feeling or thinking at the time?" value={feeling} onChangeText={setFeeling} multiline />
        <TextField label="What might it mean to you?" value={meaning} onChangeText={setMeaning} multiline />
        <Button label="Log it" disabled={!text.trim()} onPress={save} />
      </Card>

      {frequent.length ? (
        <Card>
          <Txt variant="label">Numbers that keep finding you</Txt>
          {frequent.map(([raw, n]) => {
            const m = numberMeaning(raw);
            return (
              <View key={raw} style={styles.row}>
                <Txt variant="heading" style={styles.num}>
                  {raw}
                </Txt>
                <View style={styles.flex}>
                  <Txt variant="body">{`${meaningFor(m.reduced.value).title} · ${n}×`}</Txt>
                  <Txt variant="small">{meaningFor(m.reduced.value).light}</Txt>
                </View>
              </View>
            );
          })}
        </Card>
      ) : null}

      {entries.map((e) => (
        <Card key={e.id}>
          <Txt variant="small">{formatDate(e.date)}</Txt>
          <Txt variant="body">{e.text}</Txt>
          {e.feeling ? <Txt variant="bodyDim">{`Feeling: ${e.feeling}`}</Txt> : null}
          {e.meaning ? <Txt variant="bodyDim">{`Meaning: ${e.meaning}`}</Txt> : null}
          <Txt
            variant="small"
            color={colors.accent}
            onPress={() => askJung(`A synchronicity: ${e.text}${e.feeling ? ` I was feeling: ${e.feeling}.` : ''}${e.meaning ? ` I wonder if it means: ${e.meaning}.` : ''}`)}>
            Ask Jung about this
          </Txt>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(1) },
  num: { width: 72 },
  flex: { flex: 1 },
});
