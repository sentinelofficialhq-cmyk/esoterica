import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import type { TypographyVariant } from '@/ui/themes';

/** `italic` sets the look's emphasis face: a true italic in Gilded, a weight change or nothing elsewhere. */
type Props = TextProps & { variant?: TypographyVariant; color?: string; italic?: boolean; center?: boolean };

/** Text in the active look's type scale. */
export function Txt({ variant = 'body', color, italic, center, style, ...rest }: Props) {
  const t = useTheme();
  return (
    <Text
      {...rest}
      style={[
        t.typography[variant],
        italic && t.fonts.emphasis,
        color ? { color } : null,
        center && { textAlign: 'center' },
        style,
      ]}
    />
  );
}

/** The accent half of a headline ("Meet the rest of you"): the emphasis face in the emphasis color. */
export function Accent(props: TextProps) {
  const t = useTheme();
  return <Text {...props} style={[t.fonts.emphasis, { color: t.colors.emphasis }, props.style]} />;
}
