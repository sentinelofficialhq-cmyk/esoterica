import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { inline, type DayNotes } from '@/content/dayNotes';
import type { DayEnergy } from '@/engines/timing';
import { Card } from '@/ui/Card';
import { EnergyBar, EnergyMeter } from '@/ui/Energy';
import { Numeral } from '@/ui/Numeral';
import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

type Props = { e: DayEnergy; notes: DayNotes };

/** The 'calm' layout's today: an energy card (meter, personal day, headline, advice), then the moon and lunar day tiles. */
export function CalmToday({ e, notes }: Props) {
  const s = useStyles(makeStyles);
  return (
    <>
      <Card style={s.energyCard} onPress={() => router.push('/calendar')} accessibilityLabel={`Your energy today: ${e.score} of 100, ${e.label}`}>
        <EnergyMeter score={e.score} label={e.label} />
        <View style={s.energyText}>
          <Text style={s.personalDay}>{`Personal Day ${e.personalDay}`}</Text>
          <Text style={s.headline}>{notes.headline}</Text>
          <Text style={s.advice}>{notes.advice}</Text>
        </View>
      </Card>
      <View style={s.sky}>
        <SkyTile label="Moon" value={e.moon} note={notes.moon} />
        <SkyTile label="Lunar day" value={`${e.dayAnimal} day`} note={notes.relation} />
      </View>
    </>
  );
}

function SkyTile({ label, value, note }: { label: string; value: string; note: string }) {
  const s = useStyles(makeStyles);
  return (
    <Card style={s.skyTile}>
      <Text style={s.skyLabel}>{label}</Text>
      <Text style={s.skyValue}>{value}</Text>
      <Text style={s.skyNote}>{note}</Text>
    </Card>
  );
}

/** The 'editorial' layout's today: the energy figure between hairlines, then a ledger of the day. */
export function EditorialToday({ e, notes }: Props) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Your energy today: ${e.score} of 100, ${e.label}`}
        onPress={() => router.push('/calendar')}
        style={({ pressed }) => [s.figure, pressed && s.pressed]}>
        <View style={s.figureLabels}>
          <Txt variant="label">Energy today</Txt>
          <Txt variant="label">{e.label}</Txt>
        </View>
        <View style={s.figureRow}>
          <Numeral value={e.score} size={t.typography.number.fontSize} align="left" label={`Energy ${e.score}`} />
          <Text style={s.outOf}>/ 100</Text>
        </View>
        <EnergyBar score={e.score} />
      </Pressable>
      <View>
        <LedgerRow term="Personal day" value={`${e.personalDay} · ${notes.advice}`} />
        <LedgerRow term="Moon" value={`${e.moon} · ${inline(notes.moon)}`} />
        <LedgerRow term="Lunar day" value={`${e.dayAnimal} · ${inline(notes.relation)}`} last />
      </View>
    </>
  );
}

function LedgerRow({ term, value, last }: { term: string; value: string; last?: boolean }) {
  const s = useStyles(makeStyles);
  return (
    <View style={[s.ledgerRow, last && s.ledgerLast]}>
      <Txt variant="label" style={s.term}>
        {term}
      </Txt>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    pressed: { opacity: 0.85 },
    energyCard: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 18 },
    energyText: { flex: 1, gap: space(1) },
    personalDay: { ...t.fonts.bodySemi, fontSize: 13, lineHeight: 18, color: t.colors.accent },
    headline: { ...t.fonts.bodySemi, fontSize: 17, lineHeight: 22, color: t.colors.text },
    advice: { ...t.fonts.body, fontSize: 14, lineHeight: 19, color: t.colors.textDim },
    sky: { flexDirection: 'row', gap: space(3) },
    skyTile: { flex: 1, padding: 14, borderRadius: 18, gap: space(1) },
    skyLabel: { ...t.fonts.bodySemi, fontSize: 13, lineHeight: 18, color: t.colors.textDim },
    skyValue: { ...t.fonts.bodySemi, fontSize: 15, lineHeight: 20, color: t.colors.text },
    skyNote: { ...t.fonts.body, fontSize: 13, lineHeight: 18, color: t.colors.textDim },
    figure: { marginTop: 22, paddingTop: space(4), paddingBottom: 18, borderTopWidth: 1, borderTopColor: t.colors.border },
    figureLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: space(3) },
    figureRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    outOf: { ...t.fonts.body, fontSize: 17, lineHeight: 22, color: t.colors.textDim },
    ledgerRow: { flexDirection: 'row', gap: space(4), paddingVertical: space(3), borderTopWidth: 1, borderTopColor: t.colors.border },
    ledgerLast: { borderBottomWidth: 1, borderBottomColor: t.colors.border },
    term: { width: 96, lineHeight: 20 },
    value: { ...t.fonts.body, flex: 1, fontSize: 15, lineHeight: 20, color: t.colors.text },
  });
