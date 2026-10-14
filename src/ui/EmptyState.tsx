import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/ui/Card';
import { Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <Card style={styles.card}>
      <Txt variant="heading" center>
        {title}
      </Txt>
      {body ? (
        <Txt variant="bodyDim" center>
          {body}
        </Txt>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: space(6) },
  action: { marginTop: space(2), alignSelf: 'stretch' },
});
