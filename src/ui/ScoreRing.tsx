import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';

type Props = { score: number; label: string; caption?: string; size?: number };

/**
 * A meter for a single 0–100 score: accent fill on the meter track,
 * the number in the figure face, label in text tokens (never the data color).
 */
export function ScoreRing({ score, label, caption, size = 180 }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${caption ?? 'Score'} ${clamped} out of 100, ${label}`}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.meterTrack} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        <Text style={[styles.value, { fontSize: size * 0.3 }]}>{clamped}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const makeStyles = (t: Theme) => {
  const upper = t.shape.labelCase === 'upper';
  return StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    caption: { ...t.fonts.bodyHeavy, fontSize: 10, letterSpacing: upper ? 1.4 : 0, textTransform: upper ? 'uppercase' : 'none', color: t.colors.textDim },
    value: { ...t.fonts.figure, color: t.colors.text },
    label: { ...t.fonts.bodyMedium, fontSize: 14, color: t.colors.textDim },
  });
};
