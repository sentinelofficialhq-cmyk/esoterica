import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { topSymbols } from '@/jung/dreams';
import { useJourney } from '@/jung/useJourney';
import { useTodaysPrompt } from '@/jung/useTodaysPrompt';
import { formatDate } from '@/lib/date';
import { useJournalStore } from '@/store/journalStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { ChevronRightIcon } from '@/ui/icons';
import { Mandala } from '@/ui/Mandala';
import { PsycheCard } from '@/ui/PsycheCard';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { Accent, Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

const count = (n: number, one: string, many = `${one}s`) => (n === 0 ? `No ${many} yet` : `${n} ${n === 1 ? one : many}`);

export default function InnerTab() {
  const { colors } = useTheme();
  const journey = useJourney();
  const prompt = useTodaysPrompt();
  const dreams = useJournalStore((s) => s.dreams);
  const shadowEntries = useJournalStore((s) => s.shadowEntries.length);
  const projections = useJournalStore((s) => s.projections.length);
  const synchronicities = useJournalStore((s) => s.synchronicities.length);
  const motifs = topSymbols(dreams).slice(0, 6);
  const stage = journey.stages.find((s) => s.id === journey.currentStage);
  const next = stage?.items.find((i) => !i.done);

  const tools: { label: string; caption: string; href: Href }[] = [
    { label: 'Log a dream', caption: count(dreams.length, 'dream'), href: '/dream' },
    { label: 'Shadow journal', caption: count(shadowEntries, 'entry', 'entries'), href: '/shadow' },
    { label: 'Projection check', caption: count(projections, 'check'), href: '/projection' },
    { label: 'Synchronicity', caption: count(synchronicities, 'moment'), href: '/synchronicity' },
    { label: 'Active imagination', caption: 'A guided dialogue with an inner figure', href: '/active-imagination' },
  ];

  return (
    <Screen header={<ScreenHeader title="Inner work" />}>
      <View style={styles.head}>
        <SectionLabel>Inner work</SectionLabel>
        <Txt variant="title">
          Meet the <Accent>rest of you</Accent>
        </Txt>
      </View>

      <Card style={styles.journey}>
        <Mandala stages={journey.stages} size={200} surface={colors.cardSolid} />
        <Txt variant="label">{`Individuation · ${journey.percent}%`}</Txt>
        <Txt variant="heading" center>
          {stage ? `You are in the ${stage.name} stage` : 'Every stage walked'}
        </Txt>
        <Txt variant="small" center>
          {stage ? stage.summary : 'The work is never finished, only deepened.'}
        </Txt>
        {next ? <Button label={`Next: ${next.label}`} small style={styles.wide} onPress={() => router.push(next.href as Href)} /> : null}
        <Button label="See the full map" variant="ghost" small style={styles.wide} onPress={() => router.push('/journey')} />
      </Card>

      <Card tone="violet" onPress={() => router.push('/shadow')}>
        <Txt variant="label" color={colors.violet}>
          Today’s shadow prompt
        </Txt>
        <Txt variant="heading">{prompt.text}</Txt>
        <Txt variant="small" color={colors.text}>
          Tap to write your answer.
        </Txt>
      </Card>

      <SectionLabel>Tools</SectionLabel>
      <View style={styles.grid}>
        {tools.map((t) => (
          <Card key={t.label} onPress={() => router.push(t.href)} style={styles.tile}>
            <Txt variant="body">{t.label}</Txt>
            <Txt variant="small">{t.caption}</Txt>
          </Card>
        ))}
      </View>

      <PsycheCard />

      <Card>
        <Txt variant="label">Recent dreams</Txt>
        {dreams.length === 0 ? (
          <Txt variant="small">Write a dream down as soon as you wake, even a fragment. Esoterica tracks the symbols that keep returning.</Txt>
        ) : null}
        {motifs.length ? (
          <View style={styles.chips}>
            {motifs.map(([sym, n]) => (
              <Chip key={sym} label={`${sym} · ${n}`} />
            ))}
          </View>
        ) : null}
        {dreams.slice(0, 3).map((d) => (
          <Card key={d.id} onPress={() => router.push({ pathname: '/dream', params: { id: d.id } })} style={styles.dream}>
            <View style={styles.flex}>
              <Txt variant="body" numberOfLines={1}>
                {d.title || 'Untitled dream'}
              </Txt>
              <Txt variant="small">{formatDate(d.date)}</Txt>
            </View>
            <ChevronRightIcon />
          </Card>
        ))}
        <Button
          label={dreams.length ? 'Open dream journal' : 'Log your first dream'}
          variant="subtle"
          small
          onPress={() => router.push(dreams.length ? '/dreams' : '/dream')}
        />
      </Card>

      <Card onPress={() => router.push('/learn')} style={styles.dream}>
        <View style={styles.flex}>
          <Txt variant="body">Jung’s ideas, explained</Txt>
          <Txt variant="small">Types, archetypes, shadow, synchronicity and more</Txt>
        </View>
        <ChevronRightIcon />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: space(2) },
  journey: { alignItems: 'center', gap: space(2) },
  wide: { alignSelf: 'stretch' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(3) },
  tile: { flexBasis: '45%', flexGrow: 1, minHeight: 84 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  dream: { flexDirection: 'row', alignItems: 'center', gap: space(3), paddingVertical: space(3) },
  flex: { flex: 1 },
});
