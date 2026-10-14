import { useId } from 'react';
import { Platform } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/ui/ThemeProvider';

type Props = { value: string | number; size?: number; align?: 'center' | 'left'; label?: string };

/**
 * A hero number drawn with the look's numeral gradient (ember to gold, champagne gold, or violet to
 * ember) and its glow. Width is estimated from the character count, so keep values short ("1", "19/1").
 */
export function Numeral({ value, size = 64, align = 'center', label }: Props) {
  const t = useTheme();
  const id = `num${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const text = String(value);
  const width = Math.ceil(size * 0.66 * text.length + size * 0.24);
  const height = Math.ceil(size * 1.16);
  const [top, mid, bottom] = t.gradients.numeral;
  const glow = t.shadows.numeral && Platform.OS === 'web' ? { filter: `drop-shadow(0 0 ${Math.round(size / 5)}px ${t.shadows.numeral})` } : null;
  // Full-height figures (Cormorant defaults to old-style); a CSS property on web, inherited by the SVG text.
  const lining = Platform.OS === 'web' ? ({ fontVariantNumeric: 'lining-nums' } as object) : null;
  return (
    <Svg width={width} height={height} accessibilityLabel={label ?? text} style={[{ overflow: 'visible' }, glow, lining]}>
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
        fontFamily={t.fonts.displayBold}
        fontSize={size}
        fill={`url(#${id})`}>
        {text}
      </SvgText>
    </Svg>
  );
}
