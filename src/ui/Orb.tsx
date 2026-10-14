import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';

const RING = ['1', '♈︎', '3', '♋︎', '5', '♌︎', '7', '♎︎', '9', '♏︎', '11', '♒︎', '22', '♓︎', '33', '♉︎'];

type Props = { size?: number; onPress?: () => void; label?: string };

/** The breathing orb with a slow ring of numbers and zodiac glyphs. Tap to ask Jung. */
export function Orb({ size = 220, onPress, label = 'Ask Jung' }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const breath = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.sin) }), -1, true);
    spin.value = withRepeat(withTiming(360, { duration: 90000, easing: Easing.linear }), -1, false);
  }, [breath, spin]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.95 + breath.value * 0.07 }],
    opacity: 0.88 + breath.value * 0.12,
  }));
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  const core = size * 0.56;
  const radius = size * 0.44;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [{ width: size, height: size }, pressed && { opacity: 0.85 }]}>
      <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
        {RING.map((g, i) => {
          const angle = (i / RING.length) * Math.PI * 2;
          const x = size / 2 + Math.cos(angle) * radius - 14;
          const y = size / 2 + Math.sin(angle) * radius - 10;
          return (
            <Text key={g} style={[styles.glyph, { left: x, top: y }]}>
              {g}
            </Text>
          );
        })}
      </Animated.View>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Animated.View style={orbStyle}>
          <Svg width={core * 1.6} height={core * 1.6} viewBox="0 0 160 160">
            <Defs>
              <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
                <Stop offset="0.45" stopColor={colors.accent} stopOpacity="0.35" />
                <Stop offset="1" stopColor={colors.accent} stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="core" cx="38%" cy="32%" r="70%">
                <Stop offset="0" stopColor="#FFE2B8" />
                <Stop offset="0.35" stopColor={colors.accent} />
                <Stop offset="0.8" stopColor="#7A3BFF" />
                <Stop offset="1" stopColor="#2A1460" />
              </RadialGradient>
            </Defs>
            <Circle cx={80} cy={80} r={80} fill="url(#halo)" />
            <Circle cx={80} cy={80} r={50} fill="url(#core)" />
          </Svg>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    glyph: { position: 'absolute', width: 28, textAlign: 'center', fontFamily: t.fonts.bodyHeavy, fontSize: 12, color: t.colors.textFaint },
  });
