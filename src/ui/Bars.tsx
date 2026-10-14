import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { radii, space } from '@/ui/theme';

export type BarDatum = { key: string; label: string; value: number; highlight?: boolean };

type ColumnProps = { data: BarDatum[]; max?: number; height?: number; onPressBar?: (d: BarDatum) => void; unit?: string; showValues?: boolean };

/**
 * Columns for a short series (the forecast). One hue: the highlighted column wears the full accent,
 * the rest a lighter step of it. Values sit above the columns in text colors, never the data color.
 */
export function Columns({ data, max = 100, height = 120, onPressBar, unit = '', showValues = true }: ColumnProps) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const [active, setActive] = useState<string | null>(null);
  return (
    <View accessibilityRole="list">
      <View style={[s.plot, { height: height + 26 }]}>
        {data.map((d) => {
          const h = Math.max(4, (d.value / max) * height);
          const strong = d.highlight || active === d.key;
          return (
            <Pressable
              key={d.key}
              accessibilityRole="button"
              accessibilityLabel={`${d.label}: ${d.value}${unit}`}
              onPress={() => onPressBar?.(d)}
              onHoverIn={() => setActive(d.key)}
              onHoverOut={() => setActive(null)}
              onPressIn={() => setActive(d.key)}
              onPressOut={() => setActive(null)}
              style={s.slot}>
              <Text style={[s.value, !showValues && !strong && s.hidden, strong && s.valueStrong]}>
                {d.value}
                {unit}
              </Text>
              <View
                style={[
                  s.column,
                  {
                    height: h,
                    backgroundColor: strong ? t.colors.accent : t.colors.track,
                    shadowColor: strong ? t.colors.accent : 'transparent',
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
      <View style={s.labels}>
        {data.map((d) => (
          <Text key={d.key} style={[s.axisLabel, d.highlight && s.axisLabelStrong]}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

/** One labeled horizontal bar (0–100), value at the tip in text color. Used for sub-scores. */
export function MeterBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const s = useStyles(makeStyles);
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <View style={s.meterRow} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={s.meterLabel}>{label}</Text>
      <View style={s.meterTrack}>
        <View style={[s.meterFill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={s.meterValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    plot: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space(2) },
    slot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: space(1.5) },
    column: {
      width: t.id === 'gilded' ? 10 : '62%',
      maxWidth: 34,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      borderBottomLeftRadius: 1,
      borderBottomRightRadius: 1,
      shadowOpacity: 0.55,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 0 },
    },
    value: { fontFamily: t.fonts.displaySemi, fontSize: t.id === 'gilded' ? 18 : 14, color: t.colors.textDim },
    valueStrong: { color: t.colors.text },
    hidden: { opacity: 0 },
    labels: { flexDirection: 'row', justifyContent: 'space-between', gap: space(2), marginTop: space(2) },
    axisLabel: { flex: 1, textAlign: 'center', fontFamily: t.fonts.bodyBold, fontSize: 11, letterSpacing: t.id === 'gilded' ? 1.2 : 0, color: t.colors.textDim },
    axisLabelStrong: { color: t.colors.text },
    meterRow: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
    meterLabel: { width: 92, fontFamily: t.fonts.bodyMedium, fontSize: 13, color: t.colors.textDim },
    meterTrack: { flex: 1, height: 10, borderRadius: radii.pill, backgroundColor: t.colors.track, overflow: 'hidden' },
    meterFill: { height: 10, borderRadius: radii.pill, backgroundColor: t.colors.accent },
    meterValue: { width: 32, textAlign: 'right', fontFamily: t.fonts.bodySemi, fontSize: 13, color: t.colors.text },
  });
