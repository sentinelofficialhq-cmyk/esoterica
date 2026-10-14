import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BackIcon } from '@/ui/icons';
import { IconButton } from '@/ui/IconButton';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

/** Header for pushed screens: back button, title, optional right-side action. */
export function ScreenHeader({ title, right, onBack }: { title?: string; right?: ReactNode; onBack?: () => void }) {
  const back = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  return (
    <View style={styles.row}>
      <IconButton label="Back" onPress={back} size={40}>
        <BackIcon size={20} />
      </IconButton>
      <Txt variant="heading" numberOfLines={1} style={styles.title}>
        {title ?? ''}
      </Txt>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: space(3) },
  title: { flex: 1 },
  right: { minWidth: 40, alignItems: 'flex-end' },
});
