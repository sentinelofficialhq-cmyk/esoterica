import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { startConversation } from '@/ai/start';
import { ANIMAL_GLYPHS } from '@/content/chineseSigns';
import { ENTITY_KIND } from '@/data/entities';
import { compatibility } from '@/engines/compatibility';
import { allEntities, entityProfile } from '@/engines/matches';
import { buildProfile } from '@/engines/profile';
import { formatDate } from '@/lib/date';
import { compatibilityReading } from '@/readings/builders';
import { usePeopleStore } from '@/store/peopleStore';
import { useProfile } from '@/store/profileStore';
import { useReadingStore } from '@/store/readingStore';
import { MeterBar } from '@/ui/Bars';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { EmptyState } from '@/ui/EmptyState';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { ScoreRing } from '@/ui/ScoreRing';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';
import { WheelDatePicker } from '@/ui/WheelDatePicker';

export default function EntityScreen() {
  const { colors } = useTheme();
  const { id, person } = useLocalSearchParams<{ id?: string; person?: string }>();
  const me = useProfile();
  const people = usePeopleStore((s) => s.people);
  const custom = usePeopleStore((s) => s.customEntities);
  const upsertCustomEntity = usePeopleStore((s) => s.upsertCustomEntity);
  const saveReading = useReadingStore((s) => s.saveReading);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!me) return <Redirect href="/onboarding" />;

  const entity = id ? allEntities(custom).find((e) => e.id === id) : undefined;
  const p = person ? people.find((x) => x.id === person) : undefined;
  if (!entity && !p) {
    return (
      <Screen header={<ScreenHeader title="Match" />}>
        <EmptyState title="Not found" body="This entry no longer exists." />
      </Screen>
    );
  }

  const name = entity?.name ?? p!.name;
  const date = entity?.date ?? p!.birthDate;
  const them = entity ? entityProfile(entity) : buildProfile({ name: p!.name, birthName: p!.birthName, birthDate: p!.birthDate });
  const c = compatibility(me, them);
  const caption = entity ? `${ENTITY_KIND[entity.category]} · ${entity.note} ${formatDate(entity.date)}` : `${p!.relation} · born ${formatDate(p!.birthDate)}`;
  const subjectRef = entity ? `entity:${entity.id}` : `person:${p!.id}`;

  return (
    <Screen header={<ScreenHeader title={entity ? ENTITY_KIND[entity.category] : 'Person'} />}>
      <View style={styles.head}>
        <Txt variant="title">{name}</Txt>
        <Txt variant="small">{caption}</Txt>
      </View>

      <Card style={styles.center}>
        <ScoreRing score={c.overall} label={c.label} caption="Compatibility" size={170} />
        <View style={styles.meters}>
          <MeterBar label="Chinese" value={c.chinese} />
          <MeterBar label="Western" value={c.western} />
          <MeterBar label="Numerology" value={c.numerology} />
        </View>
      </Card>

      {c.aligned.length ? (
        <Card>
          <Txt variant="label" color={colors.teal}>
            Where you align
          </Txt>
          {c.aligned.map((a) => (
            <Txt key={a} variant="bodyDim">
              {a}
            </Txt>
          ))}
        </Card>
      ) : null}
      {c.friction.length ? (
        <Card>
          <Txt variant="label" color={colors.danger}>
            Where friction shows up
          </Txt>
          {c.friction.map((f) => (
            <Txt key={f} variant="bodyDim">
              {f}
            </Txt>
          ))}
        </Card>
      ) : null}

      <Card>
        <Txt variant="label">{`${name}’s pattern`}</Txt>
        <View style={styles.chips}>
          <Chip label={`Life Path ${them.lifePath.display}`} />
          <Chip label={`${them.western.glyph} ${them.western.sign}`} />
          <Chip label={`${ANIMAL_GLYPHS[them.chinese.animal]} ${them.chinese.element} ${them.chinese.animal}`} />
        </View>
      </Card>

      <Button label="Full compatibility reading" onPress={() => router.push({ pathname: '/reading', params: { type: 'compatibility', b: subjectRef } })} />
      <Button
        label="Ask Jung about this match"
        variant="subtle"
        onPress={() => {
          const conv = startConversation({ mode: 'relationships' });
          const q = [
            `What do you make of my compatibility with ${name}? Esoterica scores it ${c.overall}% (${c.label}): Chinese ${c.chinese}, Western ${c.western}, Numerology ${c.numerology}.`,
            c.aligned.length ? `Where we align: ${c.aligned.join('; ')}.` : '',
            c.friction.length ? `Where there is friction: ${c.friction.join('; ')}.` : '',
            `Their pattern: Life Path ${them.lifePath.display}, ${them.western.sign}, ${them.chinese.element} ${them.chinese.animal}.`,
          ]
            .filter(Boolean)
            .join(' ');
          router.push({ pathname: '/chat', params: { id: conv, q } });
        }}
      />
      <Button
        label={saved ? 'Saved' : 'Save reading'}
        variant="ghost"
        disabled={saved}
        onPress={() => {
          saveReading(compatibilityReading(me, them, { a: me.name || 'You', b: name }));
          setSaved(true);
        }}
      />

      {entity ? (
        editing ? (
          <Card>
            <Txt variant="label">Correct the date</Txt>
            <WheelDatePicker
              value={date}
              maxYear={2100}
              minYear={1600}
              onChange={(d) =>
                upsertCustomEntity({ ...entity, date: d, note: entity.note.endsWith('(edited)') ? entity.note : `${entity.note} (edited)` })
              }
            />
            <Button label="Done" variant="subtle" small onPress={() => setEditing(false)} />
          </Card>
        ) : (
          <Txt variant="small" center onPress={() => setEditing(true)}>
            Dates come from public sources. <Txt variant="small" color={colors.accent}>Edit this date</Txt>
          </Txt>
        )
      ) : (
        <Button label="Edit person" variant="subtle" onPress={() => router.push({ pathname: '/person', params: { id: p!.id } })} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: space(1) },
  center: { alignItems: 'center', gap: space(4) },
  meters: { alignSelf: 'stretch', gap: space(3) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
});
