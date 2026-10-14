import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ANIMAL_GLYPHS } from '@/content/chineseSigns';
import { useProfile } from '@/store/profileStore';
import { Card } from '@/ui/Card';
import {
  BookIcon,
  ChartIcon,
  DreamIcon,
  FamilyIcon,
  GearIcon,
  ImagineIcon,
  MandalaIcon,
  MatchIcon,
  QuizIcon,
  ShadowIcon,
  SparkIcon,
  StarIcon,
  SyncIcon,
  EyeIcon,
  ScriptureIcon,
} from '@/ui/icons';
import { JourneyCard } from '@/ui/JourneyCard';
import { LinkRow } from '@/ui/LinkRow';
import { PsycheCard } from '@/ui/PsycheCard';
import { Screen, useTabBarSpace } from '@/ui/Screen';
import { SectionLabel } from '@/ui/SectionLabel';
import { useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

export default function MoreTab() {
  const t = useTheme();
  const me = useProfile();
  const tabSpace = useTabBarSpace();
  if (!me) return <Redirect href="/onboarding" />;
  return (
    <Screen bottomInset={tabSpace}>
      <Txt variant="title">More</Txt>

      <Card onPress={() => router.push('/calculator')} style={styles.profile} accessibilityLabel="Your pattern">
        <View style={[styles.avatar, { borderColor: t.colors.accentBorder, backgroundColor: t.colors.accentSoft }]}>
          <Text style={[styles.glyph, { color: t.colors.glyph }]}>{ANIMAL_GLYPHS[me.chinese.animal]}</Text>
        </View>
        <View style={styles.flex}>
          <Txt variant="heading">{me.name || 'You'}</Txt>
          <Txt variant="small">{`Life Path ${me.lifePath.display} · ${me.western.sign} · ${me.chinese.element} ${me.chinese.animal}`}</Txt>
        </View>
      </Card>

      <PsycheCard />
      <JourneyCard />

      <View style={styles.group}>
        <SectionLabel>Your pattern</SectionLabel>
        <LinkRow label="Your full reading" caption="Every system woven together" href={{ pathname: '/reading', params: { type: 'full' } }} icon={StarIcon} />
        <LinkRow label="Saved readings" href="/readings" icon={BookIcon} />
        <LinkRow label="Compatibility" caption="People, places, brands and more" href="/match" icon={MatchIcon} />
        <LinkRow label="Family & circle" href="/family" icon={FamilyIcon} />
        <LinkRow label="Best date finder" href="/best-date" icon={ChartIcon} />
        <LinkRow label="Letterology" caption="The numbers in a name" href="/name-reading" icon={EyeIcon} />
      </View>

      <View style={styles.group}>
        <SectionLabel>Inner work</SectionLabel>
        <LinkRow label="Inner work" caption="Today’s prompt, tools and your journey" href="/inner" icon={MandalaIcon} />
        <LinkRow label="Dream journal" href="/dreams" icon={DreamIcon} />
        <LinkRow label="Shadow work" href="/shadow" icon={ShadowIcon} />
        <LinkRow label="Synchronicity log" href="/synchronicity" icon={SyncIcon} />
        <LinkRow label="Imagination" caption="Neville’s practices, aims and the scene before sleep" href="/imagine" icon={EyeIcon} />
        <LinkRow label="Active imagination" caption="Jung’s guided dialogue with an inner figure" href="/active-imagination" icon={ImagineIcon} />
        <LinkRow label="Quizzes" caption="Types, archetypes, Persona & Self" href="/quiz-types" icon={QuizIcon} />
      </View>

      <View style={styles.group}>
        <SectionLabel>Guides</SectionLabel>
        <LinkRow label="Ask Jung" caption="Your conversations" href="/ask" icon={SparkIcon} />
        <LinkRow label="What your guides remember" href="/memory" icon={BookIcon} />
      </View>

      <View style={styles.group}>
        <SectionLabel>Learn & settings</SectionLabel>
        <LinkRow label="Learn" caption="Numbers, signs, Jung and more" href="/learn" icon={BookIcon} />
        <LinkRow label="Mind & Scripture" caption="Neville Goddard and the mystical verses" href={{ pathname: '/learn', params: { group: 'Mind & Scripture' } }} icon={ScriptureIcon} />
        <LinkRow label="Settings" caption="Appearance, AI key, backups" href="/settings" icon={GearIcon} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: space(3.5) },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontSize: 26 },
  group: { gap: space(2) },
});
