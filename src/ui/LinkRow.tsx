import { router, type Href } from 'expo-router';
import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/ui/Card';
import { ChevronRightIcon } from '@/ui/icons';
import { useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

type Props = { label: string; caption?: string; href: Href; icon?: ComponentType<{ size?: number; color?: string }> };

/** A tappable row that opens another screen. */
export function LinkRow({ label, caption, href, icon: Icon }: Props) {
  const t = useTheme();
  return (
    <Card onPress={() => router.push(href)} style={styles.row} accessibilityLabel={label}>
      {Icon ? (
        <View style={[styles.icon, { backgroundColor: t.colors.accentSoft }]}>
          <Icon size={20} color={t.colors.accentBright} />
        </View>
      ) : null}
      <View style={styles.flex}>
        <Txt variant="body">{label}</Txt>
        {caption ? <Txt variant="small">{caption}</Txt> : null}
      </View>
      <ChevronRightIcon />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(3) },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
});
