import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { solidFill, space } from '@/ui/theme';

type Props = {
  label: string;
  onPress?: () => void;
  /** primary: the look's call-to-action fill. subtle: glass. ghost: outlined (or plain text where the border is clear). */
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
  const primary = variant === 'primary';
  const textColor = primary ? t.colors.onAccent : variant === 'ghost' ? t.colors.ghostInk : t.colors.text;
  const solid = solidFill(t.gradients.cta);
  const content = loading ? (
    <ActivityIndicator color={textColor} />
  ) : (
    <View style={s.row}>
      {icon}
      <Text style={[s.label, small && s.smallLabel, primary && t.shape.ctaUppercase && s.upper, { color: textColor }]}>{label}</Text>
    </View>
  );
  const fillStyle = [s.fill, small && s.smallFill];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        s.base,
        small && s.small,
        primary && s.primary,
        variant === 'ghost' && s.ghost,
        variant === 'subtle' && s.subtle,
        (disabled || loading) && s.disabled,
        pressed && s.pressed,
        style,
      ]}>
      {!primary ? (
        content
      ) : solid ? (
        <View style={[fillStyle, { backgroundColor: solid }]}>{content}</View>
      ) : (
        <LinearGradient colors={t.gradients.cta} style={fillStyle}>
          {content}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    base: { minHeight: t.shape.buttonHeight, borderRadius: t.shape.buttonRadius, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space(6) },
    small: { minHeight: 40, paddingHorizontal: space(4) },
    primary: {
      paddingHorizontal: 0,
      overflow: 'hidden',
      ...(t.shadows.cta ? { shadowColor: t.shadows.cta, shadowOpacity: 1, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } } : null),
    },
    fill: {
      alignSelf: 'stretch',
      minHeight: t.shape.buttonHeight,
      borderRadius: t.shape.buttonRadius,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: space(6),
    },
    smallFill: { minHeight: 40, paddingHorizontal: space(4) },
    ghost: { borderWidth: 1, borderColor: t.colors.ghostBorder, backgroundColor: 'transparent' },
    subtle: { borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.cardHi },
    row: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
    label: t.ui.button,
    smallLabel: t.ui.buttonSmall,
    upper: { textTransform: 'uppercase' },
    disabled: { opacity: 0.45 },
    pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  });
