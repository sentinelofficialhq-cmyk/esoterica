import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

/** Esoterica's mark: an eight-pointed star with an open eye at the center of a mandala ring. Same shapes as assets/logo.svg. */
export function Logo({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFD08A" />
          <Stop offset="1" stopColor="#FF7A2F" />
        </LinearGradient>
      </Defs>
      <Circle cx={50} cy={50} r={40} fill="none" stroke="#F4C26B" strokeOpacity={0.6} strokeWidth={1.5} />
      <Path
        d="M93 50L97 50M80.4 80.4L83.2 83.2M50 93L50 97M19.6 80.4L16.8 83.2M7 50L3 50M19.6 19.6L16.8 16.8M50 7L50 3M80.4 19.6L83.2 16.8"
        fill="none"
        stroke="#F4C26B"
        strokeOpacity={0.75}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path d="M50 18L82 50L50 82L18 50Z" fill="url(#flame)" />
      <Path d="M27.4 27.4H72.6V72.6H27.4Z" fill="url(#flame)" />
      <Path d="M50 18L82 50L50 82L18 50ZM27.4 27.4H72.6V72.6H27.4Z" fill="none" stroke="#FFF1DC" strokeOpacity={0.55} strokeWidth={1} strokeLinejoin="round" />
      <Path d="M31 50Q50 33 69 50Q50 67 31 50Z" fill="#0B0A1F" stroke="#FFF1DC" strokeWidth={1.6} strokeLinejoin="round" />
      <Circle cx={50} cy={50} r={7} fill="#8B7CFF" />
      <Circle cx={50} cy={50} r={2.8} fill="#0B0A1F" />
      <Circle cx={47.8} cy={47.6} r={1.5} fill="#FFF1DC" />
    </Svg>
  );
}
