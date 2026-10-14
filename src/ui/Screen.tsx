import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Background } from '@/ui/Background';
import { useTheme } from '@/ui/ThemeProvider';
import { DOCKED_TAB_BAR_HEIGHT, MAX_WIDTH, space } from '@/ui/theme';

/**
 * Space tab screens reserve at the bottom for the tab bar, on top of the safe-area inset Screen adds:
 * 104 clears the floating pill; the docked bar sits on the inset, so its row plus a gap clears it.
 */
export function useTabBarSpace(): number {
  const t = useTheme();
  return t.shape.tabBar === 'floating' ? 104 : DOCKED_TAB_BAR_HEIGHT + space(4);
}

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Extra bottom space (tab screens pass useTabBarSpace()). */
  bottomInset?: number;
  header?: ReactNode;
  footer?: ReactNode;
  contentStyle?: ViewStyle;
};

export function Screen({ children, scroll = true, bottomInset = space(8), header, footer, contentStyle }: Props) {
  const insets = useSafeAreaInsets();
  const column = [styles.column, { paddingBottom: insets.bottom + bottomInset }, contentStyle];
  return (
    <View style={styles.root}>
      <Background />
      <View style={{ paddingTop: insets.top }}>{header ? <View style={styles.headerWrap}>{header}</View> : null}</View>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={column}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.flex, column]}>{children}</View>
      )}
      {footer ? <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space(3)) }]}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  headerWrap: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space(5) },
  scroll: { flexGrow: 1 },
  column: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space(5), paddingTop: space(3), gap: space(4) },
  footer: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingHorizontal: space(5), paddingTop: space(2) },
});
