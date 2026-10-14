import { BlurView } from 'expo-blur';
import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';
import { Children, type ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { DOCKED_TAB_BAR_HEIGHT, MAX_WIDTH, space } from '@/ui/theme';

/**
 * The look's tab bar. Floating: a frosted pill holding every tab but the last, and the last (More) as
 * its own round button. Docked: an opaque full-width bar on the bottom edge, every tab in equal columns.
 * Receives TabList's props via asChild.
 */
export function TabBar({ children, style, ...props }: TabListProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const s = useStyles(makeStyles);
  const items = Children.toArray(children);
  if (t.shape.tabBar === 'docked') {
    return (
      <View {...props} style={[style, s.docked, { paddingBottom: insets.bottom }]}>
        <View style={s.dockedRow}>{items}</View>
      </View>
    );
  }
  return (
    <View {...props} pointerEvents="box-none" style={[style, s.bar, { paddingBottom: Math.max(insets.bottom, space(4)) }]}>
      <View pointerEvents="box-none" style={s.inner}>
        <View style={s.pillShadow}>
          <BlurView intensity={40} tint={t.scheme} style={s.pill}>
            {items.slice(0, -1)}
          </BlurView>
        </View>
        {items[items.length - 1]}
      </View>
    </View>
  );
}

/** `round` draws More as the floating bar's separate round button; the docked bar keeps it in line. */
type ButtonProps = TabTriggerSlotProps & { icon: ComponentType<{ size?: number; color?: string }>; label: string; round?: boolean };

export function TabButton({ isFocused, icon: Icon, label, round, ...props }: ButtonProps) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const active = !!isFocused;
  const docked = t.shape.tabBar === 'docked';
  const alone = round && !docked;
  const color = active ? t.colors.tabActive : t.colors.tabInactive;
  const button = (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[docked ? s.dockedButton : alone ? s.round : s.button, active && t.shape.tabActive === 'pill' && s.activePill]}>
      <Icon size={docked ? 24 : 22} color={color} />
      <Text style={[s.label, { color }, active && s.labelActive]}>{label}</Text>
      {t.shape.tabActive === 'dot' && !alone ? <View style={[s.dot, { opacity: active ? 1 : 0 }]} /> : null}
    </Pressable>
  );
  if (!alone) return button;
  return (
    <View style={s.roundShadow}>
      <BlurView intensity={40} tint={t.scheme} style={s.roundBlur}>
        {button}
      </BlurView>
    </View>
  );
}

const makeStyles = (t: Theme) => {
  const float = t.shadows.float ? { shadowColor: t.shadows.float.color, shadowOpacity: t.shadows.float.opacity, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } } : null;
  return StyleSheet.create({
    bar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space(4), flexDirection: 'column', alignItems: 'center' },
    inner: { flexDirection: 'row', alignItems: 'center', gap: space(2.5), width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
    pillShadow: { flex: 1, borderRadius: 33, ...float },
    pill: {
      height: 66,
      borderRadius: 33,
      overflow: 'hidden',
      flexDirection: 'row',
      padding: 6,
      gap: 2,
      backgroundColor: t.colors.tabBar,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
    button: { flex: 1, borderRadius: 27, alignItems: 'center', justifyContent: 'center', gap: 3, borderWidth: 1, borderColor: 'transparent' },
    activePill: { backgroundColor: t.colors.accentSoft, borderColor: t.colors.tabActiveBorder },
    roundShadow: { width: 66, height: 66, borderRadius: 33, ...float },
    roundBlur: { width: 66, height: 66, borderRadius: 33, overflow: 'hidden', backgroundColor: t.colors.tabBar, borderWidth: 1, borderColor: t.colors.border },
    round: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
    docked: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: t.colors.tabBar, borderTopWidth: 1, borderTopColor: t.colors.tabBarBorder },
    dockedRow: { flexDirection: 'row', height: DOCKED_TAB_BAR_HEIGHT, width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space(2) },
    dockedButton: { flex: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 3, borderWidth: 1, borderColor: 'transparent' },
    label: t.ui.tabLabel,
    labelActive: t.ui.tabLabelActive,
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: t.colors.accent },
  });
};
