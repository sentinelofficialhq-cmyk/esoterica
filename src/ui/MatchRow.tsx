import { StyleSheet, Text, View } from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles } from '@/ui/ThemeProvider';
import type { CompatLabel } from '@/engines/compatibility';
import { Card } from '@/ui/Card';
import { Txt } from '@/ui/Txt';
import { radii, space } from '@/ui/theme';

type Props = { name: string; caption?: string; overall?: number; label?: CompatLabel; onPress?: () => void };

/** A row for a person, place or brand, with the compatibility score as a small meter. */
export function MatchRow({ name, caption, overall, label, onPress }: Props) {
  const styles = useStyles(makeStyles);
  return (
    <Card onPress={onPress} style={styles.row}>
      <View style={styles.text}>
        <Txt variant="body" numberOfLines={1}>
          {name}
        </Txt>
        {caption ? (
          <Txt variant="small" numberOfLines={1}>
            {caption}
          </Txt>
        ) : null}
      </View>
      {overall !== undefined ? (
        <View style={styles.score} accessibilityLabel={`${overall} percent, ${label}`}>
          <Text style={styles.value}>{overall}%</Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${overall}%` }]} />
          </View>
          {label ? <Text style={styles.label}>{label}</Text> : null}
        </View>
      ) : null}
    </Card>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(3) },
    text: { flex: 1, gap: 2 },
    score: { width: 76, alignItems: 'flex-end', gap: 3 },
    value: { fontFamily: t.fonts.bodySemi, fontSize: 15, color: t.colors.text },
    track: { width: 76, height: 4, borderRadius: radii.pill, backgroundColor: t.colors.accentSoft, overflow: 'hidden' },
    fill: { height: 4, borderRadius: radii.pill, backgroundColor: t.colors.accent },
    label: { fontFamily: t.fonts.bodyHeavy, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: t.colors.textDim },
  });
