import { useId } from 'react';
import { Platform, Text } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/ui/ThemeProvider';
import { solidFill } from '@/ui/theme';
import { svgFont } from '@/ui/themes';

type Props = { value: string | number; size?: number; align?: 'center' | 'left'; label?: string };

/**
 * A hero number in the look's numeral face, drawn with its numeral gradient (ember to gold, champagne
 * gold, or violet to ember) and glow, or as plain text when the look's numerals are one color. The
 * gradient's width is estimated from the character count, so keep values short ("1", "19/1").
 */
export function Numeral({ value, size = 64, align = 'center', label }: Props) {
  const t = useTheme();
  const id = `num${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const text = String(value);
  const height = Math.ceil(size * 1.16);
  const glow = t.shadows.numeral && Platform.OS === 'web' ? { filter: `drop-shadow(0 0 ${Math.round(size / 5)}px ${t.shadows.numeral})` } : null;
  const solid = solidFill(t.gradients.numeral);

  if (solid) {
    return (
      <Text
        accessibilityLabel={label ?? text}
        style={[t.fonts.numeral, { fontSize: size, lineHeight: height, color: solid, textAlign: align === 'center' ? 'center' : 'left' }, glow]}>
        {text}
      </Text>
    );
  }

  const width = Math.ceil(size * 0.66 * text.length + size * 0.24);
  const [top, mid, bottom] = t.gradients.numeral;
  return (
    <Svg width={width} height={height} accessibilityLabel={label ?? text} style={[{ overflow: 'visible' }, glow]}>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.1" stopColor={top} />
          <Stop offset="0.55" stopColor={mid} />
          <Stop offset="0.95" stopColor={bottom} />
        </LinearGradient>
      </Defs>
      <SvgText
        x={align === 'center' ? width / 2 : 2}
        y={size * 0.94}
        textAnchor={align === 'center' ? 'middle' : 'start'}
        {...svgFont(t.fonts.numeral)}
        fontSize={size}
        fill={`url(#${id})`}>
        {text}
      </SvgText>
    </Svg>
  );
}
