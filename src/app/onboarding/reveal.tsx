import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/ui/ThemeProvider';
import { ANIMAL_GLYPHS } from '@/content/chineseSigns';
import { meaningFor } from '@/content/numbers';
import { useProfile, useProfileStore } from '@/store/profileStore';
import { NumberBadge, SignBadge } from '@/ui/Badges';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Screen } from '@/ui/Screen';
import { SectionLabel } from '@/ui/SectionLabel';
import { Accent, Txt } from '@/ui/Txt';
import { space } from '@/ui/theme';

export default function Reveal() {
  const { colors } = useTheme();
  const profile = useProfile();
  const name = useProfileStore((s) => s.name);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);

  if (!profile) return null;
  const lp = meaningFor(profile.lifePath.value);

  const enter = () => {
    completeOnboarding();
    router.replace('/home');
  };
  const quizzes = () => {
    completeOnboarding();
    router.replace('/home');
    router.push('/quiz-types');
  };

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <Button label="Enter Esoterica" onPress={enter} />
          <Button label="Take the Jung quizzes first" variant="ghost" onPress={quizzes} />
        </View>
      }>
      <Animated.View entering={FadeInDown.duration(500)}>
        <SectionLabel>Three systems, one pattern</SectionLabel>
        <Txt variant="title" style={styles.title}>
          {name ? `${name}, ` : ''}this is <Accent>your pattern.</Accent>
        </Txt>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250).duration(500)}>
        <Card>
          <NumberBadge reduced={profile.lifePath} label="Life Path" />
          <Txt variant="heading">{lp.title}</Txt>
          <Txt variant="bodyDim">{lp.light}</Txt>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.row}>
        <Card style={styles.half}>
          <SignBadge
            label="Western"
            glyph={profile.western.glyph}
            name={profile.western.sign}
            caption={`${profile.western.element} · ${profile.western.modality}`}
          />
        </Card>
        <Card style={styles.half}>
          <SignBadge
            label="Chinese"
            glyph={ANIMAL_GLYPHS[profile.chinese.animal]}
            name={profile.chinese.animal}
            caption={`${profile.chinese.element} · ${profile.chinese.polarity}`}
          />
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(750).duration(500)}>
        <Card tone="violet">
          <Txt variant="label" color={colors.violet}>
            Awareness, not prediction
          </Txt>
          <Txt variant="small" color={colors.text}>
            Esoterica offers reflection, not prediction. Its Jung is an AI inspired by Carl Jung’s writings: not Jung himself, and not a
            therapist. Readings never replace medical, legal or financial advice. You make the decisions.
          </Txt>
        </Card>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: space(2) },
  row: { flexDirection: 'row', gap: space(3) },
  half: { flex: 1 },
  footer: { gap: space(2) },
});
