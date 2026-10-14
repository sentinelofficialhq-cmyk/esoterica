import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, type Href } from 'expo-router';
import { useState, type ComponentType } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { ModeId } from '@/ai/modes';
import { startConversation } from '@/ai/start';
import { ANIMAL_GLYPHS } from '@/content/chineseSigns';
import { energyFor } from '@/engines/timing';
import { sunSign } from '@/engines/western';
import { monthLong, parseYMD, todayLocal, weekdayLong } from '@/lib/date';
import { needsBackup, useHasUserData } from '@/store/backup';
import { exportBackup } from '@/store/backupActions';
import { useProfile } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { EnergyDial, EnergyOrb, EnergyRing } from '@/ui/Energy';
import { IconButton } from '@/ui/IconButton';
import {
  BookIcon,
  ChartIcon,
  DateCheckIcon,
  DreamIcon,
  EyeIcon,
  FamilyIcon,
  GearIcon,
  ImagineIcon,
  MandalaIcon,
  MatchIcon,
  MoonIcon,
  QuizIcon,
  ScriptureIcon,
  SendIcon,
  ShadowIcon,
  SparkleIcon,
  StarIcon,
  SyncIcon,
} from '@/ui/icons';
import { Numeral } from '@/ui/Numeral';
import { Screen, TAB_BAR_SPACE } from '@/ui/Screen';
import type { Theme, ToolKey } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { Tile } from '@/ui/Tile';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

type Tool = { key: ToolKey; label: string; icon?: ComponentType<{ size?: number; color?: string }>; glyph?: string; href: Href };

const TOOLS: Tool[] = [
  { key: 'compat', label: 'Compatibility', icon: MatchIcon, href: '/match' },
  { key: 'date', label: 'Date check', icon: DateCheckIcon, href: { pathname: '/calculator', params: { pick: '1' } } },
  { key: 'neville', label: 'Neville AI', icon: ImagineIcon, href: { pathname: '/ask', params: { guide: 'neville' } } },
  { key: 'letters', label: 'Letterology', glyph: 'ABC', href: '/name-reading' },
  { key: 'forecast', label: 'Forecasts', icon: ChartIcon, href: '/calendar' },
  { key: 'readings', label: 'Readings', icon: BookIcon, href: '/readings' },
  { key: 'dreams', label: 'Dreams', icon: DreamIcon, href: '/dreams' },
  { key: 'shadow', label: 'Shadow work', icon: ShadowIcon, href: '/shadow' },
  { key: 'imagine', label: 'Imagination', icon: EyeIcon, href: '/imagine' },
  { key: 'scripture', label: 'Mind & Scripture', icon: ScriptureIcon, href: { pathname: '/learn', params: { group: 'Mind & Scripture' } } },
  { key: 'inner', label: 'Inner work', icon: MandalaIcon, href: '/inner' },
  { key: 'family', label: 'Family', icon: FamilyIcon, href: '/family' },
  { key: 'bestDate', label: 'Best date', icon: StarIcon, href: '/best-date' },
  { key: 'quizzes', label: 'Quizzes', icon: QuizIcon, href: '/quiz-types' },
  { key: 'sync', label: 'Synchronicity', icon: SyncIcon, href: '/synchronicity' },
  { key: 'learn', label: 'Learn', icon: BookIcon, href: '/learn' },
];

const SUGGESTIONS: { q: string; mode: ModeId; icon: ComponentType<{ size?: number; color?: string }>; tone: 'teal' | 'violet' | 'accent' }[] = [
  { q: 'What are my strongest days this month?', mode: 'timing', icon: ChartIcon, tone: 'teal' },
  { q: 'What is my shadow trying to show me?', mode: 'shadow', icon: ShadowIcon, tone: 'violet' },
  { q: 'When should I start something new?', mode: 'timing', icon: DateCheckIcon, tone: 'accent' },
];

const ask = (q: string, mode: ModeId = 'general') => {
  const question = q.trim();
  if (!question) return;
  const id = startConversation({ mode });
  router.push({ pathname: '/chat', params: { id, q: question } });
};

