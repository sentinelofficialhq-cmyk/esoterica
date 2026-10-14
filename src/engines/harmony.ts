/**
 * Esoterica's number families: Mind {1,5,7}, Builder {2,4,8}, Heart {3,6,9}.
 * Same family = natural ease; Mind × Builder = the friction pair; other pairs are neutral.
 */
export type Family = 'mind' | 'builder' | 'heart';
export type Harmony = 'same' | 'family' | 'friction' | 'neutral';

export const familyOf = (root: number): Family =>
  [1, 5, 7].includes(root) ? 'mind' : [2, 4, 8].includes(root) ? 'builder' : 'heart';

export function numberHarmony(a: number, b: number): Harmony {
  if (a === b) return 'same';
  const fa = familyOf(a);
  const fb = familyOf(b);
  if (fa === fb) return 'family';
  if ((fa === 'mind' && fb === 'builder') || (fa === 'builder' && fb === 'mind')) return 'friction';
  return 'neutral';
}
