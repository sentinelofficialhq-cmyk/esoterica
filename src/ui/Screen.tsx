import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Background } from '@/ui/Background';
import { MAX_WIDTH, space } from '@/ui/theme';

/** Space reserved at the bottom of tab screens for the floating tab bar. */
export const TAB_BAR_SPACE = 104;

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Extra bottom space (tab screens pass TAB_BAR_SPACE). */
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
