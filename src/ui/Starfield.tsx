import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { hash } from '@/lib/hash';

const STAR_COUNT = 110;
const W = 1000;
const H = 2000;

type Star = { x: number; y: number; r: number; o: number };

/** Seeded, so the sky is identical on every render and every screen. */
export const STARS: Star[] = Array.from({ length: STAR_COUNT }, (_, i) => {
  const h = hash(`star-${i}`);
  return {
    x: h % W,
    y: (h >>> 10) % H,
    r: 0.8 + ((h >>> 4) % 10) / 6,
    o: 0.25 + ((h >>> 7) % 60) / 100,
  };
});

export function Twinkle({ left, top, delay, color = '#FFFFFF' }: { left: `${number}%`; top: `${number}%`; delay: number; color?: string }) {
  const opacity = useSharedValue(0.15);
  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withTiming(0.9, { duration: 2400, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [delay, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View pointerEvents="none" style={[styles.twinkle, { left, top, backgroundColor: color, shadowColor: color }, style]} />;
}

export const TWINKLES: { left: `${number}%`; top: `${number}%`; delay: number }[] = [
  { left: '12%', top: '8%', delay: 0 },
  { left: '78%', top: '14%', delay: 900 },
  { left: '64%', top: '38%', delay: 1700 },
  { left: '22%', top: '55%', delay: 600 },
  { left: '88%', top: '72%', delay: 1300 },
  { left: '40%', top: '86%', delay: 2100 },
];

const styles = StyleSheet.create({
  twinkle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
});
