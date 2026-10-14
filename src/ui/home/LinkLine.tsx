import { Pressable, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';

type Props = { label: string; onPress: () => void; accessibilityLabel?: string };

/** A full-width text row with a trailing accent arrow: a suggestion or a "see all" link on Home. */
export function LinkLine({ label, onPress, accessibilityLabel }: Props) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={accessibilityLabel ?? label} onPress={onPress} style={({ pressed }) => [s.row, pressed && s.pressed]}>
      <Text style={s.label}>{label}</Text>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={t.colors.accent} strokeWidth={t.shape.iconStrokeBold} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 12h14M13 6l6 6-6 6" />
      </Svg>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    label: { ...t.fonts.body, flexShrink: 1, fontSize: 15, lineHeight: 20, color: t.colors.text },
    pressed: { opacity: 0.7 },
  });
