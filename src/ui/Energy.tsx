import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import { svgFont, type Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';

const RING_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '22', '33'];
/** Positions of the twelve ring numbers, every 30°, radius 60 around (66, 66). */
const RING_POINTS = RING_NUMBERS.map((n, i) => {
  const a = (i * 30 * Math.PI) / 180;
  return { n, x: 66 + 60 * Math.sin(a), y: 66 - 60 * Math.cos(a) + 3 };
});
const C = 2 * Math.PI * 44;
/** EnergyMeter's ring stroke. */
const METER_STROKE = 6;

const clampScore = (score: number) => Math.max(0, Math.min(100, score));

type DialProps = { score: number; label: string; lifePath: number; animalGlyph: string; signGlyph: string; size?: number };

/**
 * The 'dial' energy widget (Ember Glass): today's energy as a single-hue meter inside a ring of the numerology
 * numbers, with nodes for the three systems (Life Path, Chinese animal, Western sign). Score and label in text colors.
 */
export function EnergyDial({ score, label, lifePath, animalGlyph, signGlyph, size = 140 }: DialProps) {
  const t = useTheme();
  const c = t.colors;
  const upper = t.shape.labelCase === 'upper';
  const pct = clampScore(score) / 100;
  const node = (x: number, y: number, content: string, serif?: boolean) => (
    <G>
      <Circle cx={x} cy={y} r={11.5} fill={c.cardSolid} stroke={c.accentBright} strokeWidth={1.2} />
      <SvgText x={x} y={y + 4} textAnchor="middle" fontSize={serif ? 10.5 : 11.5} {...(serif ? {} : svgFont(t.fonts.displayBold))} fill={c.glyph}>
        {content}
      </SvgText>
    </G>
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 132 132" accessibilityLabel={`Energy today ${score} of 100, ${label}`}>
      {RING_POINTS.map((p) => (
        <SvgText key={p.n} x={p.x} y={p.y} textAnchor="middle" fontSize={8.5} {...svgFont(t.fonts.displaySemi)} fill={c.textFaint}>
          {p.n}
        </SvgText>
      ))}
      <Circle cx={66} cy={66} r={44} fill="none" stroke={c.track} strokeWidth={8} />
      <Circle cx={66} cy={66} r={44} fill="none" stroke={c.accent} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${pct * C} ${C}`} transform="rotate(-90 66 66)" />
      <SvgText x={66} y={70} textAnchor="middle" fontSize={25} {...svgFont(t.fonts.numeral)} fill={c.text}>
        {String(score)}
      </SvgText>
      <SvgText x={66} y={83} textAnchor="middle" fontSize={7.5} letterSpacing={upper ? 1.4 : 0} {...svgFont(t.fonts.bodyHeavy)} fill={c.textDim}>
        {upper ? label.toUpperCase() : label}
      </SvgText>
      {node(66, 22, String(lifePath))}
      {node(104.1, 88, animalGlyph, true)}
      {node(27.9, 88, signGlyph, true)}
    </Svg>
  );
}

/** The 'ring' energy widget (Gilded Night): a thin accent progress ring with a star at its center. */
export function EnergyRing({ score, size = 84 }: { score: number; size?: number }) {
  const t = useTheme();
  const r = 36;
  const circ = 2 * Math.PI * r;
  const pct = clampScore(score) / 100;
  return (
    <Svg width={size} height={size} viewBox="0 0 84 84" accessibilityLabel={`${score} of 100`}>
      <Circle cx={42} cy={42} r={r} fill="none" stroke={t.colors.track} strokeWidth={1} />
      <Circle cx={42} cy={42} r={r} fill="none" stroke={t.colors.accent} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={`${pct * circ} ${circ}`} transform="rotate(-90 42 42)" />
      <Circle cx={42} cy={42} r={28} fill="none" stroke={t.colors.track} strokeWidth={1} strokeDasharray="1.5 4" />
      <Path d="M42 30l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill={t.colors.accent} />
    </Svg>
  );
}

/** The 'orb' energy widget (Nebula): a glossy orb holding the score, circled by a progress ring. */
export function EnergyOrb({ score, label, size = 150 }: { score: number; label: string; size?: number }) {
  const t = useTheme();
  const c = t.colors;
  const upper = t.shape.labelCase === 'upper';
  const glow = t.shadows.orb;
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const pct = clampScore(score) / 100;
  const orb = size * 0.77;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel={`Energy today ${score} of 100, ${label}`}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.orbTrack} strokeWidth={3} />
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.orbRing} strokeWidth={3} strokeLinecap="round" strokeDasharray={`${pct * circ} ${circ}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <LinearGradient
        colors={t.gradients.energyOrb.colors}
        locations={t.gradients.energyOrb.locations}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.85, y: 0.95 }}
        style={{
          width: orb,
          height: orb,
          borderRadius: orb / 2,
          alignItems: 'center',
          justifyContent: 'center',
          ...(glow ? { shadowColor: glow.color, shadowOpacity: glow.opacity, shadowRadius: glow.radius, shadowOffset: { width: 0, height: 0 } } : null),
        }}>
        <Text style={{ ...t.fonts.numeral, fontSize: orb * 0.34, color: c.onOrb, textShadowColor: t.shadows.orbText, textShadowRadius: 10 }}>{score}</Text>
        <Text style={{ ...t.fonts.bodyBold, fontSize: 11, letterSpacing: upper ? 1.6 : 0, color: c.onOrb, textShadowColor: t.shadows.orbText, textShadowRadius: 8 }}>
          {upper ? label.toUpperCase() : label}
        </Text>
      </LinearGradient>
    </View>
  );
}

/**
 * The 'meter' energy widget (Ember Quiet, Daylight): a plain ring on a neutral track, with the score and
 * its label inside.
 */
export function EnergyMeter({ score, label, size = 104 }: { score: number; label: string; size?: number }) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const r = size / 2 - METER_STROKE;
  const circ = 2 * Math.PI * r;
  const pct = clampScore(score) / 100;
  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`Energy ${score} of 100, ${label}`}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.colors.meterTrack} strokeWidth={METER_STROKE} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={t.colors.accent}
          strokeWidth={METER_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${pct * circ} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, s.center]}>
        <Text style={s.meterScore}>{score}</Text>
        <Text style={s.meterLabel}>{label}</Text>
      </View>
    </View>
  );
}

/** A linear energy meter: the look's meter height and radius, a neutral track and an accent fill at score%. */
export function EnergyBar({ score }: { score: number }) {
  const s = useStyles(makeStyles);
  const pct = clampScore(score);
  return (
    <View style={s.bar} accessible accessibilityRole="progressbar" accessibilityLabel="Energy today" accessibilityValue={{ min: 0, max: 100, now: pct }}>
      <View style={[s.barFill, { width: `${pct}%` }]} />
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    center: { alignItems: 'center', justifyContent: 'center' },
    meterScore: { ...t.fonts.numeral, fontSize: 34, lineHeight: 38, fontVariant: ['tabular-nums'], color: t.colors.text },
    meterLabel: { ...t.fonts.bodySemi, fontSize: 12, lineHeight: 15, color: t.colors.textDim },
    bar: { height: t.shape.meter.height, borderRadius: t.shape.meter.radius, backgroundColor: t.colors.meterTrack, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: t.shape.meter.radius, backgroundColor: t.colors.accent },
  });
