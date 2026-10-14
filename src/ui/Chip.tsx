import { Pressable, StyleSheet, Text } from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { radii, space } from '@/ui/theme';

type Tone = 'default' | 'accent' | 'ember' | 'teal' | 'gold' | 'violet' | 'danger';
type Props = { label: string; selected?: boolean; onPress?: () => void; tone?: Tone };

export function Chip({ label, selected, onPress, tone = 'default' }: Props) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const c = t.colors;
  const tint: Record<Tone, [string, string]> = {
    default: [c.textDim, c.cardHi],
    accent: [c.accentBright, c.accentSoft],
    ember: [c.accentBright, c.accentSoft],
    teal: [c.teal, c.tealSoft],
    gold: [c.gold, c.goldSoft],
    violet: [c.violet, c.violetSoft],
    danger: [c.danger, c.dangerSoft],
  };
  const [fg, bg] = selected ? [c.accentBright, c.accentSoft] : tint[tone];
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [s.chip, { backgroundColor: bg, borderColor: selected ? c.accentBorder : 'transparent' }, pressed && s.pressed]}>
      <Text style={[s.text, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    chip: { borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: space(3), paddingVertical: space(1.5) },
    text: { fontFamily: t.fonts.bodyBold, fontSize: 12.5 },
    pressed: { opacity: 0.75 },
  });
