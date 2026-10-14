import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { importBackup } from '@/store/backupActions';
import { useProfileStore } from '@/store/profileStore';

import { Button } from '@/ui/Button';
import { Logo } from '@/ui/Logo';
import { Screen } from '@/ui/Screen';
import { SectionLabel } from '@/ui/SectionLabel';
import { Accent, Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

export default function Welcome() {
  const { colors } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const restore = async () => {
    setError(null);
    try {
      if (!(await importBackup())) return;
      if (useProfileStore.getState().onboarded) router.replace('/home');
      else setError('That backup has no profile in it. Tap Begin to set one up.');
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Screen
      scroll={false}
      footer={
        <View style={styles.footer}>
          <Button label="Begin" onPress={() => router.push('/onboarding/name')} />
          <Button label="Restore from a backup" variant="ghost" small onPress={restore} />
          {error ? (
            <Txt variant="small" color={colors.danger} center>
              {error}
            </Txt>
          ) : null}
        </View>
      }>
      <View style={styles.center}>
        <Logo size={120} />
        <SectionLabel>Esoterica · your birthday, read deeply</SectionLabel>
        <Txt variant="hero" center>
          Know yourself.{'\n'}Know what fits.{'\n'}
          <Accent>Know when to move.</Accent>
        </Txt>
        <Txt variant="bodyDim" center>
          Numerology, Western and Chinese astrology read together, with a guide modeled on Carl Jung to help you make sense of
          it all.
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space(5) },
  footer: { gap: space(2) },
});
