import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import type { TypographyVariant } from '@/ui/themes';

type Props = TextProps & { variant?: TypographyVariant; color?: string; italic?: boolean; center?: boolean };

/** Text in the active look's type scale. */
export function Txt({ variant = 'body', color, italic, center, style, ...rest }: Props) {
  const t = useTheme();
  return (
    <Text
      {...rest}
      style={[
        t.typography[variant],
        italic && { fontFamily: t.fonts.displayItalic },
        color ? { color } : null,
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}

/** The accent half of a headline ("Meet the rest of you"): italic serif in Gilded, the accent color everywhere. */
export function Accent(props: TextProps) {
  const t = useTheme();
  return <Text {...props} style={[{ fontFamily: t.fonts.displayItalic, color: t.colors.accentBright }, props.style]} />;
}
