import { View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

/** A section's label in the look's label style, with an accent dot like a chapter marker where the look uses one. */
export function SectionLabel({ children, color }: { children: string; color?: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
      {t.shape.labelDot ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: t.colors.accent }} /> : null}
      <Txt variant="label" color={color}>
        {children}
      </Txt>
    </View>
  );
}
