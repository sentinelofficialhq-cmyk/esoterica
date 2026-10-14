import { router } from 'expo-router';

import { useProfileStore } from '@/store/profileStore';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { TextField } from '@/ui/TextField';
import { Txt } from '@/ui/Txt';

export default function NameStep() {
  const name = useProfileStore((s) => s.name);
  const birthName = useProfileStore((s) => s.birthName);
  const setProfile = useProfileStore((s) => s.setProfile);

  return (
    <Screen
      header={<ScreenHeader />}
      footer={<Button label="Continue" disabled={!name.trim()} onPress={() => router.push('/onboarding/birthday')} />}>
      <SectionLabel>Step 1 of 2</SectionLabel>
      <Txt variant="title">What should Jung call you?</Txt>
      <TextField
        label="Your name"
        value={name}
        onChangeText={(t) => setProfile({ name: t })}
        placeholder="First name or nickname"
        autoFocus
        autoComplete="given-name"
        returnKeyType="next"
      />
      <TextField
        label="Full birth name (optional)"
        value={birthName}
        onChangeText={(t) => setProfile({ birthName: t })}
        placeholder="As written on your birth certificate"
        autoComplete="name"
        hint="Used for Letterology, the numbers hidden in your name. You can change it later."
      />
    </Screen>
  );
}
