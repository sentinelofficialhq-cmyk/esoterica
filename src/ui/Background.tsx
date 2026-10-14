import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { STARS, TWINKLES, Twinkle } from '@/ui/Starfield';
import { useTheme } from '@/ui/ThemeProvider';

/** The page behind every screen: the look's ground, its colored glows, then seeded stars and a few twinkles where it has stars. */
export function Background() {
  const t = useTheme();
  const stars = t.shape.stars;
  const glows = t.gradients.glows;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: t.colors.bg }]}>
      {glows.length > 0 ? (
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            {glows.map((g, i) => (
              <RadialGradient key={i} id={`glow-${t.id}-${i}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={g.color} stopOpacity={g.opacity} />
                <Stop offset="0.45" stopColor={g.color} stopOpacity={g.opacity * 0.32} />
                <Stop offset="1" stopColor={g.color} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          {glows.map((g, i) => (
            <Ellipse key={i} cx={`${g.cx}%`} cy={`${g.cy}%`} rx={`${g.rx}%`} ry={`${g.ry}%`} fill={`url(#glow-${t.id}-${i})`} />
          ))}
        </Svg>
      ) : null}
      {stars ? (
        <>
          <Svg width="100%" height="100%" viewBox="0 0 1000 2000" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
            {STARS.map((s, i) => (
              <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={stars.color} opacity={s.o * stars.opacity} />
            ))}
          </Svg>
          {TWINKLES.map((tw) => (
            <Twinkle key={`${tw.left}-${tw.top}`} {...tw} color={stars.color} />
          ))}
        </>
      ) : null}
    </View>
  );
}
