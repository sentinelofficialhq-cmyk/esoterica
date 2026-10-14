import { LEARN_ARTICLES, articleBySlug } from '@/content/learn';

test('at least 20 articles with unique slugs and real bodies', () => {
  expect(LEARN_ARTICLES.length).toBeGreaterThanOrEqual(20);
  expect(new Set(LEARN_ARTICLES.map((a) => a.slug)).size).toBe(LEARN_ARTICLES.length);
  LEARN_ARTICLES.forEach((a) => {
    expect(a.paragraphs.length).toBeGreaterThanOrEqual(3);
    a.paragraphs.forEach((p) => expect(p.length).toBeGreaterThan(40));
  });
});

test('the transparency articles exist', () => {
  expect(articleBySlug('how-esoterica-scores')?.label).toBe('Method');
  expect(articleBySlug('what-research-says')?.label).toBe('Research says');
  expect(articleBySlug('nope')).toBeUndefined();
});

test('Mind & Scripture has its own shelf', () => {
  const shelf = LEARN_ARTICLES.filter((a) => a.group === 'Mind & Scripture');
  expect(shelf.length).toBeGreaterThanOrEqual(8);
  expect(shelf.some((a) => a.label === 'Research says')).toBe(true);
  expect(articleBySlug('neville-goddard')?.group).toBe('Mind & Scripture');
  expect(articleBySlug('jung-and-neville')?.label).toBe('Jung');
});
