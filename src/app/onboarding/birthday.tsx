import { router } from 'expo-router';

import { useProfileStore } from '@/store/profileStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { Txt } from '@/ui/Txt';
import { WheelDatePicker } from '@/ui/WheelDatePicker';

const DEFAULT_BIRTHDAY = '1995-01-01';

export default function BirthdayStep() {
  const birthDate = useProfileStore((s) => s.birthDate);
  const setProfile = useProfileStore((s) => s.setProfile);
  const value = birthDate ?? DEFAULT_BIRTHDAY;

  return (
    <Screen
      header={<ScreenHeader />}
      footer={
        <Button
          label="Reveal my pattern"
          onPress={() => {
            setProfile({ birthDate: value });
            router.push('/onboarding/reveal');
          }}
        />
      }>
      <SectionLabel>Step 2 of 2</SectionLabel>
      <Txt variant="title">When were you born?</Txt>
      <Card>
        <WheelDatePicker value={value} onChange={(v) => setProfile({ birthDate: v })} />
      </Card>
      <Txt variant="small">Your birthday personalizes every reading. It stays on this device and is never uploaded.</Txt>
    </Screen>
  );
}
