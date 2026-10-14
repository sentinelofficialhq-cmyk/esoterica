import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { startConversation } from '@/ai/start';
import { bestDates, INTENTS, type Intent } from '@/engines/bestDate';
import { formatDate, todayLocal, weekday } from '@/lib/date';
import { useProfile } from '@/store/profileStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

const RANGES = [7, 30, 60, 90];

export default function BestDate() {
  const { colors } = useTheme();
  const profile = useProfile();
  const [intent, setIntent] = useState<Intent>('start');
  const [days, setDays] = useState(30);
  if (!profile) return <Redirect href="/onboarding" />;

  const start = todayLocal();
  const ranked = bestDates(profile, intent, start, days);

  return (
    <Screen header={<ScreenHeader title="Best-date finder" />}>
      <SectionLabel>Know when to move</SectionLabel>
      <Txt variant="label">What are you planning?</Txt>
      <View style={styles.chips}>
        {(Object.keys(INTENTS) as Intent[]).map((k) => (
          <Chip key={k} label={INTENTS[k]} selected={intent === k} onPress={() => setIntent(k)} />
        ))}
      </View>
      <Txt variant="label">Within the next</Txt>
      <View style={styles.chips}>
        {RANGES.map((r) => (
          <Chip key={r} label={`${r} days`} selected={days === r} onPress={() => setDays(r)} />
        ))}
      </View>

      {ranked.map((d, i) => (
        <Card key={d.date} tone={i === 0 ? 'gold' : 'default'}>
          <View style={styles.rowHead}>
            <Txt variant="heading" style={styles.flex}>{`${weekday(d.date)} ${formatDate(d.date)}`}</Txt>
            <Txt variant="label" color={i === 0 ? colors.gold : colors.textDim}>
              {i === 0 ? 'Best' : `#${i + 1}`}
            </Txt>
          </View>
          <Txt variant="small">{`Energy ${d.score} · ${d.label} · personal day ${d.personalDayDisplay} · ${d.moon} · ${d.dayAnimal} day`}</Txt>
          {d.reasons.length ? (
            <View style={styles.chips}>
              {d.reasons.map((r) => (
                <Chip key={r} label={r} tone={r.startsWith('Clash') ? 'danger' : 'teal'} />
              ))}
            </View>
          ) : null}
        </Card>
      ))}

      <Button
        label="Ask Jung about these days"
        variant="subtle"
        onPress={() => {
          const conv = startConversation({ mode: 'timing' });
          const q = `I'm planning to ${INTENTS[intent].toLowerCase()} in the next ${days} days. Esoterica ranks these days best: ${ranked
            .map((d) => `${weekday(d.date)} ${formatDate(d.date)} (${d.total}${d.reasons.length ? `: ${d.reasons.join(', ')}` : ''})`)
            .join('; ')}. Help me think it through.`;
          router.push({ pathname: '/chat', params: { id: conv, q } });
        }}
      />
      <Button
        label="Open as a reading"
        variant="ghost"
        onPress={() => router.push({ pathname: '/reading', params: { type: 'bestDate', intent, days: String(days), start } })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  flex: { flex: 1 },
});
