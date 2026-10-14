import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { LEARN_ARTICLES, type LearnGroup } from '@/content/learn';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

const GROUPS: LearnGroup[] = ['Numbers', 'Signs', 'Timing', 'Method', 'Jung', 'Mind & Scripture'];
const LABEL_TONE = { Tradition: 'gold', Method: 'accent', 'Research says': 'teal', Jung: 'violet' } as const;

export default function Learn() {
  const params = useLocalSearchParams<{ group?: string }>();
  const initial = GROUPS.find((g) => g === params.group) ?? null;
  const [only, setOnly] = useState<LearnGroup | null>(initial);
  const shown = only ? [only] : GROUPS;
  return (
    <Screen header={<ScreenHeader title={only ?? 'Learn'} />}>
      <Txt variant="bodyDim">
        What each system says, how Esoterica reads it, and what the evidence does and doesn’t support. Every page is labeled.
      </Txt>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <Chip label="All" selected={!only} onPress={() => setOnly(null)} />
        {GROUPS.map((g) => (
          <Chip key={g} label={g} selected={only === g} onPress={() => setOnly(g)} />
        ))}
      </ScrollView>
      {shown.map((g) => (
        <View key={g} style={styles.group}>
          <SectionLabel>{g}</SectionLabel>
          {LEARN_ARTICLES.filter((a) => a.group === g).map((a) => (
            <Card key={a.slug} onPress={() => router.push({ pathname: '/article', params: { slug: a.slug } })}>
              <View style={styles.titleRow}>
                <Txt variant="heading" style={styles.flex}>
                  {a.title}
                </Txt>
                <Chip label={a.label} tone={LABEL_TONE[a.label]} />
              </View>
              <Txt variant="small">{a.summary}</Txt>
            </Card>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: space(2) },
  group: { gap: space(3) },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  flex: { flex: 1 },
});
