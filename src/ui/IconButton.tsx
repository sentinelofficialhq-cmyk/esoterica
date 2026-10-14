import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';

/** Round glass button around an icon. `label` is read by screen readers. */
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
        borderColor: t.id === 'gilded' ? t.colors.accentBorder : t.colors.border,
        backgroundColor: t.id === 'gilded' ? 'transparent' : t.colors.cardHi,
        opacity: pressed ? 0.75 : 1,
      })}>
      {children}
    </Pressable>
  );
}
