import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { LetterSystem } from '@/engines/letterology';
import { useProfileStore } from '@/store/profileStore';
import { Button } from '@/ui/Button';
import { Chip } from '@/ui/Chip';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { TextField } from '@/ui/TextField';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

export default function NameReadingSetup() {
  const birthName = useProfileStore((s) => s.birthName);
  const name = useProfileStore((s) => s.name);
  const defaultSystem = useProfileStore((s) => s.letterSystem);
  const [names, setNames] = useState<string[]>([birthName || name, '', '']);
  const [system, setSystem] = useState<LetterSystem>(defaultSystem);

  const filled = names.map((n) => n.trim()).filter(Boolean);
  const setAt = (i: number, v: string) => setNames((prev) => prev.map((n, j) => (j === i ? v : n)));

  return (
    <Screen header={<ScreenHeader title="Name reading" />}>
      <SectionLabel>Letterology</SectionLabel>
      <Txt variant="bodyDim">
        Read your birth name, a nickname, a married name or a business name. Add up to three to compare them against your Life Path.
      </Txt>
      {names.map((n, i) => (
        <TextField
          key={i}
          label={i === 0 ? 'Name' : `Compare with (optional)`}
          value={n}
          onChangeText={(v) => setAt(i, v)}
          placeholder={i === 0 ? 'Full name' : 'Another name'}
        />
      ))}
      <View style={styles.chips}>
        <Chip label="Pythagorean" selected={system === 'pythagorean'} onPress={() => setSystem('pythagorean')} />
        <Chip label="Chaldean" selected={system === 'chaldean'} onPress={() => setSystem('chaldean')} />
      </View>
      <Button
        label={filled.length > 1 ? 'Compare names' : 'Read name'}
        disabled={filled.length === 0}
        onPress={() => router.push({ pathname: '/reading', params: { type: 'name', names: filled.join('|'), system } })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ chips: { flexDirection: 'row', gap: space(2) } });
