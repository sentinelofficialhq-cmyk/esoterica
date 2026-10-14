import { StyleSheet, View } from 'react-native';

import type { Reduced } from '@/engines/numerology';
import { Numeral } from '@/ui/Numeral';
import { useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

/** Big gradient number with its compound written small: "28/1" → 1 with "28/" beside it. */
export function NumberBadge({ reduced, label, size = 'lg' }: { reduced: Reduced; label?: string; size?: 'lg' | 'md' }) {
  const t = useTheme();
  const showCompound = reduced.compound !== reduced.value;
  const big = size === 'lg' ? 68 : 44;
  return (
    <View style={styles.numberWrap}>
      {label ? <Txt variant="label">{label}</Txt> : null}
      <View style={styles.numberRow}>
        {showCompound ? (
          <Txt variant="title" color={t.colors.textDim} style={{ fontSize: big * 0.4, lineHeight: big * 0.5, marginBottom: big * 0.16 }}>
            {reduced.compound}/
          </Txt>
        ) : null}
        <Numeral value={reduced.value === 0 ? '—' : reduced.value} size={big} align="left" label={`${label ?? 'Number'} ${reduced.display}`} />
      </View>
      {reduced.master ? (
        <Txt variant="label" color={t.colors.gold}>
          Master number
        </Txt>
      ) : null}
      {reduced.karmicDebt ? (
        <Txt variant="label" color={t.colors.violet}>
          Karmic debt {reduced.karmicDebt}
        </Txt>
      ) : null}
    </View>
  );
}

/** Glyph + name + caption, used for Western signs and Chinese animals. */
export function SignBadge({ glyph, name, caption, label }: { glyph: string; name: string; caption?: string; label?: string }) {
  const t = useTheme();
  return (
    <View style={styles.signWrap}>
      {label ? <Txt variant="label">{label}</Txt> : null}
      <Txt style={styles.glyph} color={t.colors.glyph}>
        {glyph}
      </Txt>
      <Txt variant="heading">{name}</Txt>
      {caption ? <Txt variant="small">{caption}</Txt> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  numberWrap: { gap: space(1), alignItems: 'flex-start' },
  numberRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  signWrap: { gap: space(1), alignItems: 'flex-start' },
  glyph: { fontSize: 32, lineHeight: 38 },
});
