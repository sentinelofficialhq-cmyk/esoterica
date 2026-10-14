import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';

/** Round button around an icon, filled or outlined per look. `label` is read by screen readers. */
export function IconButton({ label, onPress, children, size = 44 }: { label: string; onPress?: () => void; children: ReactNode; size?: number }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: t.colors.controlBorder,
        backgroundColor: t.colors.controlBg,
        opacity: pressed ? 0.75 : 1,
      })}>
      {children}
    </Pressable>
  );
}
