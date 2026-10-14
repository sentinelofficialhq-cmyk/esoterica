import { StyleSheet, View } from 'react-native';

import type { Reduced } from '@/engines/numerology';
import { Numeral } from '@/ui/Numeral';
import { useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

/** Big number (gradient or solid, per look) with its compound written small: "28/1" → 1 with "28/" beside it. */
export function NumberBadge({ reduced, label, size = 'lg' }: { reduced: Reduced; label?: string; size?: 'lg' | 'md' }) {
  const t = useTheme();
  const showCompound = reduced.compound !== reduced.value;
  const big = t.shape.numeralSize[size];
  const small = big * t.shape.compoundScale;
  return (
    <View style={styles.numberWrap}>
      {label ? <Txt variant="label">{label}</Txt> : null}
      <View style={styles.numberRow}>
        {showCompound ? (
          <Txt color={t.colors.textDim} style={[t.ui.compound, { fontSize: small, lineHeight: small * 1.25, marginBottom: small * 0.4 }]}>
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
      <Txt style={t.ui.glyph} color={t.colors.glyph}>
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
});
