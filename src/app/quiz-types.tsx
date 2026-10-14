import { router } from 'expo-router';

import { scoreTypes, TYPES_ITEMS } from '@/jung/typesQuiz';
import { todayLocal } from '@/lib/date';
import { useQuizStore } from '@/store/quizStore';
import { QuizRunner } from '@/ui/QuizRunner';

export default function TypesQuiz() {
  const setTypes = useQuizStore((s) => s.setTypes);
  return (
    <QuizRunner
      title="Psychological Types"
      intro="Jung described two attitudes (introversion and extraversion) and four functions (thinking, feeling, sensation and intuition). This quiz finds which function leads in you, which supports it, and which lives in your shadow."
      questions={TYPES_ITEMS.map((i) => ({ prompt: i.prompt, options: [i.a.text, i.b.text] }))}
      onComplete={(answers) => {
        setTypes(scoreTypes(answers.map((a) => (a === 0 ? 'a' : 'b')), todayLocal()));
        router.replace({ pathname: '/reading', params: { type: 'type' } });
      }}
    />
  );
}
