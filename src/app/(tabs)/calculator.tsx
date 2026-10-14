import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState, type ComponentType } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ANIMAL_GLYPHS, ANIMAL_MEANINGS, ELEMENT_MEANINGS } from '@/content/chineseSigns';
import { PERSONAL_YEAR_THEMES } from '@/content/dayGuidance';
import { KARMIC_MEANINGS, loveAndWork, meaningFor } from '@/content/numbers';
import { SIGN_MEANINGS } from '@/content/westernSigns';
import { allies, enemy } from '@/engines/chinese';
import { personalDay, personalMonth, personalYear } from '@/engines/numerology';
import { buildProfile, type Profile } from '@/engines/profile';
import { monthLong, ordinal, parseYMD, todayLocal } from '@/lib/date';
import { useProfile } from '@/store/profileStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { IconButton } from '@/ui/IconButton';
import {
  BookmarkIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChevronRightIcon,
  HeartIcon,
  PencilIcon,
  ShadowIcon,
  StarIcon,
  TodayIcon,
  YinYangIcon,
} from '@/ui/icons';
import { Numeral } from '@/ui/Numeral';
import { Screen, useTabBarSpace } from '@/ui/Screen';
import { TextField } from '@/ui/TextField';
import type { Theme, ThemeShape } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';
import { WheelDatePicker } from '@/ui/WheelDatePicker';

type LensId = 'overview' | 'cycles' | 'eastern' | 'western' | 'love' | 'career' | 'shadow';
type IconCmp = ComponentType<{ size?: number; color?: string }>;
const LENSES: { id: LensId; label: string; icon: IconCmp }[] = [
  { id: 'overview', label: 'Overview', icon: StarIcon },
  { id: 'cycles', label: 'Cycles', icon: CalendarIcon },
  { id: 'eastern', label: 'Eastern', icon: YinYangIcon },
  { id: 'western', label: 'Western', icon: TodayIcon },
  { id: 'love', label: 'Love', icon: HeartIcon },
  { id: 'career', label: 'Career', icon: BriefcaseIcon },
  { id: 'shadow', label: 'Shadow', icon: ShadowIcon },
];

type LensText = { title: string; subtitle: string; body: string };

/** A date in the look's style: 09 / 14 / 1985, 14 September 1985, or 14 · 09 · 1985. */
function lookDate(style: ThemeShape['dateStyle'], y: number, m: number, d: number): string {
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  switch (style) {
    case 'long':
      return `${d} ${monthLong(m)} ${y}`;
    case 'dots':
      return `${dd} · ${mm} · ${y}`;
    case 'slashes':
      return `${mm} / ${dd} / ${y}`;
  }
}

function lensText(lens: LensId, p: Profile, today: string): LensText {
  const lp = meaningFor(p.lifePath.value);
  const sign = SIGN_MEANINGS[p.western.sign];
  const animal = ANIMAL_MEANINGS[p.chinese.animal];
  const { y, m } = parseYMD(today);
  switch (lens) {
    case 'overview': {
      const karmic = p.lifePath.karmicDebt ? ` The ${p.lifePath.karmicDebt} underneath: ${KARMIC_MEANINGS[p.lifePath.karmicDebt].lesson}` : '';
      return { title: `Life Path ${p.lifePath.display}`, subtitle: `${lp.title}: ${lp.keywords.slice(0, 3).join(', ')}`, body: `${lp.light}${karmic}` };
    }
    case 'cycles': {
      const py = personalYear(p.birthDate, y);
      const pm = personalMonth(p.birthDate, y, m);
      const pd = personalDay(p.birthDate, today);
      return {
        title: `Personal Year ${py.display}`,
        subtitle: `A ${meaningFor(py.value).title.replace('The ', '')} year`,
        body: `${PERSONAL_YEAR_THEMES[py.root]} This month is a personal ${pm.display} (${meaningFor(pm.value).title.replace('The ', '')}), and today a personal ${pd.display} day (${meaningFor(pd.value).title.replace('The ', '')}).`,
      };
    }
    case 'eastern': {
      const friends = allies(p.chinese.animal);
      return {
        title: `${p.chinese.element} ${p.chinese.animal}`,
        subtitle: animal.traits.join(', '),
        body: `${animal.light} ${ELEMENT_MEANINGS[p.chinese.element].nature} Natural allies: ${friends.slice(0, -1).join(', ')} and ${friends[friends.length - 1]}. Opposite sign: ${enemy(p.chinese.animal)}.`,
      };
    }
    case 'western':
      return {
        title: p.western.sign,
        subtitle: `${p.western.element} · ${p.western.modality} · ruled by ${p.western.ruler}${p.western.cuspWith ? ` · on the ${p.western.cuspWith} cusp` : ''}`,
        body: `${sign.light} ${sign.jungNote}`,
      };
    case 'love':
      return { title: 'Love', subtitle: `Life Path ${p.lifePath.display} in love`, body: loveAndWork(p.lifePath.value).love };
    case 'career':
      return { title: 'Career', subtitle: `Life Path ${p.lifePath.display} at work`, body: loveAndWork(p.lifePath.value).career };
    case 'shadow':
      return { title: 'Shadow side', subtitle: 'What the pattern tends to hide', body: `${lp.shadow} As a ${p.western.sign}: ${sign.shadow.toLowerCase()} As a ${p.chinese.animal}: ${animal.shadow.toLowerCase()} ${lp.jungNote}` };
  }
}

