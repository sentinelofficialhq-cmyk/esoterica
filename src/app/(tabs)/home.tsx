import { Redirect } from 'expo-router';
import { StyleSheet } from 'react-native';

import { dayNotes } from '@/content/dayNotes';
import { energyFor } from '@/engines/timing';
import { todayLocal } from '@/lib/date';
import { useProfile } from '@/store/profileStore';
import { AskBar, CalmAsk, EditorialAsk } from '@/ui/home/Ask';
import { BackupCard } from '@/ui/home/BackupCard';
import { HomeHeader } from '@/ui/home/Header';
import { SplitHero, WideHero } from '@/ui/home/Hero';
import { CalmToday, EditorialToday } from '@/ui/home/Today';
import { ToolGrid, ToolRow } from '@/ui/home/Tools';
import { Screen, useTabBarSpace } from '@/ui/Screen';
import { useTheme } from '@/ui/ThemeProvider';
import { space } from '@/ui/theme';

/**
 * Home, composed by the look's `shape.layout`:
 * - split / wide (the originals): header, the energy hero (with the Jung card or banner), the tool grid, Ask.
 * - calm / editorial (the new looks): header, today's energy and notes, Ask, four tools. No Jung card.
 */
export default function HomeTab() {
  const t = useTheme();
  const profile = useProfile();
  const tabSpace = useTabBarSpace();
  if (!profile) return <Redirect href="/onboarding" />;

  const today = todayLocal();
  const e = energyFor(profile, today);
  const { layout } = t.shape;

  if (layout === 'calm' || layout === 'editorial') {
    const notes = dayNotes(e);
    const editorial = layout === 'editorial';
    return (
      <Screen bottomInset={tabSpace} contentStyle={editorial ? styles.editorial : styles.calm}>
        <HomeHeader profile={profile} e={e} today={today} />
        {editorial ? <EditorialToday e={e} notes={notes} /> : <CalmToday e={e} notes={notes} />}
        {editorial ? <EditorialAsk /> : <CalmAsk />}
        <ToolRow style={editorial && styles.afterAsk} />
        <BackupCard today={today} style={editorial && styles.afterTools} />
      </Screen>
    );
  }

  return (
    <Screen bottomInset={tabSpace}>
      <HomeHeader profile={profile} e={e} today={today} />
      {layout === 'split' ? <SplitHero profile={profile} e={e} /> : <WideHero profile={profile} e={e} />}
      <ToolGrid />
      <AskBar />
      <BackupCard today={today} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Calm: the usual gutter with a tighter rhythm.
  calm: { gap: space(3) },
  // Editorial: a wider gutter; sections set their own spacing around the hairlines.
  editorial: { paddingHorizontal: space(6), gap: 0 },
  afterAsk: { marginTop: 6 },
  afterTools: { marginTop: space(4) },
});
