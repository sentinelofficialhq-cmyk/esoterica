import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import type { Stage } from '@/jung/journey';

const LABEL_W = 80;

const point = (c: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(c + r * Math.sin(a)).toFixed(2)} ${(c - r * Math.cos(a)).toFixed(2)}`;
};

/** Ring segment between radii r0 and r1, from angle a0 to a1 (degrees, 0 = up, clockwise). */
function sector(c: number, r0: number, r1: number, a0: number, a1: number) {
  return `M${point(c, r0, a0)} L${point(c, r1, a0)} A${r1} ${r1} 0 0 1 ${point(c, r1, a1)} L${point(c, r0, a1)} A${r0} ${r0} 0 0 0 ${point(c, r0, a0)} Z`;
}

/**
 * The individuation map: four quadrants, clockwise from the top (Persona, Shadow, Anima/Animus, Self).
 * Each fills outward from the center by its share of milestones done, in one hue over a faint track,
 * with a 2px surface gap between segments. Labels sit on labelScrim pills so they stay readable over any fill.
 * Below 160px the labels and center number are dropped (a progress ring).
 */
export function Mandala({ stages, size = 220, surface: surfaceProp }: { stages: Stage[]; size?: number; surface?: string }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const surface = surfaceProp ?? colors.bg;
  const compact = size < 160;
  const c = size / 2;
  const outer = c - 2;
  const inner = outer * 0.3;
  const done = stages.reduce((a, s) => a + s.done, 0);
  const total = stages.reduce((a, s) => a + s.total, 0);
  const percent = total ? Math.round((done / total) * 100) : 0;
  const summary = stages.map((s) => `${s.name} ${s.done} of ${s.total}`).join(', ');
  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Individuation journey ${percent} percent. ${summary}`}>
      <Svg width={size} height={size}>
        {stages.map((s, i) => {
          const progress = s.total ? s.done / s.total : 0;
          return (
            <G key={s.id}>
              <Path d={sector(c, inner, outer, i * 90, i * 90 + 90)} fill={colors.goldSoft} stroke={surface} strokeWidth={2} />
              {progress > 0 ? (
                <Path d={sector(c, inner, inner + (outer - inner) * progress, i * 90, i * 90 + 90)} fill={colors.gold} stroke={surface} strokeWidth={2} />
              ) : null}
            </G>
          );
        })}
        <Circle cx={c} cy={c} r={inner - 1} fill={surface} stroke={colors.gold} strokeOpacity={0.45} strokeWidth={1} />
      </Svg>
      {compact ? null : (
        <>
          <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
            <Text style={[styles.percent, { fontSize: Math.round(size * 0.085) }]}>{`${percent}%`}</Text>
          </View>
          {stages.map((s, i) => {
            const a = ((i * 90 + 45) * Math.PI) / 180;
            const r = (inner + outer) / 2 + 4;
            return (
              <View
                key={s.id}
                pointerEvents="none"
                style={[styles.labelBox, { left: c + r * Math.sin(a) - LABEL_W / 2, top: c - r * Math.cos(a) - 10 }]}>
                <Text style={styles.label}>{s.name.split(' ')[0]}</Text>
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

const makeStyles = (t: Theme) => {
  const upper = t.shape.labelCase === 'upper';
  return StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    percent: { ...t.fonts.figure, color: t.colors.text },
    labelBox: { position: 'absolute', width: LABEL_W, height: 20, alignItems: 'center', justifyContent: 'center' },
    label: {
      ...t.fonts.bodyHeavy,
      fontSize: 10,
      letterSpacing: upper ? 1 : 0,
      textTransform: upper ? 'uppercase' : 'none',
      color: t.colors.text,
      backgroundColor: t.colors.labelScrim,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 999,
      overflow: 'hidden',
    },
  });
};
