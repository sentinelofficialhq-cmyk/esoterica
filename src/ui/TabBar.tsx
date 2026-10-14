import { BlurView } from 'expo-blur';
import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';
import { Children, type ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { MAX_WIDTH, space } from '@/ui/theme';

/**
 * Floating bar: a frosted pill holding every tab but the last, and the last (More) as its own round button.
 * Receives TabList's props via asChild.
 */
export function TabBar({ children, style, ...props }: TabListProps) {
  const insets = useSafeAreaInsets();
  const s = useStyles(makeStyles);
  const items = Children.toArray(children);
  return (
    <View {...props} pointerEvents="box-none" style={[style, s.bar, { paddingBottom: Math.max(insets.bottom, space(4)) }]}>
      <View pointerEvents="box-none" style={s.inner}>
        <View style={s.pillShadow}>
          <BlurView intensity={40} tint="dark" style={s.pill}>
            {items.slice(0, -1)}
          </BlurView>
        </View>
        {items[items.length - 1]}
      </View>
    </View>
  );
}

type ButtonProps = TabTriggerSlotProps & { icon: ComponentType<{ size?: number; color?: string }>; label: string; round?: boolean };

export function TabButton({ isFocused, icon: Icon, label, round, ...props }: ButtonProps) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const active = !!isFocused;
  const color = active ? (t.id === 'nebula' ? '#FFFFFF' : t.colors.accentBright) : t.colors.textDim;
  const button = (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[round ? s.round : s.button, active && t.shape.tabActive === 'pill' && s.activePill]}>
      <Icon size={22} color={color} />
      <Text style={[s.label, { color }, active && s.labelActive]}>{t.id === 'gilded' ? label.toUpperCase() : label}</Text>
      {t.shape.tabActive === 'dot' && !round ? <View style={[s.dot, { opacity: active ? 1 : 0 }]} /> : null}
    </Pressable>
  );
  if (!round) return button;
  return (
    <View style={s.roundShadow}>
      <BlurView intensity={40} tint="dark" style={s.roundBlur}>
        {button}
      </BlurView>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    bar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space(4), flexDirection: 'column', alignItems: 'center' },
    inner: { flexDirection: 'row', alignItems: 'center', gap: space(2.5), width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
    pillShadow: {
      flex: 1,
      borderRadius: 33,
      shadowColor: '#000000',
      shadowOpacity: 0.45,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
    pill: {
      height: 66,
      borderRadius: 33,
      overflow: 'hidden',
      flexDirection: 'row',
      padding: 6,
      gap: 2,
      backgroundColor: t.colors.tabBar,
      borderWidth: 1,
      borderColor: t.id === 'gilded' ? t.colors.border : t.colors.border,
    },
    button: { flex: 1, borderRadius: 27, alignItems: 'center', justifyContent: 'center', gap: 3, borderWidth: 1, borderColor: 'transparent' },
    activePill: { backgroundColor: t.colors.accentSoft, borderColor: t.id === 'nebula' ? 'transparent' : t.colors.accentBorder },
    roundShadow: {
      width: 66,
      height: 66,
      borderRadius: 33,
      shadowColor: '#000000',
      shadowOpacity: 0.45,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
    roundBlur: { width: 66, height: 66, borderRadius: 33, overflow: 'hidden', backgroundColor: t.colors.tabBar, borderWidth: 1, borderColor: t.colors.border },
    round: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
    label: {
      fontFamily: t.id === 'gilded' ? t.fonts.bodyBold : t.fonts.bodySemi,
      fontSize: t.id === 'gilded' ? 9.5 : 11,
      letterSpacing: t.id === 'gilded' ? 0.8 : 0,
    },
    labelActive: { fontFamily: t.fonts.bodyBold },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: t.colors.accent },
  });
