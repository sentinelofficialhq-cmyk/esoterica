import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { radii, space } from '@/ui/theme';

type Props = {
  label: string;
  onPress?: () => void;
  /** primary: the look's call-to-action gradient. subtle: glass. ghost: outlined. */
  variant?: 'primary' | 'ghost' | 'subtle';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled, loading, icon, style, small }: Props) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const textColor = variant === 'primary' ? t.colors.onAccent : variant === 'ghost' ? t.colors.accentBright : t.colors.text;
  const content = loading ? (
    <ActivityIndicator color={textColor} />
  ) : (
    <View style={s.row}>
      {icon}
      <Text style={[s.label, small && s.smallLabel, { color: textColor }]}>{t.id === 'gilded' && variant === 'primary' ? label.toUpperCase() : label}</Text>
    </View>
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        s.base,
        small && s.small,
        variant === 'primary' && s.primary,
        variant === 'ghost' && s.ghost,
        variant === 'subtle' && s.subtle,
        (disabled || loading) && s.disabled,
        pressed && s.pressed,
        style,
      ]}>
      {variant === 'primary' ? (
        <LinearGradient colors={t.gradients.cta} style={[s.fill, small && s.smallFill]}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    base: { minHeight: 54, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space(6) },
    small: { minHeight: 40, paddingHorizontal: space(4) },
    primary: {
      paddingHorizontal: 0,
      overflow: 'hidden',
      shadowColor: t.shadows.cta,
      shadowOpacity: 1,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
    },
    fill: { alignSelf: 'stretch', minHeight: 54, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space(6) },
    smallFill: { minHeight: 40, paddingHorizontal: space(4) },
    ghost: { borderWidth: 1, borderColor: t.colors.accentBorder, backgroundColor: 'transparent' },
    subtle: { borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.cardHi },
    row: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
    label: {
      fontFamily: t.id === 'gilded' ? t.fonts.bodyHeavy : t.fonts.displayBold,
      fontSize: t.id === 'gilded' ? 13 : 16,
      letterSpacing: t.id === 'gilded' ? 2.4 : 0,
    },
    smallLabel: { fontSize: t.id === 'gilded' ? 11.5 : 14 },
    disabled: { opacity: 0.45 },
    pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  });
