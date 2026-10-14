import type { Animal, CElement } from '@/engines/chinese';

export type AnimalMeaning = { animal: Animal; traits: string[]; light: string; shadow: string };
export type ElementMeaning = { element: CElement; nature: string; inRelationships: string };

export const ANIMAL_MEANINGS: Record<Animal, AnimalMeaning> = {
  Rat: { animal: 'Rat', traits: ['clever', 'resourceful', 'charming', 'alert'], light: 'Quick wits, adaptability and a nose for opportunity.', shadow: 'Anxiety about scarcity, opportunism, and keeping score.' },
  Ox: { animal: 'Ox', traits: ['steady', 'dependable', 'patient', 'strong'], light: 'Endurance, reliability and quiet strength.', shadow: 'Stubbornness, rigidity and difficulty asking for help.' },
  Tiger: { animal: 'Tiger', traits: ['brave', 'passionate', 'independent', 'magnetic'], light: 'Courage, conviction and protective fire.', shadow: 'Recklessness, rebellion for its own sake, and a short fuse.' },
  Rabbit: { animal: 'Rabbit', traits: ['gentle', 'elegant', 'diplomatic', 'perceptive'], light: 'Grace, tact and a calming presence.', shadow: 'Conflict avoidance, timidity, and retreat under pressure.' },
  Dragon: { animal: 'Dragon', traits: ['ambitious', 'charismatic', 'energetic', 'visionary'], light: 'Vitality, confidence and big-picture vision.', shadow: 'Arrogance, impatience, and expecting the world to follow.' },
  Snake: { animal: 'Snake', traits: ['wise', 'intuitive', 'discreet', 'refined'], light: 'Depth, strategy and quiet magnetism.', shadow: 'Secrecy, suspicion and holding grudges.' },
  Horse: { animal: 'Horse', traits: ['free-spirited', 'energetic', 'sociable', 'direct'], light: 'Enthusiasm, independence and momentum.', shadow: 'Restlessness, impatience, and bolting when things get heavy.' },
  Goat: { animal: 'Goat', traits: ['creative', 'gentle', 'empathetic', 'artistic'], light: 'Kindness, artistry and emotional sensitivity.', shadow: 'Worry, indecision, and leaning too hard on others.' },
  Monkey: { animal: 'Monkey', traits: ['inventive', 'playful', 'clever', 'curious'], light: 'Ingenuity, humor and problem-solving flair.', shadow: 'Mischief, restlessness, and cleverness used to dodge commitment.' },
  Rooster: { animal: 'Rooster', traits: ['observant', 'honest', 'organized', 'confident'], light: 'Precision, candor and pride in good work.', shadow: 'Criticism, vanity, and needing to be right.' },
  Dog: { animal: 'Dog', traits: ['loyal', 'just', 'protective', 'honest'], light: 'Faithfulness, fairness and a strong moral compass.', shadow: 'Worry, cynicism, and harsh judgment of self and others.' },
  Pig: { animal: 'Pig', traits: ['generous', 'sincere', 'easygoing', 'warm-hearted'], light: 'Good faith, generosity and real enjoyment of life.', shadow: 'Naivety, overindulgence, and avoiding unpleasant truths.' },
};

/** The traditional character for each animal, used as its glyph. */
export const ANIMAL_GLYPHS: Record<Animal, string> = {
  Rat: '鼠', Ox: '牛', Tiger: '虎', Rabbit: '兔', Dragon: '龙', Snake: '蛇',
  Horse: '马', Goat: '羊', Monkey: '猴', Rooster: '鸡', Dog: '狗', Pig: '猪',
};

export const ELEMENT_MEANINGS: Record<CElement, ElementMeaning> = {
  Wood: { element: 'Wood', nature: 'Growth, vision and flexibility: energy that reaches upward.', inRelationships: 'Encourages and expands. Wood feeds Fire and can overwhelm Earth.' },
  Fire: { element: 'Fire', nature: 'Passion, warmth and expression: energy that radiates outward.', inRelationships: 'Inspires and excites. Fire feeds Earth and can melt Metal.' },
  Earth: { element: 'Earth', nature: 'Stability, nourishment and practicality: energy that centers.', inRelationships: 'Steadies and supports. Earth feeds Metal and can dam Water.' },
  Metal: { element: 'Metal', nature: 'Clarity, discipline and resolve: energy that refines.', inRelationships: 'Structures and sharpens. Metal feeds Water and can cut Wood.' },
  Water: { element: 'Water', nature: 'Intuition, adaptability and depth: energy that flows.', inRelationships: 'Soothes and connects. Water feeds Wood and can douse Fire.' },
};
