import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { ReadingDoc } from '@/readings/types';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { SectionLabel } from '@/ui/SectionLabel';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

/** Renders a reading's sections as cards. Section bodies use "\n" for line breaks. */
export function ReadingView({ doc }: { doc: ReadingDoc }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        {doc.subtitle ? <SectionLabel>{doc.subtitle}</SectionLabel> : null}
        <Txt variant="title">{doc.title}</Txt>
      </View>
      {doc.sections.map((s, i) => (
        <Animated.View key={`${s.heading}-${i}`} entering={FadeInDown.delay(Math.min(i, 6) * 60).duration(400)}>
          <Card>
            <Txt variant="heading">{s.heading}</Txt>
            {s.body.split('\n').map((line, j) => (
              <Txt key={j} variant="bodyDim">
                {line}
              </Txt>
            ))}
            {s.chips?.length ? (
              <View style={styles.chips}>
                {s.chips.map((c) => (
                  <Chip key={c} label={c} />
                ))}
              </View>
            ) : null}
          </Card>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space(4) },
  head: { gap: space(2) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2), marginTop: space(1) },
});
