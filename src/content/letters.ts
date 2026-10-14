export type LetterMeaning = { letter: string; value: number; traits: string[]; asCornerstone: string };

const L = (letter: string, value: number, traits: string[], asCornerstone: string): LetterMeaning => ({
  letter,
  value,
  traits,
  asCornerstone,
});

/** Letter meanings in the folk "cornerstone" tradition; value is the Pythagorean number. */
export const LETTER_MEANINGS: Record<string, LetterMeaning> = Object.fromEntries(
  [
    L('A', 1, ['initiative', 'ambition', 'independence'], 'Starts things with confidence and would rather lead than follow.'),
    L('B', 2, ['sensitivity', 'cooperation', 'emotional depth'], 'Approaches life gently and values close, loyal bonds.'),
    L('C', 3, ['expression', 'optimism', 'creativity'], 'Meets the world with words and wit, and needs outlets for self-expression.'),
    L('D', 4, ['determination', 'order', 'practicality'], 'Grounded and methodical; builds slowly and means it.'),
    L('E', 5, ['curiosity', 'communication', 'freedom'], 'Quick and social; craves new experiences and new ideas.'),
    L('F', 6, ['responsibility', 'warmth', 'devotion'], "Family-minded and protective; picks up other people's needs readily."),
    L('G', 7, ['introspection', 'intelligence', 'self-reliance'], 'Thinks deeply and privately; trusts personal research over hearsay.'),
    L('H', 8, ['ambition', 'authority', 'drive'], 'Aims high and handles resources well; drawn to achievement.'),
    L('I', 9, ['compassion', 'sensitivity', 'artistry'], 'Feels intensely and idealistically; needs balance between heart and boundaries.'),
    L('J', 1, ['honesty', 'perseverance', 'aspiration'], 'Purposeful and principled; keeps going toward a chosen goal.'),
    L('K', 2, ['intuition', 'charisma', 'intensity'], 'Senses undercurrents; an inspiring presence with strong reactions.'),
    L('L', 3, ['generosity', 'reason', 'sociability'], 'Thoughtful and kind; weighs things before acting and enjoys company.'),
    L('M', 4, ['diligence', 'stability', 'endurance'], 'Hardworking and dependable; prefers security and steady growth.'),
    L('N', 5, ['imagination', 'originality', 'change'], 'Inventive and opinionated; needs room to think differently.'),
    L('O', 6, ['loyalty', 'patience', 'principle'], 'Holds high standards and a strong moral compass; protective of loved ones.'),
    L('P', 7, ['knowledge', 'reserve', 'wit'], 'Inquiring and private; reveals the inner self to only a few.'),
    L('Q', 8, ['originality', 'magnetism', 'self-direction'], 'Unusual and compelling; follows an internal compass.'),
    L('R', 9, ['tolerance', 'energy', 'humanitarianism'], 'Big-hearted and energetic; can swing between calm and fire.'),
    L('S', 1, ['warmth', 'charm', 'ambition'], 'Emotional and magnetic; acts on feeling and recovers quickly.'),
    L('T', 2, ['partnership', 'restlessness', 'growth'], 'Seeks connection and shared purpose; can take on too much.'),
    L('U', 3, ['receptivity', 'luck', 'creativity'], 'Open and gifted; must decide what to hold on to and what to let go.'),
    L('V', 4, ['vision', 'industry', 'intuition'], 'A practical dreamer who builds lasting things from big ideas.'),
    L('W', 5, ['expression', 'persistence', 'drama'], 'Communicative and determined; gets back up after setbacks.'),
    L('X', 6, ['sensuality', 'responsibility', 'depth'], 'Intense and caring; carries a quiet inner complexity.'),
    L('Y', 7, ['independence', 'freedom', 'questioning'], 'Free-spirited and searching; resists being told what to do.'),
    L('Z', 8, ['optimism', 'confidence', 'determination'], 'Hopeful and decisive; aims to see things through.'),
  ].map((m) => [m.letter, m]),
);
