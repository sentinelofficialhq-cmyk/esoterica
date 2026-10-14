import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { confirm } from '@/lib/confirm';
import { useReadingStore } from '@/store/readingStore';
import { Card } from '@/ui/Card';
import { EmptyState } from '@/ui/EmptyState';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

export default function ReadingsHistory() {
  const { colors } = useTheme();
  const readings = useReadingStore((s) => s.readings);
  const removeReading = useReadingStore((s) => s.removeReading);

  return (
    <Screen header={<ScreenHeader title="Saved readings" />}>
      {readings.length === 0 ? (
        <EmptyState title="No saved readings" body="Save any reading and it will appear here, with Jung’s interpretation if you asked for one." />
      ) : (
        readings.map((r) => (
          <Card
            key={r.id}
            onPress={() => router.push({ pathname: '/reading', params: { id: r.id } })}
            style={styles.row}>
            <View style={styles.text}>
              <Txt variant="label">{r.doc.subtitle ?? r.doc.type}</Txt>
              <Txt variant="heading">{r.doc.title}</Txt>
              <Txt variant="small">
                {new Date(r.createdAt).toLocaleDateString()}
                {r.ai ? ' · with Jung’s reading' : ''}
              </Txt>
            </View>
            <Txt
              variant="small"
              color={colors.danger}
              onPress={async () => {
                if (await confirm('Delete reading?', `“${r.doc.title}” will be removed.`, 'Delete')) removeReading(r.id);
              }}>
              Delete
            </Txt>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  text: { flex: 1, gap: space(1) },
});
