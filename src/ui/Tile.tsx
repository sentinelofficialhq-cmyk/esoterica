import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Theme, ToolKey } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';

type Props = {
  label: string;
  tool: ToolKey;
  icon?: ComponentType<{ size?: number; color?: string }>;
  /** Letters drawn instead of an icon ("ABC" for Letterology). */
  glyph?: string;
  onPress?: () => void;
};

/** A Home grid tool: glass square (Ember), gold-ringed circle (Gilded) or gradient square (Nebula). */
export function Tile({ label, tool, icon: Icon, glyph, onPress }: Props) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const ink = t.shape.tile === 'gradient' ? '#FFFFFF' : t.shape.tile === 'ring' ? t.colors.accent : t.colors.accentBright;
  const art = Icon ? <Icon size={t.shape.tile === 'ring' ? 26 : 29} color={ink} /> : <Text style={[s.glyph, { color: ink }]}>{glyph}</Text>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.wrap, pressed && s.pressed]}>
      {t.shape.tile === 'gradient' ? (
        <LinearGradient colors={t.tileGradients[tool]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.square}>
          {art}
        </LinearGradient>
      ) : (
        <View style={t.shape.tile === 'ring' ? s.ring : s.square}>{art}</View>
      )}
      <Text style={s.label} numberOfLines={1}>
        {t.shape.tile === 'ring' ? label.toUpperCase() : label}
      </Text>
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
      backgroundColor: t.colors.cardHi,
      borderWidth: t.shape.tile === 'gradient' ? 0 : 1,
      borderColor: t.colors.border,
      shadowColor: t.shape.tile === 'gradient' ? '#000000' : 'transparent',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
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
    glyph: { fontFamily: t.fonts.displayBold, fontSize: t.shape.tile === 'ring' ? 21 : 18 },
    label: {
      fontFamily: t.shape.tile === 'ring' ? t.fonts.bodyBold : t.fonts.bodySemi,
      fontSize: t.shape.tile === 'ring' ? 9.5 : 11.5,
      letterSpacing: t.shape.tile === 'ring' ? 1 : 0,
      color: t.shape.tile === 'ring' ? t.colors.textDim : t.colors.text,
      textAlign: 'center',
    },
  });