export default function HomeTab() {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const profile = useProfile();
  const hasData = useHasUserData();
  const lastBackupAt = useSettingsStore((st) => st.lastBackupAt);
  if (!profile) return <Redirect href="/onboarding" />;

  const today = todayLocal();
  const e = energyFor(profile, today);
  const season = sunSign(today).sign;
  const animalGlyph = ANIMAL_GLYPHS[profile.chinese.animal];

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <Header name={profile.name} today={today} universal={e.universalDayDisplay.split('/').pop() ?? ''} season={season} moon={e.moon} glyph={animalGlyph} />

      {t.shape.layout === 'split' ? (
        <View style={s.heroRow}>
          <JungCard />
          <Card style={s.dialCard} onPress={() => router.push('/calendar')} accessibilityLabel="Your energy today">
            <EnergyDial score={e.score} label={e.label} lifePath={profile.lifePath.value} animalGlyph={animalGlyph} signGlyph={profile.western.glyph} />
            <View style={s.dialButton}>
              <Txt variant="small" color={t.colors.text} style={s.bold}>
                Your energy
              </Txt>
            </View>
          </Card>
        </View>
      ) : (
        <>
          <Card style={s.wideCard} onPress={() => router.push('/calendar')} accessibilityLabel="Your energy today">
            {t.id === 'nebula' ? (
              <View style={s.wideRow}>
                <EnergyOrb score={e.score} label={e.label} />
                <View style={s.flex}>
                  <Txt variant="label">Today’s energy</Txt>
                  <System mark={String(profile.lifePath.value)} text="Life Path" tint={t.colors.violetSoft} />
                  <System mark={ANIMAL_GLYPHS[e.dayAnimal]} text={`${e.dayAnimal} day`} tint={t.colors.dangerSoft} />
                  <System mark={profile.western.glyph} text={profile.western.sign} tint={t.colors.goldSoft} />
                </View>
              </View>
            ) : (
              <>
                <View style={s.wideRow}>
                  <View style={s.flex}>
                    <Txt variant="label">Your energy today</Txt>
                    <View style={s.scoreRow}>
                      <Numeral value={e.score} size={70} align="left" label={`Energy ${e.score}`} />
                      <Txt variant="title" italic>
                        {e.label}
                      </Txt>
                    </View>
                    <Txt variant="small">{`${e.dayAnimal} day · Personal day ${e.personalDayDisplay}`}</Txt>
                  </View>
                  <EnergyRing score={e.score} />
                </View>
                <View style={[s.rule, { backgroundColor: t.colors.border }]} />
                <View style={s.systems}>
                  <Fact big={String(profile.lifePath.value)} small="Life Path" />
                  <Fact big={animalGlyph} small={`${profile.chinese.element} ${profile.chinese.animal}`} divided />
                  <Fact big={profile.western.glyph} small={profile.western.sign} />
                </View>
              </>
            )}
          </Card>
          <JungBanner />
        </>
      )}

      <ToolGrid />

      <AskBar />

      {needsBackup(lastBackupAt, today, hasData) ? (
        <Card>
          <Txt variant="label">Back up Esoterica</Txt>
          <Txt variant="small">{`${lastBackupAt ? 'Your last backup was over a week ago.' : 'You haven’t saved a backup yet.'} Everything lives only on this phone.`}</Txt>
          <Button label="Back up now" variant="subtle" small onPress={() => exportBackup().catch(() => router.push('/settings'))} />
        </Card>
      ) : null}
    </Screen>
  );
}

