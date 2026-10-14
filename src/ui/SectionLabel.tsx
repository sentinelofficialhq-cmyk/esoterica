import { View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

/** Uppercase tracked label with an accent dot, like a chapter marker. */
export function SectionLabel({ children, color }: { children: string; color?: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: t.colors.accent }} />
      <Txt variant="label" color={color}>
        {children}
      </Txt>
    </View>
  );
}
