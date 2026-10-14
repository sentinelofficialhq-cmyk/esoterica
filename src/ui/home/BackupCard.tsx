import { router } from 'expo-router';
import type { StyleProp, ViewStyle } from 'react-native';

import { needsBackup, useHasUserData } from '@/store/backup';
import { exportBackup } from '@/store/backupActions';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Txt } from '@/ui/Txt';

/** A nudge to back up, shown when there is data and no backup in the last week. */
export function BackupCard({ today, style }: { today: string; style?: StyleProp<ViewStyle> }) {
  const hasData = useHasUserData();
  const lastBackupAt = useSettingsStore((st) => st.lastBackupAt);
  if (!needsBackup(lastBackupAt, today, hasData)) return null;
  return (
    <Card style={style}>
      <Txt variant="label">Back up Esoterica</Txt>
      <Txt variant="small">{`${lastBackupAt ? 'Your last backup was over a week ago.' : 'You haven’t saved a backup yet.'} Everything lives only on this phone.`}</Txt>
      <Button label="Back up now" variant="subtle" small onPress={() => exportBackup().catch(() => router.push('/settings'))} />
    </Card>
  );
}
