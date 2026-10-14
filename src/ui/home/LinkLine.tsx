import { Pressable, StyleSheet, Text } from 'react-native';

import { ArrowRightIcon } from '@/ui/icons';
import type { Theme } from '@/ui/themes';
import { useStyles } from '@/ui/ThemeProvider';

type Props = { label: string; onPress: () => void; accessibilityLabel?: string };

/** A full-width text row with a trailing accent arrow: a suggestion or a "see all" link on Home. */
export function LinkLine({ label, onPress, accessibilityLabel }: Props) {
  const s = useStyles(makeStyles);
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={accessibilityLabel ?? label} onPress={onPress} style={({ pressed }) => [s.row, pressed && s.pressed]}>
      <Text style={s.label}>{label}</Text>
      <ArrowRightIcon />
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    label: { ...t.fonts.body, flexShrink: 1, fontSize: 15, lineHeight: 20, color: t.colors.text },
    pressed: { opacity: 0.7 },
  });
