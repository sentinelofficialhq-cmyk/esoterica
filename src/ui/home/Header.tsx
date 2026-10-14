import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ANIMAL_GLYPHS } from '@/content/chineseSigns';
import type { Profile } from '@/engines/profile';
import type { DayEnergy } from '@/engines/timing';
import { sunSign } from '@/engines/western';
import { monthLong, parseYMD, weekdayLong } from '@/lib/date';
import { IconButton } from '@/ui/IconButton';
import { GearIcon, MoonIcon } from '@/ui/icons';
import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

type Props = { profile: Profile; e: DayEnergy; today: string };

const partOfDay = (hour = new Date().getHours()) => (hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening');

/**
 * Home's header, per the look's `shape.header`:
 * - avatarMoon / avatarChips: the animal avatar on the left, a short hello, then the date as lines or as chips.
 * - formal: the date as a label over "Good evening, *Name*", the avatar on the right.
 * - greeting: the date over "Good evening, Name" and a settings button; no avatar.
 */
export function HomeHeader({ profile, e, today }: Props) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const { m, d } = parseYMD(today);
  const first = profile.name || 'friend';
  const universal = e.universalDayDisplay.split('/').pop() ?? '';
  const season = sunSign(today).sign;
  const settings = (color?: string) => (
    <IconButton label="Settings" onPress={() => router.push('/settings')}>
      <GearIcon size={20} color={color} />
    </IconButton>
  );
  const avatar = (
    <View style={[s.avatar, { borderColor: t.colors.accentBorder, backgroundColor: t.colors.accentSoft }]}>
      <Text style={[s.avatarGlyph, { color: t.colors.glyph }]}>{ANIMAL_GLYPHS[profile.chinese.animal]}</Text>
    </View>
  );

  if (t.shape.header === 'greeting') {
    // The editorial look tops the greeting with gilded's tracked date label, in the accent.
    const editorial = t.shape.layout === 'editorial';
    return (
      <View style={[s.headerRow, editorial && s.alignTop]}>
        <View style={[s.flex, editorial && s.headerStack]}>
          <Txt variant="label" color={editorial ? t.colors.accent : undefined}>
            {editorial ? `${weekdayLong(today)} · ${d} ${monthLong(m)}` : `${weekdayLong(today)}, ${d} ${monthLong(m)}`}
          </Txt>
          <Txt variant="title">{`Good ${partOfDay()}, ${first}`}</Txt>
        </View>
        {settings(t.colors.textDim)}
      </View>
    );
  }

  if (t.shape.header === 'formal') {
    return (
      <View style={s.headerRow}>
        <View style={[s.flex, s.headerText]}>
          <Txt variant="label">{`${weekdayLong(today)} · ${d} ${monthLong(m)}`}</Txt>
          <Txt variant="title">
            {`Good ${partOfDay()}, `}
            <Txt variant="title" italic color={t.colors.accentBright}>
              {first}
            </Txt>
          </Txt>
          <Txt variant="small">{`Universal Day ${universal} · ${season} season · ${e.moon}`}</Txt>
        </View>
        {avatar}
      </View>
    );
  }

  const chips = t.shape.header === 'avatarChips';
  return (
    <View style={s.headerRow}>
      {avatar}
      <View style={[s.flex, s.headerText]}>
        <Txt variant="heading" style={s.greeting}>{`${t.shape.voice === 'playful' ? 'Hi' : 'Hello'}, ${first}`}</Txt>
        {chips ? (
          <View style={s.chipRow}>
            <Pill text={`Universal ${universal}`} tint={t.colors.violetSoft} />
            <Pill text={`${season} season`} tint={t.colors.dangerSoft} />
            <Pill text={`${weekdayLong(today).slice(0, 3)} ${d}`} tint={t.colors.goldSoft} />
          </View>
        ) : (
          <>
            <Txt variant="small">{`${weekdayLong(today)}, ${monthLong(m)} ${d}`}</Txt>
            <Txt variant="small" color={t.colors.accentBright} style={s.bold}>{`Universal Day ${universal} · ${season} season`}</Txt>
          </>
        )}
      </View>
      {t.shape.header === 'avatarMoon' ? (
        <IconButton label={`Moon: ${e.moon}`} onPress={() => router.push('/calendar')}>
          <MoonIcon size={20} color={t.colors.accentBright} />
        </IconButton>
      ) : null}
      {settings()}
    </View>
  );
}

function Pill({ text, tint }: { text: string; tint: string }) {
  const s = useStyles(makeStyles);
  return (
    <View style={[s.pill, { backgroundColor: tint }]}>
      <Txt variant="small" style={s.pillText}>
        {text}
      </Txt>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    bold: { ...t.fonts.bodyBold },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
    alignTop: { alignItems: 'flex-start' },
    headerText: { gap: 2 },
    headerStack: { gap: 6 },
    greeting: { fontSize: 21, lineHeight: 26 },
    avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    avatarGlyph: { fontSize: 23 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space(1.5), marginTop: 2 },
    pill: { borderRadius: 999, paddingHorizontal: space(2.5), paddingVertical: 2 },
    pillText: { color: t.colors.text, ...t.fonts.bodyBold, fontSize: 11.5 },
  });
