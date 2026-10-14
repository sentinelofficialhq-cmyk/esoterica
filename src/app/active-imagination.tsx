import { router } from 'expo-router';

import { useTheme } from '@/ui/ThemeProvider';
import { MODES } from '@/ai/modes';
import { startConversation } from '@/ai/start';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { Txt } from '@/ui/Txt';

export default function ActiveImagination() {
  const { colors } = useTheme();
  const begin = () => {
    const id = startConversation({ mode: 'activeImagination', title: 'Active imagination' });
    router.replace({ pathname: '/chat', params: { id, q: MODES.activeImagination.starters[0] } });
  };

  return (
    <Screen header={<ScreenHeader title="Active imagination" />} footer={<Button label="Begin a session" onPress={begin} />}>
      <SectionLabel>A waking dialogue with the unconscious</SectionLabel>
      <Txt variant="bodyDim">
        Jung developed active imagination during his own confrontation with the unconscious. You start from an image, from a dream or a strong
        feeling, let it move on its own, and then speak with the figures that appear, while keeping your own conscious point of view.
      </Txt>
      <Card>
        <Txt variant="heading">How the session works</Txt>
        <Txt variant="bodyDim">1. Settle your body and attention.</Txt>
        <Txt variant="bodyDim">2. Choose a starting image.</Txt>
        <Txt variant="bodyDim">3. Watch it move without forcing it.</Txt>
        <Txt variant="bodyDim">4. Enter the scene and talk with the figures.</Txt>
        <Txt variant="bodyDim">5. Write down what happened and reflect on what it means for your life.</Txt>
        <Txt variant="small">Jung guides one step at a time and waits for you. Take as long as you need.</Txt>
      </Card>
      <Card tone="gold">
        <Txt variant="label" color={colors.gold}>
          Take care
        </Txt>
        <Txt variant="small" color={colors.text}>
          Active imagination can stir up strong material. If you are in acute distress, grieving something raw, or feel unsafe, choose a calmer day,
          or simply talk with Jung instead. You can stop at any moment by grounding yourself: slow breaths, feet on the floor, naming five things
          you can see.
        </Txt>
      </Card>
    </Screen>
  );
}