function Header({ name, today, universal, season, moon, glyph }: { name: string; today: string; universal: string; season: string; moon: string; glyph: string }) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const { m, d } = parseYMD(today);
  const hour = new Date().getHours();
  const part = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const first = name || 'friend';
  const avatar = (
    <View style={[s.avatar, { borderColor: t.colors.accentBorder, backgroundColor: t.colors.accentSoft }]}>
      <Text style={[s.avatarGlyph, { color: t.colors.glyph }]}>{glyph}</Text>
    </View>
  );

  if (t.id === 'gilded') {
    return (
      <View style={s.headerRow}>
        <View style={[s.flex, s.headerText]}>
          <Txt variant="label">{`${weekdayLong(today)} · ${d} ${monthLong(m)}`}</Txt>
          <Txt variant="title">
            {`Good ${part}, `}
            <Txt variant="title" italic color={t.colors.accentBright}>
              {first}
            </Txt>
          </Txt>
          <Txt variant="small">{`Universal Day ${universal} · ${season} season · ${moon}`}</Txt>
        </View>
        {avatar}
      </View>
    );
  }
  return (
    <View style={s.headerRow}>
      {avatar}
      <View style={[s.flex, s.headerText]}>
        <Txt variant="heading" style={s.greeting}>{`${t.id === 'nebula' ? 'Hi' : 'Hello'}, ${first}`}</Txt>
        {t.id === 'nebula' ? (
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
      {t.id === 'ember' ? (
        <IconButton label={`Moon: ${moon}`} onPress={() => router.push('/calendar')}>
          <MoonIcon size={20} color={t.colors.accentBright} />
        </IconButton>
      ) : null}
      <IconButton label="Settings" onPress={() => router.push('/settings')}>
        <GearIcon size={20} />
      </IconButton>
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

function System({ mark, text, tint }: { mark: string; text: string; tint: string }) {
  const s = useStyles(makeStyles);
  return (
    <View style={s.systemRow}>
      <View style={[s.systemMark, { backgroundColor: tint }]}>
        <Txt variant="body" style={s.bold}>
          {mark}
        </Txt>
      </View>
      <Txt variant="body" style={s.bold}>
        {text}
      </Txt>
    </View>
  );
}

function Fact({ big, small, divided }: { big: string; small: string; divided?: boolean }) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  return (
    <View style={[s.fact, divided && { borderLeftWidth: 1, borderRightWidth: 1, borderColor: t.colors.border }]}>
      <Txt variant="heading" color={t.colors.accentBright}>
        {big}
      </Txt>
      <Txt variant="label" color={t.colors.textDim} center>
        {small}
      </Txt>
    </View>
  );
}

/** The mandala emblem used for Jung. */
function JungMark({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round">
      <Circle cx={36} cy={36} r={30} strokeOpacity={0.55} />
      <Circle cx={36} cy={36} r={21} />
      <Rect x={24} y={24} width={24} height={24} transform="rotate(45 36 36)" strokeOpacity={0.8} />
      <Rect x={24} y={24} width={24} height={24} />
      <Circle cx={36} cy={36} r={5} fill={color} />
      <Path d="M36 2v6M36 64v6M2 36h6M64 36h6M12 12l4 4M56 56l4 4M60 12l-4 4M12 60l4-4" strokeOpacity={0.7} />
    </Svg>
  );
}

function JungCard() {
  const t = useTheme();
  const s = useStyles(makeStyles);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Ask Jung AI anything" onPress={() => router.push('/ask')} style={({ pressed }) => [s.flex, pressed && s.pressed]}>
      <LinearGradient colors={t.gradients.hero} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={s.jungCard}>
        <Text style={s.jungBadge}>AI GUIDE</Text>
        <JungMark size={70} color="#FFF4E6" />
        <Text style={s.jungTitle}>Jung AI</Text>
        <View style={s.jungButton}>
          <Text style={s.jungButtonText}>Ask me anything</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function JungBanner() {
  const t = useTheme();
  const s = useStyles(makeStyles);
  return (
    <Card tone="featured" onPress={() => router.push('/ask')} style={s.banner} accessibilityLabel="Ask Jung AI">
      <JungMark size={50} color={t.id === 'nebula' ? t.colors.accentBright : t.colors.accent} />
      <View style={s.flex}>
        {t.id === 'gilded' ? (
          <Txt variant="heading">
            {'Ask '}
            <Txt variant="heading" italic color={t.colors.accentBright}>
              C.G. Jung
            </Txt>
          </Txt>
        ) : (
          <Txt variant="heading">Jung AI</Txt>
        )}
        <Txt variant="small">{t.id === 'nebula' ? '“What would you like to understand today?”' : 'An AI guide modeled on Jung’s writings'}</Txt>
      </View>
      <View style={[s.bannerGo, { backgroundColor: t.id === 'nebula' ? '#FFFFFF' : t.colors.accent }]}>
        <Text style={[s.bannerGoText, { color: t.colors.onAccent }]}>{t.id === 'nebula' ? 'Ask' : '→'}</Text>
      </View>
    </Card>
  );
}

function ToolGrid() {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const pages = [TOOLS.slice(0, 8), TOOLS.slice(8, 16)].filter((p) => p.length);
  return (
    <View onLayout={(ev) => setWidth(ev.nativeEvent.layout.width)} style={s.gridWrap}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(ev) => width && setPage(Math.round(ev.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={32}>
        {pages.map((tools, i) => (
          <View key={i} style={[s.grid, { width: width || undefined }]}>
            {tools.map((tool) => (
              <View key={tool.key} style={s.cell}>
                <Tile label={tool.label} tool={tool.key} icon={tool.icon} glyph={tool.glyph && t.id === 'gilded' ? 'Aa' : tool.glyph} onPress={() => router.push(tool.href)} />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <View style={s.dots} accessibilityElementsHidden>
        {pages.map((_, i) => (
          <View key={i} style={[s.dot, i === page && s.dotOn]} />
        ))}
      </View>
    </View>
  );
}

function AskBar() {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const [text, setText] = useState('');
  const tones = { teal: t.colors.teal, violet: t.colors.violet, accent: t.colors.accentBright };
  return (
    <Card style={s.askCard}>
      <View style={s.askRow}>
        <View style={[s.askSpark, { backgroundColor: t.colors.accentSoft, borderColor: t.colors.accentBorder }]}>
          <SparkleIcon size={20} color={t.colors.accentBright} />
        </View>
        <View style={[s.askInputWrap, { borderColor: t.colors.border }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Ask Jung anything…"
            placeholderTextColor={t.colors.textDim}
            selectionColor={t.colors.accent}
            onSubmitEditing={() => ask(text)}
            accessibilityLabel="Ask Jung anything"
            style={s.askInput}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={() => ask(text)} disabled={!text.trim()} style={({ pressed }) => [pressed && s.pressed]}>
            <LinearGradient colors={t.gradients.cta} style={[s.send, !text.trim() && s.sendOff]}>
              <SendIcon size={18} color={t.colors.onAccent} />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.suggestions}>
        {SUGGESTIONS.map((sg) => (
          <Pressable key={sg.q} accessibilityRole="button" onPress={() => ask(sg.q, sg.mode)} style={({ pressed }) => [s.suggestion, pressed && s.pressed]}>
            <sg.icon size={20} color={tones[sg.tone]} />
            <Txt variant="small" color={t.colors.text} style={s.bold}>
              {sg.q}
            </Txt>
          </Pressable>
        ))}
      </ScrollView>
    </Card>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    bold: { fontFamily: t.fonts.bodyBold },
    pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
    headerText: { gap: 2 },
    greeting: { fontSize: 21, lineHeight: 26 },
    avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    avatarGlyph: { fontSize: 23 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space(1.5), marginTop: 2 },
    pill: { borderRadius: 999, paddingHorizontal: space(2.5), paddingVertical: 2 },
    pillText: { color: t.colors.text, fontFamily: t.fonts.bodyBold, fontSize: 11.5 },
    heroRow: { flexDirection: 'row', gap: space(3) },
    jungCard: {
      height: 206,
      borderRadius: t.shape.cardRadius + 2,
      padding: space(3.5),
      paddingBottom: space(3),
      alignItems: 'center',
      gap: space(1.5),
      borderWidth: 1,
      borderColor: 'rgba(255,214,160,0.35)',
      shadowColor: t.colors.accent,
      shadowOpacity: 0.4,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    },
    jungBadge: {
      alignSelf: 'flex-start',
      fontFamily: t.fonts.bodyHeavy,
      fontSize: 10,
      letterSpacing: 1.6,
      color: '#FFF4E6',
      backgroundColor: 'rgba(40,12,0,0.32)',
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 999,
      overflow: 'hidden',
    },
    jungTitle: { fontFamily: t.fonts.displayBold, fontSize: 19, color: '#1E0B00' },
    jungButton: {
      marginTop: 'auto',
      alignSelf: 'stretch',
      height: 38,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255,236,214,0.55)',
      backgroundColor: 'rgba(40,12,0,0.34)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    jungButtonText: { fontFamily: t.fonts.bodyBold, fontSize: 13, color: '#FFF4E6' },
    dialCard: { flex: 1, height: 206, alignItems: 'center', paddingTop: space(2.5), paddingBottom: space(3), gap: 0 },
    dialButton: {
      marginTop: 'auto',
      alignSelf: 'stretch',
      height: 38,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.cardHi,
      alignItems: 'center',
      justifyContent: 'center',
    },
    wideCard: { gap: space(3.5), padding: space(4.5) },
    wideRow: { flexDirection: 'row', alignItems: 'center', gap: space(4) },
    scoreRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space(2) },
    rule: { height: 1 },
    systems: { flexDirection: 'row' },
    fact: { flex: 1, alignItems: 'center', gap: 2 },
    systemRow: { flexDirection: 'row', alignItems: 'center', gap: space(2), marginTop: space(2) },
    systemMark: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    banner: { flexDirection: 'row', alignItems: 'center', gap: space(3.5), paddingVertical: space(3) },
    bannerGo: { minWidth: 40, height: 38, borderRadius: 19, paddingHorizontal: space(3), alignItems: 'center', justifyContent: 'center' },
    bannerGoText: { fontFamily: t.fonts.bodyBold, fontSize: 15 },
    gridWrap: { gap: space(3) },
    grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space(4) },
    cell: { width: '25%' },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: t.colors.borderHi },
    dotOn: { width: 18, backgroundColor: t.colors.accentBright },
    askCard: { padding: space(3.5), gap: space(3), borderRadius: t.shape.cardRadius + 4 },
    askRow: { flexDirection: 'row', alignItems: 'center', gap: space(2.5) },
    askSpark: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    askInputWrap: {
      flex: 1,
      height: 50,
      borderRadius: 25,
      borderWidth: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: space(4),
      paddingRight: 6,
    },
    askInput: { flex: 1, minWidth: 0, fontFamily: t.id === 'gilded' ? t.fonts.displayItalic : t.fonts.bodyMedium, fontSize: t.id === 'gilded' ? 18 : 15, color: t.colors.text },
    send: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    sendOff: { opacity: 0.5 },
    suggestions: { gap: space(2.5) },
    suggestion: {
      width: 160,
      height: 88,
      borderRadius: 20,
      padding: space(3),
      justifyContent: 'space-between',
      backgroundColor: t.colors.cardHi,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
  });
