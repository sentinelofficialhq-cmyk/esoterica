import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { useJourney } from '@/jung/useJourney';
import { Card } from '@/ui/Card';
import { CheckIcon, ChevronRightIcon } from '@/ui/icons';
import { Mandala } from '@/ui/Mandala';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

export default function Journey() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const journey = useJourney();
  return (
    <Screen header={<ScreenHeader title="Individuation" />}>
      <Txt variant="bodyDim">
        Jung called the lifelong work of becoming whole individuation. It tends to move through four meetings: with the Persona, the
        Shadow, the Anima or Animus, and the Self. This map fills in as you journal, dream and reflect. It is not a race, and every stage
        stays open.
      </Txt>
      <View style={styles.center}>
        <Mandala stages={journey.stages} />
      </View>
      {journey.stages.map((s) => {
        const here = journey.currentStage === s.id;
        return (
          <Card key={s.id} tone={here ? 'gold' : 'default'}>
            <View style={styles.head}>
              <Txt variant="heading" style={styles.flex}>
                {s.name}
              </Txt>
              <Txt variant="label" color={here ? colors.gold : colors.textDim}>
                {here ? 'You are here' : `${s.done}/${s.total}`}
              </Txt>
            </View>
            <Txt variant="small">{s.summary}</Txt>
            {s.items.map((item) =>
              item.done ? (
                <View key={item.label} style={styles.item}>
                  <View style={styles.check}>
                    <CheckIcon />
                  </View>
                  <Txt variant="body" color={colors.textDim} style={styles.flex}>
                    {item.label}
                  </Txt>
                </View>
              ) : (
                <Pressable
                  key={item.label}
                  accessibilityRole="link"
                  onPress={() => router.push(item.href as Href)}
                  style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
                  <View style={styles.check}>
                    <View style={styles.dot} />
                  </View>
                  <Txt variant="body" style={styles.flex}>
                    {item.label}
                  </Txt>
                  <ChevronRightIcon />
                </Pressable>
              ),
            )}
          </Card>
        );
      })}
      {journey.currentStage === 'complete' ? (
        <Txt variant="bodyDim" center italic>
          Every milestone is done. Jung would say the work is never finished, only deepened: keep dreaming, keep writing.
        </Txt>
      ) : null}
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    center: { alignItems: 'center', paddingVertical: space(2) },
    head: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
    flex: { flex: 1 },
    item: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(1.5) },
    pressed: { opacity: 0.7 },
    check: { width: 20, alignItems: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: t.colors.textFaint },
  });
