import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DAY_GUIDANCE } from '@/content/dayGuidance';
import { meaningFor } from '@/content/numbers';
import { reduce, universalDay } from '@/engines/numerology';
import { energyEvents, energyFor, forecast } from '@/engines/timing';
import { addDays, daysInMonth, monthLong, parseYMD, todayLocal, weekday, weekdayLong, weekStart } from '@/lib/date';
import { useProfile } from '@/store/profileStore';
import { Columns } from '@/ui/Bars';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { IconButton } from '@/ui/IconButton';
import { BackIcon, ChevronRightIcon, SparkleIcon } from '@/ui/icons';
import { Numeral } from '@/ui/Numeral';
import { Screen, TAB_BAR_SPACE } from '@/ui/Screen';
import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

export default function CalendarTab() {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const profile = useProfile();
  const today = todayLocal();
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState<'week' | 'month'>('week');
  if (!profile) return <Redirect href="/onboarding" />;

  const { y, m, d } = parseYMD(selected);
  const week = forecast(profile, weekStart(selected), 7);
  const ahead = forecast(profile, selected, 5);
  const e = energyFor(profile, selected);
  const ud = universalDay(selected);
  const dom = reduce(d);
  const events = energyEvents(profile, selected, 14).slice(0, 5);
  const guidance = DAY_GUIDANCE[e.personalDay];
  const step = (n: number) => setSelected(addDays(selected, n));
  const dayLabel = (date: string) => (date === today ? 'Today' : weekday(date));

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <View style={s.header}>
        <View style={s.flex}>
          {t.id === 'gilded' ? <Txt variant="label">{`${monthLong(m)} ${y}`}</Txt> : null}
          <Txt variant="title">
            {t.id === 'gilded' ? (
              <>
                {`${weekdayLong(selected)}, `}
                <Txt variant="title" italic color={t.colors.accentBright}>{`the ${d}${d === 1 || d === 21 || d === 31 ? 'st' : d === 2 || d === 22 ? 'nd' : d === 3 || d === 23 ? 'rd' : 'th'}`}</Txt>
              </>
            ) : (
              `${monthLong(m)} ${y}`
            )}
          </Txt>
        </View>
        <IconButton label={view === 'week' ? 'Previous week' : 'Previous month'} onPress={() => step(view === 'week' ? -7 : -daysInMonth(y, m))} size={40}>
          <BackIcon size={18} />
        </IconButton>
        <IconButton label={view === 'week' ? 'Next week' : 'Next month'} onPress={() => step(view === 'week' ? 7 : daysInMonth(y, m))} size={40}>
          <ChevronRightIcon size={18} color={t.colors.text} />
        </IconButton>
      </View>

      <View style={s.toggle}>
        <Chip label="Week" selected={view === 'week'} onPress={() => setView('week')} />
        <Chip label="Month" selected={view === 'month'} onPress={() => setView('month')} />
        {selected !== today ? <Chip label="Today" onPress={() => setSelected(today)} /> : null}
      </View>

      {view === 'week' ? (
        <View style={s.week} accessibilityRole="radiogroup">
          {week.map((day) => {
            const on = day.date === selected;
            return (
              <Pressable
                key={day.date}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${weekdayLong(day.date)} ${parseYMD(day.date).d}: energy ${day.score}`}
                onPress={() => setSelected(day.date)}
                style={[s.dayCell, on ? s.dayOn : null]}>
                <Text style={[s.dayName, on && { color: t.colors.onAccent }]}>{t.id === 'gilded' ? weekday(day.date).charAt(0) : weekday(day.date).toUpperCase()}</Text>
                <Text style={[s.dayNum, on && { color: t.colors.onAccent }]}>{parseYMD(day.date).d}</Text>
                {t.id === 'nebula' ? (
                  <Text style={[s.dayScore, on && { color: t.colors.onAccent }]}>{day.score}</Text>
                ) : (
                  <View style={[s.dayDot, { backgroundColor: on ? t.colors.onAccent : t.colors.accent, opacity: on ? 1 : 0.25 + (day.score / 100) * 0.75 }]} />
                )}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <MonthGrid selected={selected} today={today} onPick={(date) => setSelected(date)} />
      )}

      <Card tone="featured" onPress={() => router.push({ pathname: '/reading', params: { type: 'daily', date: selected } })} style={s.dailyButton} accessibilityLabel="Get daily reading">
        <SparkleIcon size={20} color={t.colors.accentBright} />
        <Text style={s.dailyText}>{t.id === 'gilded' ? 'Read the day in full' : 'Get Daily Reading'}</Text>
      </Card>

      <Card>
        <View style={s.cardHead}>
          <Txt variant="label">5-day forecast</Txt>
          <Txt variant="small">Your energy, 0–100</Txt>
        </View>
        <Columns
          data={ahead.map((day, i) => ({ key: day.date, label: dayLabel(day.date), value: day.score, highlight: i === 0 }))}
          height={70}
          onPressBar={(bar) => setSelected(bar.key)}
        />
      </Card>

      <View style={s.energies}>
        <Card tone="accent" style={s.energy}>
          <Txt variant="label" color={t.colors.accentBright}>{`Universal ${ud.display}`}</Txt>
          <Numeral value={ud.value} size={52} align="left" label={`Universal day ${ud.display}`} />
          <Txt variant="label">Main energy</Txt>
          {meaningFor(ud.value).keywords.slice(0, 3).map((k) => (
            <Txt key={k} variant="body" style={s.keyword}>{`• ${k}`}</Txt>
          ))}
        </Card>
        <Card style={s.energy}>
          <Txt variant="label" color={t.colors.accentBright}>{`Day ${dom.display}`}</Txt>
          <Numeral value={dom.value} size={52} align="left" label={`Day ${dom.display}`} />
          <Txt variant="label">Secondary energy</Txt>
          {meaningFor(dom.value).keywords.slice(0, 3).map((k) => (
            <Txt key={k} variant="body" style={s.keyword}>{`• ${k}`}</Txt>
          ))}
        </Card>
      </View>

      <Card>
        <View style={s.cardHead}>
          <Txt variant="label" color={t.colors.accentBright}>
            Combo · you this day
          </Txt>
          <Txt variant="small" color={t.colors.text} style={s.bold}>{`${e.score} · ${e.label}`}</Txt>
        </View>
        <Txt variant="body">{`Personal day ${e.personalDayDisplay}: ${meaningFor(e.personalDay).title}. ${guidance.reflection}`}</Txt>
        {e.factors.map((f) => (
          <View key={f.label} style={s.factor}>
            <Text style={[s.delta, { color: f.delta > 0 ? t.colors.teal : t.colors.danger }]}>{f.delta > 0 ? `+${f.delta}` : f.delta}</Text>
            <Txt variant="small" style={s.flex}>
              {f.label}
            </Txt>
          </View>
        ))}
      </Card>

      <Card>
        <Txt variant="label">Energy events ahead</Txt>
        {events.length === 0 ? <Txt variant="small">No standout days in the next two weeks.</Txt> : null}
        {events.map((ev) => (
          <Pressable key={`${ev.date}-${ev.kind}`} onPress={() => setSelected(ev.date)} style={s.event} accessibilityRole="button">
            <Txt variant="small" color={t.colors.text} style={s.eventDate}>{`${weekday(ev.date)} ${parseYMD(ev.date).d}`}</Txt>
            <View style={s.flex}>
              <Txt variant="small" color={ev.kind === 'clash' ? t.colors.danger : t.colors.text} style={s.bold}>
                {ev.title}
              </Txt>
              {ev.detail ? <Txt variant="small">{ev.detail}</Txt> : null}
            </View>
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}

function MonthGrid({ selected, today, onPick }: { selected: string; today: string; onPick: (date: string) => void }) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const profile = useProfile();
  if (!profile) return null;
  const { y, m } = parseYMD(selected);
  const first = `${y}-${String(m).padStart(2, '0')}-01`;
  const days = forecast(profile, first, daysInMonth(y, m));
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  return (
    <Card>
      <View style={s.grid}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((h, i) => (
          <Text key={`h${i}`} style={s.gridHead}>
            {h}
          </Text>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <View key={`b${i}`} style={s.gridCell} />
        ))}
        {days.map((day, i) => {
          const on = day.date === selected;
          return (
            <Pressable key={day.date} accessibilityRole="button" accessibilityLabel={`${day.date}: energy ${day.score}`} onPress={() => onPick(day.date)} style={s.gridCell}>
              <View
                style={[
                  s.gridDay,
                  { backgroundColor: t.colors.accent, opacity: 0.18 + (day.score / 100) * 0.7 },
                  on && { opacity: 1 },
                  day.date === today && { borderWidth: 1.5, borderColor: t.colors.text },
                ]}
              />
              <Text style={[s.gridNum, on && { color: t.colors.onAccent }]}>{i + 1}</Text>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    bold: { fontFamily: t.fonts.bodyBold },
    header: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
    toggle: { flexDirection: 'row', gap: space(2) },
    week: { flexDirection: 'row', gap: space(1.5) },
    dayCell: {
      flex: 1,
      height: 78,
      borderRadius: t.id === 'gilded' ? 39 : 20,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    dayOn: { backgroundColor: t.colors.accent, borderColor: t.colors.accent, shadowColor: t.colors.accent, shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
    dayName: { fontFamily: t.fonts.bodyBold, fontSize: 10.5, letterSpacing: 0.6, color: t.colors.textDim },
    dayNum: { fontFamily: t.fonts.displayBold, fontSize: t.id === 'gilded' ? 22 : 18, color: t.colors.text },
    dayScore: { fontFamily: t.fonts.bodyBold, fontSize: 10.5, color: t.colors.accentBright },
    dayDot: { width: 5, height: 5, borderRadius: 3 },
    dailyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space(2.5), paddingVertical: space(3.5) },
    dailyText: {
      fontFamily: t.id === 'gilded' ? t.fonts.displayItalic : t.fonts.displaySemi,
      fontSize: t.id === 'gilded' ? 20 : 17,
      color: t.colors.accentBright,
    },
    cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space(2) },
    energies: { flexDirection: 'row', gap: space(3) },
    energy: { flex: 1, gap: 2 },
    keyword: { fontFamily: t.fonts.bodySemi, fontSize: 14.5, lineHeight: 21, textTransform: 'capitalize' },
    factor: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
    delta: { width: 30, fontFamily: t.fonts.bodyBold, fontSize: 13 },
    event: { flexDirection: 'row', gap: space(3), paddingVertical: space(1.5) },
    eventDate: { width: 52, fontFamily: t.fonts.bodyBold },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    gridHead: { width: `${100 / 7}%`, textAlign: 'center', fontFamily: t.fonts.bodyBold, fontSize: 11, color: t.colors.textDim, paddingBottom: space(2) },
    gridCell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2, alignItems: 'center', justifyContent: 'center' },
    gridDay: { position: 'absolute', top: 2, left: 2, right: 2, bottom: 2, borderRadius: 10 },
    gridNum: { fontFamily: t.fonts.bodySemi, fontSize: 13, color: t.colors.text },
  });
