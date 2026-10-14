import { Redirect, router } from 'expo-router';

import { ALIGNMENT_SCALE, alignmentQuestions, scoreAlignment } from '@/jung/alignmentQuiz';
import { todayLocal } from '@/lib/date';
import { useProfile } from '@/store/profileStore';
import { useQuizStore } from '@/store/quizStore';
import { QuizRunner } from '@/ui/QuizRunner';

export default function AlignmentQuiz() {
  const profile = useProfile();
  const addAlignment = useQuizStore((s) => s.addAlignment);
  if (!profile) return <Redirect href="/onboarding" />;

  return (
    <QuizRunner
      title="Alignment"
      intro="Does the person you are being match your birth pattern? Rate six statements drawn from your Life Path, element and animal. In Jung’s terms, this is a look at the Persona and the Self."
      questions={alignmentQuestions(profile).map((q) => ({ prompt: q.text, options: ALIGNMENT_SCALE }))}
      onComplete={(answers) => {
        addAlignment(scoreAlignment(answers.map((a) => a + 1), todayLocal()));
        router.replace({ pathname: '/reading', params: { type: 'alignment' } });
      }}
    />
  );
}
