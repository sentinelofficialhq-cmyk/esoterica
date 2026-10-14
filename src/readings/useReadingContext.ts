import { todayLocal } from '@/lib/date';
import type { ReadingContext } from '@/readings/fromParams';
import { usePeopleStore } from '@/store/peopleStore';
import { useProfile, useProfileStore } from '@/store/profileStore';
import { useQuizStore } from '@/store/quizStore';

/** Everything the reading builders need, gathered from the stores. Null before onboarding. */
export function useReadingContext(): ReadingContext | null {
  const profile = useProfile();
  const people = usePeopleStore((s) => s.people);
  const customEntities = usePeopleStore((s) => s.customEntities);
  const types = useQuizStore((s) => s.types);
  const archetypes = useQuizStore((s) => s.archetypes);
  const alignment = useQuizStore((s) => s.alignment[0] ?? null);
  const letterSystem = useProfileStore((s) => s.letterSystem);
  if (!profile) return null;
  return { profile, people, customEntities, quizzes: { types, archetypes, alignment }, today: todayLocal(), letterSystem };
}
