import { buildProfile } from '@/engines/profile';
import { alignmentQuestions, scoreAlignment } from '@/jung/alignmentQuiz';

const profile = buildProfile({ name: 'Sam', birthDate: '1990-05-14' });

test('six questions from life path, element and animal; deterministic', () => {
  const qs = alignmentQuestions(profile);
  expect(qs).toHaveLength(6);
  expect(qs.map((q) => q.source)).toEqual(['lifePath', 'lifePath', 'element', 'element', 'animal', 'animal']);
  expect(alignmentQuestions(profile)).toEqual(qs);
});

test('scoring maps the 1–5 scale to 0–100 with tiers', () => {
  expect(scoreAlignment([5, 5, 5, 5, 5, 5], 'x')).toMatchObject({ percent: 100, tier: expect.stringMatching(/^In step/) });
  expect(scoreAlignment([1, 1, 1, 1, 1, 1], 'x').percent).toBe(0);
  expect(scoreAlignment([3, 3, 3, 3, 3, 3], 'x')).toMatchObject({ percent: 50, tier: expect.stringMatching(/^Partly masked/) });
  expect(scoreAlignment([2, 2, 2, 2, 2, 2], 'x').tier).toMatch(/borrowed persona/);
  expect(() => scoreAlignment([5], 'x')).toThrow();
});