export default function CalculatorTab() {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const me = useProfile();
  const params = useLocalSearchParams<{ pick?: string }>();
  const [date, setDate] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [editing, setEditing] = useState(params.pick === '1');
  const [lens, setLens] = useState<LensId>('overview');
  const [open, setOpen] = useState<string | null>(null);
  const tabSpace = useTabBarSpace();
  if (!me) return <Redirect href="/onboarding" />;

  const shown = date ?? me.birthDate;
  const mine = shown === me.birthDate && !label;
  const p = mine ? me : buildProfile({ name: label, birthDate: shown });
  const today = todayLocal();
  const { y, m, d } = parseYMD(shown);
  const ty = parseYMD(today);
  const py = personalYear(p.birthDate, ty.y);
  const pm = personalMonth(p.birthDate, ty.y, ty.m);
  const text = lensText(lens, p, today);
  const lpm = meaningFor(p.lifePath.value);
  const sign = SIGN_MEANINGS[p.western.sign];
  const animal = ANIMAL_MEANINGS[p.chinese.animal];
  const dateText = lookDate(t.shape.dateStyle, y, m, d);

  const glyphStyle = [s.bigGlyph, t.shadows.numeral ? { textShadowColor: t.shadows.numeral, textShadowRadius: 16 } : null];
  const sections = [
    { id: 'personality', title: 'Personality', tint: t.colors.gold, body: `${lpm.keywords.join(', ')}. As a ${p.western.sign}: ${sign.traits.join(', ')}. As a ${p.chinese.animal}: ${animal.traits.join(', ')}.` },
    { id: 'strengths', title: 'Strengths', tint: t.colors.teal, body: `${sign.light} ${animal.light}` },
    { id: 'shadow', title: 'Shadow side', tint: t.colors.violet, body: lpm.shadow },
    { id: 'jung', title: 'Jung’s note', tint: t.colors.accentBright, body: lpm.jungNote },
  ];

  return (
    <Screen bottomInset={tabSpace}>
      {/* The split layout gets three small cards over a date bar; every other layout shares the wide top. */}
      {t.shape.layout !== 'split' ? (
        <>
          <View style={s.dateHeader}>
            <View style={s.flex}>
              <Txt variant="label">{mine ? 'Born' : label || 'Date'}</Txt>
              <Txt variant="heading">{dateText}</Txt>
            </View>
            <IconButton label="Change date" onPress={() => setEditing(!editing)}>
              <PencilIcon size={18} color={t.colors.accentBright} />
            </IconButton>
            <IconButton label="Save as a person" onPress={() => router.push({ pathname: '/person', params: { date: shown } })}>
              <BookmarkIcon size={18} color={t.colors.accentBright} />
            </IconButton>
          </View>
          <Card tone="featured" style={s.heroCard}>
            <Txt variant="label">Life Path</Txt>
            <Numeral value={p.lifePath.value} size={104} label={`Life Path ${p.lifePath.display}`} />
            <Txt variant="heading" italic>{`${p.lifePath.display} · ${lpm.title}`}</Txt>
            <View style={s.factsRow}>
              <Txt variant="label">{`Day ${p.birthday.display}`}</Txt>
              <Txt variant="label">{`Year ${py.display}`}</Txt>
              <Txt variant="label">{`Month ${pm.display}`}</Txt>
            </View>
          </Card>
          <View style={s.halves}>
            <Card style={s.half}>
              <Text style={[s.midGlyph, { color: t.colors.glyph }]}>{ANIMAL_GLYPHS[p.chinese.animal]}</Text>
              <View style={s.flex}>
                <Txt variant="label">Eastern</Txt>
                <Txt variant="heading">{`${p.chinese.element} ${p.chinese.animal}`}</Txt>
              </View>
            </Card>
            <Card style={s.half}>
              <Text style={[s.midGlyph, { color: t.colors.glyph }]}>{p.western.glyph}</Text>
              <View style={s.flex}>
                <Txt variant="label">Western</Txt>
                <Txt variant="heading">{`${p.western.sign}`}</Txt>
              </View>
            </Card>
          </View>
        </>
      ) : (
        <>
          <View style={s.cards}>
            <Card tone="featured" style={s.patternCard}>
              <Txt variant="label" color={t.colors.text}>
                Life Path
              </Txt>
              <Numeral value={p.lifePath.value} size={58} label={`Life Path ${p.lifePath.display}`} />
              <Txt variant="label">Day</Txt>
              <Txt variant="heading">{ordinal(p.birthday.compound)}</Txt>
              <View style={s.chips}>
                <Text style={[s.miniChip, { borderColor: t.colors.borderHi, color: t.colors.text }]}>{`PY ${py.value}`}</Text>
                <Text style={[s.miniChip, { borderColor: t.colors.borderHi, color: t.colors.text }]}>{`PM ${pm.value}`}</Text>
              </View>
            </Card>
            <Card style={s.patternCard}>
              <Txt variant="label" color={t.colors.text}>
                Eastern
              </Txt>
              <Text style={[glyphStyle, { color: t.colors.glyph }]}>{ANIMAL_GLYPHS[p.chinese.animal]}</Text>
              <Txt variant="small" color={t.colors.text} style={s.bold} center>{`${p.chinese.element} ${p.chinese.animal}`}</Txt>
            </Card>
            <Card style={s.patternCard}>
              <Txt variant="label" color={t.colors.text}>
                Western
              </Txt>
              <Text style={[glyphStyle, { color: t.colors.glyph }]}>{p.western.glyph}</Text>
              <Txt variant="small" color={t.colors.text} style={s.bold} center>{`${p.western.sign} · ${p.western.element}`}</Txt>
            </Card>
          </View>
          <View style={s.dateRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Change date" onPress={() => setEditing(!editing)} style={[s.dateBar, t.gradients.border ? { borderColor: t.colors.accentBorder } : null]}>
              <Text style={s.dateText}>{dateText}</Text>
              <View style={s.datePencil}>
                <PencilIcon size={19} color={t.colors.textDim} />
              </View>
            </Pressable>
            <IconButton label="Save as a person" onPress={() => router.push({ pathname: '/person', params: { date: shown } })} size={54}>
              <BookmarkIcon size={20} />
            </IconButton>
          </View>
        </>
      )}

      {editing ? (
        <Card>
          <WheelDatePicker value={shown} onChange={(v) => setDate(v)} maxYear={2100} />
          <TextField label="Whose date? (optional)" value={label} onChangeText={setLabel} placeholder="e.g. Mom, Apple, our wedding" />
          <View style={s.pickerButtons}>
            <Button label="Done" small onPress={() => setEditing(false)} style={s.flex} />
            {!mine ? (
              <Button
                label="My birthday"
                variant="subtle"
                small
                style={s.flex}
                onPress={() => {
                  setDate(null);
                  setLabel('');
                  setEditing(false);
                }}
              />
            ) : null}
          </View>
        </Card>
      ) : null}

      <LensTabs lens={lens} onChange={setLens} />

      <Card tone="accent" style={s.content}>
        <Txt variant="label" color={t.colors.accentBright} center>
          {text.title}
        </Txt>
        <Text style={s.contentSubtitle}>{text.subtitle}</Text>
        <View style={[s.contentRule, { backgroundColor: t.colors.accentBorder }]} />
        <Txt variant="body" center style={s.contentBody}>
          {text.body}
        </Txt>
      </Card>

      <Button
        label="Get a Reading"
        onPress={() =>
          router.push(mine ? { pathname: '/reading', params: { type: 'full' } } : { pathname: '/reading', params: { type: 'date', date: shown, label: label || undefined } })
        }
      />
      {!mine ? (
        <Button
          label={`Compare ${label || 'this date'} with me`}
          variant="ghost"
          onPress={() => router.push({ pathname: '/reading', params: { type: 'compatibility', a: 'me', b: `date:${shown}`, blabel: label || formatShort(shown) } })}
        />
      ) : null}

      {lens === 'overview'
        ? sections.map((sec) => (
            <Card key={sec.id} onPress={() => setOpen(open === sec.id ? null : sec.id)} accessibilityLabel={sec.title}>
              <View style={s.accordionHead}>
                <Text style={[s.accordionTitle, { color: sec.tint }]}>{sec.title}</Text>
                <View style={{ transform: [{ rotate: open === sec.id ? '-90deg' : '90deg' }] }}>
                  <ChevronRightIcon size={18} color={t.colors.textDim} />
                </View>
              </View>
              {open === sec.id ? <Txt variant="bodyDim">{sec.body}</Txt> : null}
            </Card>
          ))
        : null}
    </Screen>
  );
}

const formatShort = (ymd: string) => {
  const { y, m, d } = parseYMD(ymd);
  return `${d} ${monthLong(m).slice(0, 3)} ${y}`;
};

function LensTabs({ lens, onChange }: { lens: LensId; onChange: (l: LensId) => void }) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  if (t.shape.lensTabs === 'icons') {
    return (
      <View style={s.iconTabs} accessibilityRole="tablist">
        {LENSES.map((l) => {
          const on = l.id === lens;
          return (
            <Pressable
              key={l.id}
              accessibilityRole="tab"
              accessibilityLabel={l.label}
              accessibilityState={{ selected: on }}
              onPress={() => onChange(l.id)}
              style={[s.iconTab, on ? { backgroundColor: t.colors.accent, borderColor: t.colors.accent } : { backgroundColor: t.colors.cardHi, borderColor: t.colors.border }]}>
              <l.icon size={20} color={on ? t.colors.onAccent : t.colors.textDim} />
            </Pressable>
          );
        })}
      </View>
    );
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={t.shape.lensTabs === 'text' ? s.textTabs : s.pillTabs} accessibilityRole="tablist">
      {LENSES.map((l) => {
        const on = l.id === lens;
        return t.shape.lensTabs === 'text' ? (
          <Pressable key={l.id} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(l.id)} style={[s.textTab, on && { borderBottomColor: t.colors.accent }]}>
            <Text style={[s.textTabLabel, { color: on ? t.colors.accentBright : t.colors.textDim }]}>{l.label}</Text>
          </Pressable>
        ) : (
          <Pressable
            key={l.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(l.id)}
            style={[s.pillTab, on ? { backgroundColor: t.colors.pillActive, borderColor: t.colors.pillActive } : { backgroundColor: t.colors.cardHi, borderColor: t.colors.border }]}>
            <Text style={[s.pillTabLabel, { color: on ? t.colors.onPillActive : t.colors.text }]}>{l.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    bold: { ...t.fonts.bodyBold },
    cards: { flexDirection: 'row', gap: space(2.5) },
    patternCard: { flex: 1, height: 168, alignItems: 'center', paddingHorizontal: space(1.5), paddingVertical: space(3), gap: 0 },
    chips: { flexDirection: 'row', gap: 4, marginTop: space(1) },
    miniChip: { ...t.fonts.bodyBold, fontSize: 10, borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3, overflow: 'hidden' },
    bigGlyph: { flex: 1, textAlignVertical: 'center', fontSize: 48, lineHeight: 74, textAlign: 'center' },
    midGlyph: { fontSize: 34 },
    dateRow: { flexDirection: 'row', gap: space(2.5) },
    dateBar: {
      flex: 1,
      height: 54,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateText: { ...t.fonts.displaySemi, fontSize: 20, letterSpacing: 1, color: t.colors.text },
    datePencil: { position: 'absolute', right: 14 },
    dateHeader: { flexDirection: 'row', alignItems: 'center', gap: space(2.5) },
    heroCard: { alignItems: 'center', gap: space(1), paddingVertical: space(4) },
    factsRow: { flexDirection: 'row', gap: space(5), marginTop: space(2) },
    halves: { flexDirection: 'row', gap: space(3) },
    half: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space(3) },
    pickerButtons: { flexDirection: 'row', gap: space(2) },
    iconTabs: { flexDirection: 'row', justifyContent: 'space-between' },
    iconTab: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    textTabs: { gap: space(5), borderBottomWidth: 1, borderBottomColor: t.colors.border, flexGrow: 1 },
    textTab: { height: 40, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    textTabLabel: t.ui.lensTab,
    pillTabs: { gap: space(2) },
    pillTab: { height: 38, paddingHorizontal: space(4), borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    pillTabLabel: t.ui.lensPill,
    content: { alignItems: 'center', gap: space(3), paddingVertical: space(5), paddingHorizontal: space(5) },
    contentSubtitle: { ...t.ui.subtitle, color: t.colors.accentBright, textAlign: 'center' },
    contentRule: { width: '80%', height: 1 },
    contentBody: { lineHeight: 25 },
    accordionHead: { flexDirection: 'row', alignItems: 'center', minHeight: 30 },
    accordionTitle: { flex: 1, ...t.ui.sectionTitle },
  });
