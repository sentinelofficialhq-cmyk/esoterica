import { Redirect, router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LEARN_ARTICLES } from '@/content/learn';
import { ENTITY_KIND } from '@/data/entities';
import { compatibility } from '@/engines/compatibility';
import { allEntities, entityProfile, searchEntities } from '@/engines/matches';
import { buildProfile } from '@/engines/profile';
import { usePeopleStore } from '@/store/peopleStore';
import { useProfile } from '@/store/profileStore';
import { LinkRow } from '@/ui/LinkRow';
import { MatchRow } from '@/ui/MatchRow';
import { Screen, useTabBarSpace } from '@/ui/Screen';
import { SectionLabel } from '@/ui/SectionLabel';
import { TextField } from '@/ui/TextField';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

const TOOLS: { label: string; words: string; href: Href }[] = [
  { label: 'Compatibility', words: 'match love partner friend', href: '/match' },
  { label: 'Date check', words: 'calculator birthday founding any date', href: { pathname: '/calculator', params: { pick: '1' } } },
  { label: 'Letterology', words: 'name letters expression soul urge', href: '/name-reading' },
  { label: 'Ask Jung', words: 'ai chat advice question', href: '/ask' },
  { label: 'Imagination', words: 'neville manifest manifestation scene revision aim imagine', href: '/imagine' },
  { label: 'Mind & Scripture', words: 'bible scripture verse neville mystic manifestation', href: { pathname: '/learn', params: { group: 'Mind & Scripture' } } },
  { label: 'Dream journal', words: 'dreams symbols', href: '/dreams' },
  { label: 'Shadow work', words: 'shadow prompt journal', href: '/shadow' },
  { label: 'Projection check', words: 'trigger projection', href: '/projection' },
  { label: 'Synchronicity log', words: 'synchronicity 11:11 numbers coincidence', href: '/synchronicity' },
  { label: 'Individuation journey', words: 'journey persona self anima', href: '/journey' },
  { label: 'Quizzes', words: 'type archetype alignment personality quiz', href: '/quiz-types' },
  { label: 'Best date finder', words: 'best day timing launch move sign', href: '/best-date' },
  { label: 'Family & circle', words: 'family people circle', href: '/family' },
  { label: 'Saved readings', words: 'readings saved history', href: '/readings' },
  { label: 'Settings', words: 'settings key backup theme appearance', href: '/settings' },
];

export default function SearchTab() {
  const me = useProfile();
  const people = usePeopleStore((s) => s.people);
  const custom = usePeopleStore((s) => s.customEntities);
  const [q, setQ] = useState('');
  const entities = useMemo(() => allEntities(custom), [custom]);
  const tabSpace = useTabBarSpace();

  if (!me) return <Redirect href="/onboarding" />;

  const needle = q.trim().toLowerCase();
  const personHits = needle ? people.filter((p) => p.name.toLowerCase().includes(needle)) : [];
  const entityHits = searchEntities(entities, q).slice(0, 20);
  const toolHits = needle ? TOOLS.filter((tool) => `${tool.label} ${tool.words}`.toLowerCase().includes(needle)) : [];
  const articleHits = needle ? LEARN_ARTICLES.filter((a) => `${a.title} ${a.summary}`.toLowerCase().includes(needle)).slice(0, 6) : [];
  const nothing = needle && personHits.length + entityHits.length + toolHits.length + articleHits.length === 0;

  return (
    <Screen bottomInset={tabSpace}>
      <Txt variant="title">Search</Txt>
      <TextField value={q} onChangeText={setQ} placeholder="Apple, Tokyo, your sister, dreams…" autoCorrect={false} accessibilityLabel="Search" />
      {!needle ? <Txt variant="small">Find people, places, brands and celebrities to compare with, plus every tool and Learn article.</Txt> : null}
      {nothing ? <Txt variant="small">Nothing found. You can read any date in the Calculator.</Txt> : null}

      {toolHits.length ? (
        <View style={styles.list}>
          <SectionLabel>Tools</SectionLabel>
          {toolHits.map((tool) => (
            <LinkRow key={tool.label} label={tool.label} href={tool.href} />
          ))}
        </View>
      ) : null}

      {personHits.length + entityHits.length ? (
        <View style={styles.list}>
          <SectionLabel>Compatibility</SectionLabel>
          {personHits.map((p) => {
            const c = compatibility(me, buildProfile({ name: p.name, birthDate: p.birthDate }));
            return (
              <MatchRow key={p.id} name={p.name} caption={p.relation} overall={c.overall} label={c.label} onPress={() => router.push({ pathname: '/entity', params: { person: p.id } })} />
            );
          })}
          {entityHits.map((e) => {
            const c = compatibility(me, entityProfile(e));
            return (
              <MatchRow
                key={e.id}
                name={e.name}
                caption={`${ENTITY_KIND[e.category]} · ${e.note}`}
                overall={c.overall}
                label={c.label}
                onPress={() => router.push({ pathname: '/entity', params: { id: e.id } })}
              />
            );
          })}
        </View>
      ) : null}

      {articleHits.length ? (
        <View style={styles.list}>
          <SectionLabel>Learn</SectionLabel>
          {articleHits.map((a) => (
            <LinkRow key={a.slug} label={a.title} caption={a.summary} href={{ pathname: '/article', params: { slug: a.slug } }} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ list: { gap: space(2) } });
