import { Linking } from 'react-native';

import { useTheme } from '@/ui/ThemeProvider';
import { CRISIS_RESOURCES } from '@/ai/safety';
import { Card } from '@/ui/Card';
import { Txt } from '@/ui/Txt';

/** Shown when a message suggests the person may be in danger. Real help, one tap away. */
export function CrisisBanner() {
  const { colors } = useTheme();
  return (
    <Card style={{ backgroundColor: colors.dangerSoft, borderColor: 'rgba(255,92,122,0.45)' }}>
      <Txt variant="heading">You deserve support right now</Txt>
      <Txt variant="small" color={colors.text}>
        Jung is an AI and can’t keep you safe. If you are thinking about harming yourself, or someone is hurting you, please reach a person now:
      </Txt>
      {CRISIS_RESOURCES.map((r) => (
        <Txt key={r.url} variant="body" color={colors.accent} onPress={() => Linking.openURL(r.url)}>
          {r.label}
        </Txt>
      ))}
    </Card>
  );
}
