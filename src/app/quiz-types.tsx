import { router, useLocalSearchParams } from 'expo-router';

import { itemsFor, NEITHER_TEXT, scoreTypes, type TypesAnswer } from '@/jung/typesQuiz';
import type { TypesDepth } from '@/jung/types';
import { todayLocal } from '@/lib/date';
import { useQuizStore } from '@/store/quizStore';
import { QuizRunner, type QuizVariant } from '@/ui/QuizRunner';

const ANSWERS: TypesAnswer[] = ['a', 'b', 'neither'];

const variant = (depth: TypesDepth, label: string, detail: string): QuizVariant => ({
  id: depth,
  label,
  detail,
  questions: itemsFor(depth).map((i) => ({ prompt: i.prompt, options: [i.a.text, i.b.text], extra: NEITHER_TEXT })),
});

const VARIANTS = [
  variant('quick', 'Quick read', '10 questions, about 2 minutes. A first sketch of your type.'),
  variant('full', 'Deep dive', '32 questions, about 7 minutes. The precise version, with a clearer picture of your inferior function.'),
];

export default function TypesQuiz() {
  const setTypes = useQuizStore((s) => s.setTypes);
  // `?depth=full` (from a quick result's "Take the deep dive") skips the depth choice.
  const { depth } = useLocalSearchParams<{ depth?: string }>();
  return (
    <QuizRunner
      title="Psychological Types"
      intro="Jung described two attitudes (introversion and extraversion) and four functions (thinking, feeling, sensation and intuition). This quiz finds which function leads in you, which supports it, and which lives in your shadow."
      variants={VARIANTS}
      initialVariant={depth === 'full' || depth === 'quick' ? depth : undefined}
      onComplete={(answers, variantId) => {
        const d: TypesDepth = variantId === 'quick' ? 'quick' : 'full';
        setTypes(scoreTypes(answers.map((a) => ANSWERS[a] ?? 'neither'), todayLocal(), d));
        router.replace({ pathname: '/reading', params: { type: 'type' } });
      }}
    />
  );
}
