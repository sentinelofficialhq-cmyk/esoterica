import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useJourney } from '@/jung/useJourney';
import { Card } from '@/ui/Card';
import { ChevronRightIcon } from '@/ui/icons';
import { Mandala } from '@/ui/Mandala';
import { useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

/** The individuation map as a small ring, linking to the full journey. */
export function JourneyCard() {
  const t = useTheme();
  const journey = useJourney();
  const stage = journey.stages.find((st) => st.id === journey.currentStage);
  return (
    <Card onPress={() => router.push('/journey')} style={styles.card} accessibilityLabel="Individuation journey">
      <Mandala stages={journey.stages} size={76} surface={t.colors.cardSolid} />
      <View style={styles.flex}>
        <Txt variant="label">Individuation journey</Txt>
        <Txt variant="heading">{stage ? `${stage.name} stage` : 'Every stage walked'}</Txt>
        <Txt variant="small">{`${journey.percent}% of milestones · see your map`}</Txt>
      </View>
      <ChevronRightIcon />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: space(4) },
  flex: { flex: 1 },
});
