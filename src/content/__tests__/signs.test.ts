import { ANIMAL_MEANINGS, ELEMENT_MEANINGS } from '@/content/chineseSigns';
import { SIGN_MEANINGS } from '@/content/westernSigns';
import { ANIMALS } from '@/engines/chinese';
import { SIGNS } from '@/engines/western';

test('all 12 western signs', () => {
  for (const s of SIGNS) {
    const m = SIGN_MEANINGS[s];
    expect(m.dates.length).toBeGreaterThan(5);
    expect(m.traits.length).toBeGreaterThanOrEqual(3);
    for (const f of [m.light, m.shadow, m.jungNote]) expect(f.length).toBeGreaterThan(20);
  }
  expect(SIGN_MEANINGS.Leo.jungNote).toMatch(/Jung/);
});

test('all 12 animals and 5 elements', () => {
  for (const a of ANIMALS) {
    const m = ANIMAL_MEANINGS[a];
    expect(m.traits.length).toBeGreaterThanOrEqual(3);
    expect(m.light.length).toBeGreaterThan(20);
    expect(m.shadow.length).toBeGreaterThan(20);
  }
  for (const e of ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const) {
    expect(ELEMENT_MEANINGS[e].nature.length).toBeGreaterThan(20);
    expect(ELEMENT_MEANINGS[e].inRelationships.length).toBeGreaterThan(20);
  }
});
