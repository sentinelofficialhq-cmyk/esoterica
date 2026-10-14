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

/** `extra` is a softer last choice such as "Neither fits me", drawn apart from the main options; its answer index is `options.length`. */
export type QuizQuestion = { prompt: string; options: readonly string[]; extra?: string };

/** One way to take the quiz, chosen on the start screen (e.g. a quick read and a deep dive). */
export type QuizVariant = { id: string; label: string; detail: string; questions: QuizQuestion[] };

type Props = {
  title: string;
  intro: string;
  /** One answer per question: the chosen option's index. `variantId` is set when the quiz has variants. */
  onComplete: (answers: number[], variantId?: string) => void;
} & (
  | { questions: QuizQuestion[]; variants?: never; initialVariant?: never }
  | { variants: QuizVariant[]; questions?: never; /** Skip the start screen and begin this variant. */ initialVariant?: string }
);

/** One question per screen, a progress bar, and Back. */
export function QuizRunner(props: Props) {
  const { title, intro, onComplete } = props;
  const styles = useStyles(makeStyles);
  const preset = props.variants?.find((v) => v.id === props.initialVariant);
  const [variant, setVariant] = useState<QuizVariant | null>(preset ?? null);
  const [started, setStarted] = useState(!!preset);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const questions = variant?.questions ?? props.questions ?? [];

  const begin = (v: QuizVariant | null) => {
    setVariant(v);
    setIndex(0);
    setAnswers([]);
    setStarted(true);
  };

  const choose = (option: number) => {
    const next = [...answers.slice(0, index), option];
    if (index === questions.length - 1) {
      onComplete(next, variant?.id);
      return;
    }
    setAnswers(next);
    setIndex(index + 1);
  };

  if (!started) {
    const variants = props.variants;
    return (
      <Screen
        header={<ScreenHeader title={title} />}
        footer={variants ? undefined : <Button label="Begin" onPress={() => begin(null)} />}>
        <SectionLabel>{variants ? 'Choose your depth' : `${questions.length} questions`}</SectionLabel>
        <Txt variant="title">{title}</Txt>
        <Txt variant="bodyDim">{intro}</Txt>
        {variants?.map((v) => (
          <Card key={v.id} onPress={() => begin(v)} accessibilityLabel={`${v.label}. ${v.detail}`}>
            <Txt variant="heading">{v.label}</Txt>
            <Txt variant="small">{v.detail}</Txt>
          </Card>
        ))}
        <Txt variant="small">There are no right answers. Choose what is most true of you, not who you think you should be.</Txt>
      </Screen>
    );
  }

  const q = questions[index];
  const back = index > 0 ? () => setIndex(index - 1) : props.variants && !preset ? () => setStarted(false) : undefined;
  return (
    <Screen header={<ScreenHeader title={title} onBack={back} />}>
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
        {q.extra ? (
          <Card
            onPress={() => choose(q.options.length)}
            tone={answers[index] === q.options.length ? 'ember' : 'default'}
            style={styles.extra}>
            <Txt variant="bodyDim" center>
              {q.extra}
            </Txt>
          </Card>
        ) : null}
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
    extra: { marginTop: space(2), paddingVertical: space(3) },
  });
