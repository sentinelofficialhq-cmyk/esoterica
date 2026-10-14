import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Theme, ToolKey } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { solidFill } from '@/ui/theme';

type Props = {
  label: string;
  tool: ToolKey;
  icon?: ComponentType<{ size?: number; color?: string }>;
  /** Letters drawn instead of an icon (the look's `shape.letterGlyph` for Letterology). */
  glyph?: string;
  onPress?: () => void;
};

/**
 * A Home grid tool: a glass square (Ember), gold-ringed circle (Gilded) or gradient square (Nebula)
 * with the label below, or a card cell with the label inside (the new looks).
 */
export function Tile({ label, tool, icon: Icon, glyph, onPress }: Props) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const kind = t.shape.tile;
  const art = Icon ? <Icon size={t.shape.tileIconSize} color={t.colors.tileInk} /> : <Text style={s.glyph}>{glyph}</Text>;
  const text = (
    <Text style={s.label} numberOfLines={1}>
      {label}
    </Text>
  );

  if (kind === 'card') {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.card, pressed && s.pressed]}>
        {art}
        {text}
      </Pressable>
    );
  }

  const stops = t.tileGradients[tool];
  const solid = solidFill(stops);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.wrap, pressed && s.pressed]}>
      {kind === 'gradient' && !solid ? (
        <LinearGradient colors={stops} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.square}>
          {art}
        </LinearGradient>
      ) : (
        <View style={kind === 'ring' ? s.ring : [s.square, kind === 'gradient' && solid ? { backgroundColor: solid } : null]}>{art}</View>
      )}
      {text}
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: { flex: 1, alignItems: 'center', gap: 7 },
    pressed: { opacity: 0.78, transform: [{ scale: 0.97 }] },
    square: {
      width: 66,
      height: 66,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.tileBg,
      borderWidth: t.shape.tile === 'gradient' ? 0 : 1,
      borderColor: t.colors.tileBorder,
      ...(t.shadows.tile ? { shadowColor: t.shadows.tile.color, shadowOpacity: t.shadows.tile.opacity, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } } : null),
    },
    ring: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.colors.accentBorder,
      backgroundColor: t.colors.cardSolid,
    },
    card: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderRadius: t.shape.tileRadius,
      borderWidth: 1,
      borderColor: t.colors.tileBorder,
      backgroundColor: t.colors.tileBg,
    },
    glyph: { ...t.ui.tileGlyph, color: t.colors.tileInk },
    label: { ...t.ui.tileLabel, textAlign: 'center' },
  });
