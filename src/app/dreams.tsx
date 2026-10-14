import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { topSymbols } from '@/jung/dreams';
import { MOODS } from '@/jung/dreamInterpretation';
import { formatDate } from '@/lib/date';
import { useJournalStore } from '@/store/journalStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { EmptyState } from '@/ui/EmptyState';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

export default function Dreams() {
  const { colors } = useTheme();
  const dreams = useJournalStore((s) => s.dreams);
  const [filter, setFilter] = useState<string | null>(null);
  const motifs = topSymbols(dreams).slice(0, 10);
  const shown = filter
    ? dreams.filter((d) => [...d.symbols, ...d.tags].some((s) => s.trim().toLowerCase() === filter))
    : dreams;

  return (
    <Screen header={<ScreenHeader title="Dream journal" />}>
      <Button label="Log a dream" onPress={() => router.push('/dream')} />
      {dreams.length === 0 ? (
        <EmptyState
          title="No dreams yet"
          body="Write a dream down as soon as you wake, even a fragment. Over time Esoterica tracks the symbols that keep returning, and Jung can read them as a series."
        />
      ) : null}

      {motifs.length ? (
        <Card>
          <Txt variant="label">Recurring symbols</Txt>
          <View style={styles.chips}>
            {motifs.map(([sym, n]) => (
              <Chip key={sym} label={`${sym} · ${n}`} selected={filter === sym} onPress={() => setFilter(filter === sym ? null : sym)} />
            ))}
          </View>
          {filter ? <Txt variant="small">{`Showing dreams with “${filter}”. Tap again to clear.`}</Txt> : null}
        </Card>
      ) : null}

      {shown.map((d) => (
        <Card key={d.id} onPress={() => router.push({ pathname: '/dream', params: { id: d.id } })}>
          <View style={styles.head}>
            <Txt variant="heading" style={styles.flex} numberOfLines={1}>
              {d.title || 'Untitled dream'}
            </Txt>
            <Txt variant="small">{formatDate(d.date)}</Txt>
          </View>
          <Txt variant="bodyDim" numberOfLines={2}>
            {d.text}
          </Txt>
          <View style={styles.chips}>
            <Chip label={MOODS[d.mood]} />
            {d.recurring ? <Chip label="recurring" tone="gold" /> : null}
            {d.lucid ? <Chip label="lucid" tone="violet" /> : null}
            {d.interpretation ? <Chip label="read by Jung" tone="ember" /> : null}
          </View>
        </Card>
      ))}
      {dreams.length ? <Txt variant="small" color={colors.textFaint} center>{`${dreams.length} dream${dreams.length === 1 ? '' : 's'} recorded`}</Txt> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  flex: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
});
