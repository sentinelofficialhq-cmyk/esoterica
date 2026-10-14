import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { useTheme } from '@/ui/ThemeProvider';

const STAR = 'M50 18L82 50L50 82L18 50ZM27.4 27.4H72.6V72.6H27.4Z';

/**
 * Esoterica's mark: an eight-pointed star with an open eye at the center of a mandala ring, drawn in
 * the look's `logo` colors (parts it sets to null are left out). Same shapes as assets/logo.svg.
 */
export function Logo({ size = 96 }: { size?: number }) {
  const { logo } = useTheme();
  const { ring, rays, starFill, starStroke, eye, iris, pupil, highlight } = logo;
  const starPaint = Array.isArray(starFill) ? 'url(#flame)' : starFill;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {Array.isArray(starFill) ? (
        <Defs>
          <LinearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={starFill[0]} />
            <Stop offset="1" stopColor={starFill[1]} />
          </LinearGradient>
        </Defs>
      ) : null}
      {ring ? <Circle cx={50} cy={50} r={40} fill="none" stroke={ring.color} strokeOpacity={ring.opacity} strokeWidth={ring.width} /> : null}
      {rays ? (
        <Path
          d="M93 50L97 50M80.4 80.4L83.2 83.2M50 93L50 97M19.6 80.4L16.8 83.2M7 50L3 50M19.6 19.6L16.8 16.8M50 7L50 3M80.4 19.6L83.2 16.8"
          fill="none"
          stroke={rays.color}
          strokeOpacity={rays.opacity}
          strokeWidth={rays.width}
          strokeLinecap="round"
        />
      ) : null}
      {starPaint ? (
        <>
          <Path d="M50 18L82 50L50 82L18 50Z" fill={starPaint} />
          <Path d="M27.4 27.4H72.6V72.6H27.4Z" fill={starPaint} />
        </>
      ) : null}
      {starStroke ? <Path d={STAR} fill="none" stroke={starStroke.color} strokeOpacity={starStroke.opacity} strokeWidth={starStroke.width} strokeLinejoin="round" /> : null}
      <Path d="M31 50Q50 33 69 50Q50 67 31 50Z" fill={eye.fill} stroke={eye.stroke} strokeWidth={eye.width} strokeLinejoin="round" />
      <Circle cx={50} cy={50} r={7} fill={iris.fill} stroke={iris.stroke?.color} strokeWidth={iris.stroke?.width} />
      <Circle cx={50} cy={50} r={pupil.r} fill={pupil.color} />
      {highlight ? <Circle cx={47.8} cy={47.6} r={1.5} fill={highlight} /> : null}
    </Svg>
  );
}
