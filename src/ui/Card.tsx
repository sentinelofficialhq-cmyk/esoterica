import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { solidFill, space } from '@/ui/theme';

/**
 * - default: the look's glass (or engraved) card
 * - accent: tinted with the accent ("ember" is the old name for it)
 * - featured: accent border, plus the look's glow and gradient hairline where it has them (selected or hero cards)
 * - violet / gold: tinted for psyche and timing content
 */
export type CardTone = 'default' | 'accent' | 'ember' | 'featured' | 'violet' | 'gold';

type Props = { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; tone?: CardTone; accessibilityLabel?: string };

export function Card({ children, style, onPress, tone = 'default', accessibilityLabel }: Props) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const toneStyle = tone === 'ember' ? s.accent : s[tone];
  const gradientBorder = tone === 'featured' && t.gradients.border;

  const body = (pressed: boolean) => [s.card, toneStyle, gradientBorder ? s.innerOfGradient : null, pressed && s.pressed, style];

  if (gradientBorder) {
    const inner = onPress ? (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => body(pressed)}>
        {children}
      </Pressable>
    ) : (
      <View style={body(false)}>{children}</View>
    );
    const frame = [s.gradientFrame, { borderRadius: t.shape.cardRadius + 1.5 }];
    const solid = solidFill(gradientBorder);
    return solid ? (
      <View style={[frame, { backgroundColor: solid }]}>{inner}</View>
    ) : (
      <LinearGradient colors={gradientBorder} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={frame}>
        {inner}
      </LinearGradient>
    );
  }
  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => body(pressed)}>
        {children}
      </Pressable>
    );
  }
  return <View style={body(false)}>{children}</View>;
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      borderRadius: t.shape.cardRadius,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
      padding: space(4),
      gap: space(2),
    },
    default: {},
    accent: { backgroundColor: t.colors.accentSoft, borderColor: t.colors.accentBorder },
    featured: {
      borderColor: t.colors.accentBorder,
      borderWidth: 1.5,
      ...(t.shadows.featured
        ? { shadowColor: t.shadows.featured.color, shadowOpacity: t.shadows.featured.opacity, shadowRadius: t.shadows.featured.radius, shadowOffset: { width: 0, height: 0 } }
        : null),
    },
    violet: { backgroundColor: t.colors.violetSoft, borderColor: t.colors.violetSoft },
    gold: { backgroundColor: t.colors.goldSoft, borderColor: t.colors.goldSoft },
    gradientFrame: { padding: 1.5 },
    innerOfGradient: { borderWidth: 0, backgroundColor: t.colors.cardSolid },
    pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  });

