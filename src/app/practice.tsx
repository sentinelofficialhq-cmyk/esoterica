import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { NEVILLE_PRACTICES, practiceById } from '@/content/neville';
import { todayLocal } from '@/lib/date';
import { useImaginationStore, type Session } from '@/store/imaginationStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { TextField } from '@/ui/TextField';
import { useTheme } from '@/ui/ThemeProvider';
import { Timer } from '@/ui/Timer';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

const FEELINGS: { value: Session['feeling']; label: string }[] = [
  { value: 1, label: 'Heavy' },
  { value: 2, label: 'Unsure' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Light' },
  { value: 5, label: 'Certain' },
];

export default function PracticeScreen() {
  const t = useTheme();
  const params = useLocalSearchParams<{ kind?: string; aim?: string }>();
  const practice = practiceById(params.kind ?? '') ?? NEVILLE_PRACTICES[0];
  const aims = useImaginationStore((s) => s.aims);
  const open = aims.filter((a) => a.status === 'open');
  const [aimId, setAimId] = useState<string | undefined>(params.aim);
  const [text, setText] = useState('');
  const [feeling, setFeeling] = useState<Session['feeling']>(3);
  const aim = aims.find((a) => a.id === aimId);

  const save = () => {
    useImaginationStore.getState().addSession({ date: todayLocal(), kind: practice.id, aimId, text: text.trim(), feeling });
    if (router.canGoBack()) router.back();
    else router.replace('/imagine');
  };

  return (
    <Screen header={<ScreenHeader title={practice.title} />}>
      <Txt variant="small" color={t.colors.text}>
        {practice.when}
      </Txt>

      {practice.id === 'scene' || practice.id === 'end' ? (
        <View style={styles.group}>
          <Txt variant="label">For which aim?</Txt>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip label="No particular aim" selected={!aimId} onPress={() => setAimId(undefined)} />
            {open.map((a) => (
              <Chip key={a.id} label={a.title} selected={aimId === a.id} onPress={() => setAimId(a.id)} />
            ))}
            <Chip label="+ New aim" onPress={() => router.push('/aim')} />
          </ScrollView>
          {aim ? (
            <Card tone="accent">
              <Txt variant="label" color={t.colors.accentBright}>
                Your scene
              </Txt>
              <Txt variant="body">{aim.scene}</Txt>
            </Card>
          ) : null}
        </View>
      ) : null}

      <Card>
        {practice.steps.map((step, i) => (
          <View key={step} style={styles.step}>
            <Text style={[styles.stepNum, { ...t.fonts.bodyBold, color: t.colors.onAccent, backgroundColor: t.colors.accent }]}>{i + 1}</Text>
            <Txt variant="body" style={styles.flex}>
              {step}
            </Txt>
          </View>
        ))}
      </Card>

      {practice.minutes ? (
        <Card>
          <Timer minutes={practice.minutes} />
        </Card>
      ) : null}

      <TextField label={practice.journal} value={text} onChangeText={setText} multiline placeholder="A few honest lines…" />

      <View style={styles.group}>
        <Txt variant="label">How did it feel?</Txt>
        <View style={styles.chipsWrap}>
          {FEELINGS.map((f) => (
            <Chip key={f.value} label={f.label} selected={feeling === f.value} onPress={() => setFeeling(f.value)} />
          ))}
        </View>
      </View>

      <Button label="Save practice" onPress={save} />
      <Txt variant="small">{practice.caution}</Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: space(2) },
  chips: { gap: space(2) },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  step: { flexDirection: 'row', gap: space(3), alignItems: 'flex-start', paddingVertical: space(1) },
  stepNum: { width: 24, height: 24, borderRadius: 12, textAlign: 'center', lineHeight: 24, fontSize: 12, overflow: 'hidden' },
  flex: { flex: 1 },
});
