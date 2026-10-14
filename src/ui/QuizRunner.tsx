import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { Theme } from '@/ui/themes';
import { useStyles } from '@/ui/ThemeProvider';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Screen } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';
import { SectionLabel } from '@/ui/SectionLabel';
import { Txt } from '@/ui/Txt';
import { radii, space } from '@/ui/theme';

export type QuizQuestion = { prompt: string; options: readonly string[] };

type Props = {
  title: string;
  intro: string;
  questions: QuizQuestion[];
  /** One answer per question: the chosen option's index. */
  onComplete: (answers: number[]) => void;
};

/** One question per screen, a progress bar, and Back. */
export function QuizRunner({ title, intro, questions, onComplete }: Props) {
  const styles = useStyles(makeStyles);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const choose = (option: number) => {
    const next = [...answers.slice(0, index), option];
    if (index === questions.length - 1) {
      onComplete(next);
      return;
    }
    setAnswers(next);
    setIndex(index + 1);
  };

  if (!started) {
    return (
      <Screen header={<ScreenHeader title={title} />} footer={<Button label="Begin" onPress={() => setStarted(true)} />}>
        <SectionLabel>{`${questions.length} questions`}</SectionLabel>
        <Txt variant="title">{title}</Txt>
        <Txt variant="bodyDim">{intro}</Txt>
        <Txt variant="small">There are no right answers. Choose what is most true of you, not who you think you should be.</Txt>
      </Screen>
    );
  }

  const q = questions[index];
  return (
    <Screen
      header={<ScreenHeader title={title} onBack={index > 0 ? () => setIndex(index - 1) : undefined} />}>
      <View style={styles.progressTrack} accessibilityLabel={`Question ${index + 1} of ${questions.length}`}>
        <View style={[styles.progressFill, { width: `${((index + 1) / questions.length) * 100}%` }]} />
      </View>
      <Txt variant="label">{`${index + 1} / ${questions.length}`}</Txt>
      <Animated.View key={index} entering={FadeIn.duration(250)} style={styles.body}>
        <Txt variant="title" style={styles.prompt}>
          {q.prompt}
        </Txt>
        {q.options.map((opt, i) => (
          <Card key={opt} onPress={() => choose(i)} tone={answers[index] === i ? 'ember' : 'default'}>
            <Txt variant="body">{opt}</Txt>
          </Card>
        ))}
      </Animated.View>
    </Screen>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    progressTrack: { height: 4, borderRadius: radii.pill, backgroundColor: t.colors.accentSoft, overflow: 'hidden' },
    progressFill: { height: 4, borderRadius: radii.pill, backgroundColor: t.colors.accent },
    body: { gap: space(3) },
    prompt: { fontSize: 24, lineHeight: 30, marginBottom: space(2) },
  });
