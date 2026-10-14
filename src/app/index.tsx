import { Redirect } from 'expo-router';

import { useProfileStore } from '@/store/profileStore';

export default function Index() {
  const onboarded = useProfileStore((s) => s.onboarded);
  return <Redirect href={onboarded ? '/home' : '/onboarding'} />;
}
