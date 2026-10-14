import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { ANIMAL_GLYPHS } from '@/content/chineseSigns';
import type { Profile } from '@/engines/profile';
import type { DayEnergy } from '@/engines/timing';
import { Card } from '@/ui/Card';
import { EnergyDial, EnergyOrb, EnergyRing } from '@/ui/Energy';
import { Numeral } from '@/ui/Numeral';
import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { solidFill, space } from '@/ui/theme';

type Props = { profile: Profile; e: DayEnergy };

/** The 'split' hero: the Jung card beside the energy dial. */
export function SplitHero({ profile, e }: Props) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  return (
    <View style={s.heroRow}>
      <JungCard />
      <Card style={s.dialCard} onPress={() => router.push('/calendar')} accessibilityLabel="Your energy today">
        <EnergyDial score={e.score} label={e.label} lifePath={profile.lifePath.value} animalGlyph={ANIMAL_GLYPHS[profile.chinese.animal]} signGlyph={profile.western.glyph} />
        <View style={s.dialButton}>
          <Txt variant="small" color={t.colors.text} style={s.bold}>
            Your energy
          </Txt>
        </View>
      </Card>
    </View>
  );
}

/** The 'wide' hero: one energy card (the ring with three facts, or the orb with three systems), then the Jung banner. */
export function WideHero({ profile, e }: Props) {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const animalGlyph = ANIMAL_GLYPHS[profile.chinese.animal];
  return (
    <>
      <Card style={s.wideCard} onPress={() => router.push('/calendar')} accessibilityLabel="Your energy today">
        {t.shape.energy === 'orb' ? (
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
  const solid = solidFill(t.gradients.hero);
  const content = (
    <>
      <Text style={s.jungBadge}>AI GUIDE</Text>
      <JungMark size={70} color={t.colors.onHero} />
      <Text style={s.jungTitle}>Jung AI</Text>
      <View style={s.jungButton}>
        <Text style={s.jungButtonText}>Ask me anything</Text>
      </View>
    </>
  );
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Ask Jung AI anything" onPress={() => router.push('/ask')} style={({ pressed }) => [s.flex, pressed && s.pressed]}>
      {solid ? (
        <View style={[s.jungCard, { backgroundColor: solid }]}>{content}</View>
      ) : (
        <LinearGradient colors={t.gradients.hero} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={s.jungCard}>
          {content}
        </LinearGradient>
      )}
    </Pressable>
  );
}

/** Banner copy in the look's voice. */
const BANNER: Record<Theme['shape']['voice'], { title: string; accent?: string; subtitle: string; go: string }> = {
  warm: { title: 'Jung AI', subtitle: 'An AI guide modeled on Jung’s writings', go: '→' },
  formal: { title: 'Ask ', accent: 'C.G. Jung', subtitle: 'An AI guide modeled on Jung’s writings', go: '→' },
  playful: { title: 'Jung AI', subtitle: '“What would you like to understand today?”', go: 'Ask' },
};

function JungBanner() {
  const t = useTheme();
  const s = useStyles(makeStyles);
  const copy = BANNER[t.shape.voice];
  return (
    <Card tone="featured" onPress={() => router.push('/ask')} style={s.banner} accessibilityLabel="Ask Jung AI">
      <JungMark size={50} color={t.colors.emblem} />
      <View style={s.flex}>
        <Txt variant="heading">
          {copy.title}
          {copy.accent ? (
            <Txt variant="heading" italic color={t.colors.accentBright}>
              {copy.accent}
            </Txt>
          ) : null}
        </Txt>
        <Txt variant="small">{copy.subtitle}</Txt>
      </View>
      <View style={[s.bannerGo, { backgroundColor: t.colors.bannerGo }]}>
        <Text style={[s.bannerGoText, { color: t.colors.onBannerGo }]}>{copy.go}</Text>
      </View>
    </Card>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    bold: { ...t.fonts.bodyBold },
    pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
    heroRow: { flexDirection: 'row', gap: space(3) },
    jungCard: {
      height: 206,
      borderRadius: t.shape.cardRadius + 2,
      padding: space(3.5),
      paddingBottom: space(3),
      alignItems: 'center',
      gap: space(1.5),
      borderWidth: 1,
      borderColor: t.colors.heroBorder,
      // A glow dropped below the card.
      ...(t.shadows.hero
        ? { shadowColor: t.shadows.hero.color, shadowOpacity: t.shadows.hero.opacity, shadowRadius: t.shadows.hero.radius, shadowOffset: { width: 0, height: t.shadows.hero.y } }
        : null),
    },
    jungBadge: {
      alignSelf: 'flex-start',
      ...t.fonts.bodyHeavy,
      fontSize: 10,
      letterSpacing: 1.6,
      color: t.colors.onHero,
      backgroundColor: t.colors.heroChip,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 999,
      overflow: 'hidden',
    },
    jungTitle: { ...t.fonts.displayBold, fontSize: 19, color: t.colors.onHeroStrong },
    jungButton: {
      marginTop: 'auto',
      alignSelf: 'stretch',
      height: 38,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.colors.heroButtonBorder,
      backgroundColor: t.colors.heroButton,
      alignItems: 'center',
      justifyContent: 'center',
    },
    jungButtonText: { ...t.fonts.bodyBold, fontSize: 13, color: t.colors.onHero },
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
    bannerGoText: { ...t.fonts.bodyBold, fontSize: 15 },
  });
