import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { Theme } from '@/ui/themes';
import { useStyles, useTheme } from '@/ui/ThemeProvider';
import { ENTITY_CATEGORY_LABEL, ENTITY_KIND, type EntityCategory } from '@/data/entities';
import { compatibility } from '@/engines/compatibility';
import { allEntities, mostFriction, randomEntity, topMatches } from '@/engines/matches';
import { buildProfile } from '@/engines/profile';
import { usePeopleStore } from '@/store/peopleStore';
import { useProfile } from '@/store/profileStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { EmptyState } from '@/ui/EmptyState';
import { SearchIcon } from '@/ui/icons';
import { MatchRow } from '@/ui/MatchRow';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { Accent, Txt } from '@/ui/Txt';
import { radii, space } from '@/ui/theme';

type Filter = 'all' | 'people' | EntityCategory;
const FILTERS: Filter[] = ['all', 'people', 'country', 'state', 'city', 'brand', 'company', 'car', 'celebrity', 'event'];
const filterLabel = (f: Filter) => (f === 'all' ? 'All' : f === 'people' ? 'People' : ENTITY_CATEGORY_LABEL[f]);

export default function MatchTab() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const profile = useProfile();
  const people = usePeopleStore((s) => s.people);
  const custom = usePeopleStore((s) => s.customEntities);
  const [filter, setFilter] = useState<Filter>('all');

  const entities = useMemo(() => allEntities(custom), [custom]);
  const category = filter === 'all' || filter === 'people' ? undefined : filter;
  const top = useMemo(() => (profile ? topMatches(profile, entities, { category, limit: 10 }) : []), [profile, entities, category]);
  const worst = useMemo(() => (profile ? mostFriction(profile, entities, { category, limit: 5 }) : []), [profile, entities, category]);

  if (!profile) return <Redirect href="/onboarding" />;

  const openEntity = (id: string) => router.push({ pathname: '/entity', params: { id } });

  return (
    <Screen header={<ScreenHeader title="Compatibility" />}>
      <View style={styles.head}>
        <SectionLabel>Know what fits</SectionLabel>
        <Txt variant="title">
          Run your pattern against <Accent>anyone or anything.</Accent>
        </Txt>
      </View>

      <Pressable accessibilityRole="search" onPress={() => router.push('/search')} style={styles.search}>
        <SearchIcon />
        <Txt variant="bodyDim">Search people, brands, cities…</Txt>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FILTERS.map((f) => (
          <Chip key={f} label={filterLabel(f)} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>

      {filter === 'people' ? (
        <View style={styles.list}>
          {people.length === 0 ? (
            <EmptyState title="No people yet" body="Add partners, family and friends to see how your patterns fit." />
          ) : (
            people.map((p) => {
              const c = compatibility(profile, buildProfile({ name: p.name, birthDate: p.birthDate }));
              return (
                <MatchRow
                  key={p.id}
                  name={p.name}
                  caption={p.relation}
                  overall={c.overall}
                  label={c.label}
                  onPress={() => router.push({ pathname: '/entity', params: { person: p.id } })}
                />
              );
            })
          )}
          <View style={styles.row}>
            <Button label="Add person" style={styles.flex} onPress={() => router.push('/person')} />
            <Button label="Family & circle" variant="ghost" style={styles.flex} onPress={() => router.push('/family')} />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.list}>
            <Txt variant="label">Your top matches</Txt>
            {top.map((m) => (
              <MatchRow
                key={m.entity.id}
                name={m.entity.name}
                caption={`${ENTITY_KIND[m.entity.category]} · ${m.entity.note}`}
                overall={m.compat.overall}
                label={m.compat.label}
                onPress={() => openEntity(m.entity.id)}
              />
            ))}
          </View>
          <View style={styles.list}>
            <Txt variant="label">Most friction</Txt>
            {worst.map((m) => (
              <MatchRow
                key={m.entity.id}
                name={m.entity.name}
                caption={ENTITY_KIND[m.entity.category]}
                overall={m.compat.overall}
                label={m.compat.label}
                onPress={() => openEntity(m.entity.id)}
              />
            ))}
          </View>
          <Button
            label="Surprise me"
            variant="ghost"
            onPress={() => {
              const pool = category ? entities.filter((e) => e.category === category) : entities;
              openEntity(randomEntity(pool, String(Date.now())).id);
            }}
          />
        </>
      )}

      <Card tone="gold" onPress={() => router.push('/best-date')}>
        <Txt variant="label" color={colors.gold}>
          Know when to move
        </Txt>
        <Txt variant="heading">Best-date finder</Txt>
        <Txt variant="small" color={colors.text}>
          Find the strongest days to launch, sign, travel, connect or rest.
        </Txt>
      </Card>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    head: { gap: space(2) },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space(3),
      backgroundColor: t.colors.bgElev,
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: radii.pill,
      paddingHorizontal: space(4),
      paddingVertical: space(3),
    },
    chips: { gap: space(2), paddingRight: space(4) },
    list: { gap: space(2) },
    row: { flexDirection: 'row', gap: space(3), marginTop: space(2) },
    flex: { flex: 1 },
  });
