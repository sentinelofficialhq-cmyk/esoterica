import { router } from 'expo-router';

import { ARCHETYPE_ITEMS, scoreArchetypes } from '@/jung/archetypeQuiz';
import { todayLocal } from '@/lib/date';
import { useQuizStore } from '@/store/quizStore';
import { QuizRunner } from '@/ui/QuizRunner';

export default function ArchetypeQuiz() {
  const setArchetypes = useQuizStore((s) => s.setArchetypes);
  return (
    <QuizRunner
      title="Archetype profile"
      intro="Archetypes are the old patterns that shape how we live our stories. This quiz finds the three that lead in you right now, and the shadow form of the strongest."
      questions={ARCHETYPE_ITEMS.map((i) => ({ prompt: i.prompt, options: i.options.map((o) => o.text) }))}
      onComplete={(answers) => {
        setArchetypes(scoreArchetypes(answers, todayLocal()));
        router.replace({ pathname: '/reading', params: { type: 'archetype' } });
      }}
    />
  );
}
