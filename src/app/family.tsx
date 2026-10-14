import { Redirect, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { compatibility } from '@/engines/compatibility';
import { buildProfile } from '@/engines/profile';
import { RELATIONS, usePeopleStore } from '@/store/peopleStore';
import { useProfile } from '@/store/profileStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { EmptyState } from '@/ui/EmptyState';
import { MatchRow } from '@/ui/MatchRow';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

export default function Family() {
  const { colors } = useTheme();
  const me = useProfile();
  const people = usePeopleStore((s) => s.people);
  if (!me) return <Redirect href="/onboarding" />;

  const members = [
    { id: 'me', name: me.name || 'You', profile: me },
    ...people.map((p) => ({ id: p.id, name: p.name, profile: buildProfile({ name: p.name, birthDate: p.birthDate }) })),
  ];
  const pairs: { a: string; b: string; overall: number; label: string }[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const c = compatibility(members[i].profile, members[j].profile);
      pairs.push({ a: members[i].name, b: members[j].name, overall: c.overall, label: c.label });
    }
  }
  const sorted = [...pairs].sort((x, y) => y.overall - x.overall);

  return (
    <Screen header={<ScreenHeader title="Family & circle" />}>
      {people.length === 0 ? (
        <EmptyState
          title="Your circle is empty"
          body="Add family, partners and friends to see how everyone’s patterns fit together."
          action={<Button label="Add person" onPress={() => router.push('/person')} />}
        />
      ) : (
        <>
          {RELATIONS.filter((r) => people.some((p) => p.relation === r)).map((r) => (
            <View key={r} style={styles.group}>
              <Txt variant="label">{r}</Txt>
              {people
                .filter((p) => p.relation === r)
                .map((p) => {
                  const c = compatibility(me, buildProfile({ name: p.name, birthDate: p.birthDate }));
                  return (
                    <MatchRow
                      key={p.id}
                      name={p.name}
                      caption={`with you`}
                      overall={c.overall}
                      label={c.label}
                      onPress={() => router.push({ pathname: '/entity', params: { person: p.id } })}
                    />
                  );
                })}
            </View>
          ))}

          {sorted.length > 1 ? (
            <Card>
              <Txt variant="label" color={colors.teal}>
                Strongest bond
              </Txt>
              <Txt variant="body">{`${sorted[0].a} & ${sorted[0].b} · ${sorted[0].overall}% ${sorted[0].label}`}</Txt>
              <Txt variant="label" color={colors.danger} style={styles.spaced}>
                Most friction
              </Txt>
              <Txt variant="body">{`${sorted[sorted.length - 1].a} & ${sorted[sorted.length - 1].b} · ${sorted[sorted.length - 1].overall}% ${sorted[sorted.length - 1].label}`}</Txt>
            </Card>
          ) : null}

          <Card>
            <Txt variant="label">Every pair</Txt>
            {sorted.map((p) => (
              <View key={`${p.a}-${p.b}`} style={styles.pair}>
                <Txt variant="small" color={colors.text} style={styles.flex}>{`${p.a} & ${p.b}`}</Txt>
                <Txt variant="small">{`${p.overall}% ${p.label}`}</Txt>
              </View>
            ))}
          </Card>

          <Button label="Family reading" onPress={() => router.push({ pathname: '/reading', params: { type: 'family' } })} />
          <Button label="Add person" variant="ghost" onPress={() => router.push('/person')} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: space(2) },
  spaced: { marginTop: space(2) },
  pair: { flexDirection: 'row', gap: space(3), paddingVertical: space(1) },
  flex: { flex: 1 },
});
