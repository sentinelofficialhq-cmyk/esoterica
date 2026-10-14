import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { NEVILLE_PRACTICES, practiceById, type PracticeId } from '@/content/neville';
import { quoteOf, verseOfDay } from '@/content/scripture';
import { personalDay } from '@/engines/numerology';
import { formatDate, todayLocal } from '@/lib/date';
import { useImaginationStore } from '@/store/imaginationStore';
import { useProfile } from '@/store/profileStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { EmptyState } from '@/ui/EmptyState';
import { ImagineIcon, ScriptureIcon } from '@/ui/icons';
import { LinkRow } from '@/ui/LinkRow';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { useTheme } from '@/ui/ThemeProvider';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

/** Evening → revision; morning → living in the end; otherwise a minute of "I AM". */
const suggestionFor = (hour: number): { id: PracticeId; when: string } =>
  hour >= 19 || hour < 4 ? { id: 'revision', when: 'Tonight' } : hour < 12 ? { id: 'end', when: 'This morning' } : { id: 'iam', when: 'Right now' };

export default function Imagine() {
  const t = useTheme();
  const profile = useProfile();
  const aims = useImaginationStore((s) => s.aims);
  const sessions = useImaginationStore((s) => s.sessions);
  const today = todayLocal();
  const suggestion = suggestionFor(new Date().getHours());
  const practice = practiceById(suggestion.id)!;
  const verse = verseOfDay(today, profile ? personalDay(profile.birthDate, today).value : 1);
  const open = aims.filter((a) => a.status === 'open');
  const closed = aims.filter((a) => a.status !== 'open');

  return (
    <Screen header={<ScreenHeader title="Imagination" />}>
      <Txt variant="bodyDim">
        Neville Goddard taught that imagination creates reality: assume the feeling of your wish fulfilled, and live from it. These are inner
        practices for focus and reflection. Pair them with real action, and never let them stand in for care you need.
      </Txt>

      <Card tone="featured">
        <Txt variant="label" color={t.colors.accentBright}>
          {suggestion.when}
        </Txt>
        <Txt variant="heading">{practice.title}</Txt>
        <Txt variant="small">{practice.short}</Txt>
        <Button label="Begin" onPress={() => router.push({ pathname: '/practice', params: { kind: practice.id } })} />
      </Card>

      <Card>
        <Txt variant="label">Verse for today</Txt>
        <Txt variant="heading" italic>{`“${quoteOf(verse)}”`}</Txt>
        <Txt variant="small" color={t.colors.text}>{`${verse.ref} · King James Version`}</Txt>
        <Txt variant="bodyDim">{verse.reading}</Txt>
      </Card>

      <View style={styles.group}>
        <SectionLabel>Your aims</SectionLabel>
        {open.length === 0 ? (
          <EmptyState title="No aims yet" body="An aim is something you want, plus a short scene that would only happen if it were already done." />
        ) : (
          open.map((aim) => {
            const count = sessions.filter((x) => x.aimId === aim.id).length;
            return (
              <Card key={aim.id} onPress={() => router.push({ pathname: '/aim', params: { id: aim.id } })} accessibilityLabel={aim.title}>
                <Txt variant="heading">{aim.title}</Txt>
                <Txt variant="small" numberOfLines={2}>{`Scene: ${aim.scene}`}</Txt>
                <Txt variant="small" color={t.colors.text}>{`${count} session${count === 1 ? '' : 's'} · since ${formatDate(aim.createdAt)}`}</Txt>
              </Card>
            );
          })
        )}
        <Button label="New aim" variant="subtle" onPress={() => router.push('/aim')} />
      </View>

      <View style={styles.group}>
        <SectionLabel>Practices</SectionLabel>
        {NEVILLE_PRACTICES.map((p) => (
          <Card key={p.id} onPress={() => router.push({ pathname: '/practice', params: { kind: p.id } })} accessibilityLabel={p.title}>
            <View style={styles.row}>
              <Txt variant="heading" style={styles.flex}>
                {p.title}
              </Txt>
              {p.minutes ? <Chip label={`${p.minutes} min`} /> : null}
            </View>
            <Txt variant="small">{p.short}</Txt>
            <Txt variant="small" color={t.colors.text}>
              {p.when}
            </Txt>
          </Card>
        ))}
      </View>

      <View style={styles.group}>
        <SectionLabel>Go deeper</SectionLabel>
        <LinkRow label="Talk it through with Neville" caption="An AI guide modeled on Neville Goddard’s lectures" href={{ pathname: '/ask', params: { guide: 'neville' } }} icon={ImagineIcon} />
        <LinkRow label="Mind & Scripture" caption="Neville’s teaching and the mystical verses" href={{ pathname: '/learn', params: { group: 'Mind & Scripture' } }} icon={ScriptureIcon} />
      </View>

      {sessions.length ? (
        <View style={styles.group}>
          <SectionLabel>Recent practice</SectionLabel>
          {sessions.slice(0, 5).map((x) => (
            <Card key={x.id}>
              <View style={styles.row}>
                <Txt variant="body" style={[styles.flex, t.fonts.bodyBold]}>
                  {practiceById(x.kind)?.title ?? x.kind}
                </Txt>
                <Txt variant="small">{formatDate(x.date)}</Txt>
              </View>
              {x.text ? (
                <Txt variant="small" numberOfLines={3}>
                  {x.text}
                </Txt>
              ) : null}
            </Card>
          ))}
        </View>
      ) : null}

      {closed.length ? (
        <View style={styles.group}>
          <SectionLabel>Fulfilled and released</SectionLabel>
          {closed.map((aim) => (
            <Card key={aim.id} onPress={() => router.push({ pathname: '/aim', params: { id: aim.id } })} accessibilityLabel={aim.title}>
              <View style={styles.row}>
                <Txt variant="body" style={styles.flex}>
                  {aim.title}
                </Txt>
                <Chip label={aim.status === 'fulfilled' ? 'Fulfilled' : 'Released'} tone={aim.status === 'fulfilled' ? 'teal' : 'default'} />
              </View>
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: space(2) },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  flex: { flex: 1 },
});
