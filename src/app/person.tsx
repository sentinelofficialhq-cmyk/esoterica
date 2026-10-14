import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { confirm } from '@/lib/confirm';
import { RELATIONS, usePeopleStore, type RelationKind } from '@/store/peopleStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { TextField } from '@/ui/TextField';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';
import { WheelDatePicker } from '@/ui/WheelDatePicker';

export default function PersonEditor() {
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const existing = usePeopleStore((s) => s.people.find((p) => p.id === id));
  const { addPerson, updatePerson, removePerson } = usePeopleStore.getState();

  const [name, setName] = useState(existing?.name ?? '');
  const [birthName, setBirthName] = useState(existing?.birthName ?? '');
  const [birthDate, setBirthDate] = useState(existing?.birthDate ?? (date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '1995-01-01'));
  const [relation, setRelation] = useState<RelationKind>(existing?.relation ?? 'friend');

  const save = () => {
    const data = { name: name.trim(), birthName: birthName.trim() || undefined, birthDate, relation };
    if (existing) {
      updatePerson(existing.id, data);
      router.back();
    } else {
      const newId = addPerson(data);
      router.replace({ pathname: '/entity', params: { person: newId } });
    }
  };

  return (
    <Screen
      header={<ScreenHeader title={existing ? 'Edit person' : 'Add person'} />}
      footer={<Button label={existing ? 'Save' : 'Add'} disabled={!name.trim()} onPress={save} />}>
      <TextField label="Name" value={name} onChangeText={setName} placeholder="What you call them" />
      <TextField label="Full birth name (optional)" value={birthName} onChangeText={setBirthName} placeholder="For their name reading" />
      <Txt variant="label">Relationship</Txt>
      <View style={styles.chips}>
        {RELATIONS.map((r) => (
          <Chip key={r} label={r} selected={relation === r} onPress={() => setRelation(r)} />
        ))}
      </View>
      <Txt variant="label">Birthday</Txt>
      <Card>
        <WheelDatePicker value={birthDate} onChange={setBirthDate} />
      </Card>
      {existing ? (
        <Button
          label="Remove person"
          variant="ghost"
          onPress={async () => {
            if (await confirm('Remove person?', `${existing.name} will be removed from Esoterica.`, 'Remove')) {
              removePerson(existing.id);
              router.replace('/match');
            }
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) } });
