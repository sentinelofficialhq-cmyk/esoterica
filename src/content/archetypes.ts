/**
 * The twelve archetypes are a later popular model (Pearson; Mark & Pearson) built on Jung's ideas.
 * The four structural archetypes (Persona, Shadow, Anima/Animus, Self) are Jung's own.
 */
export const ARCHETYPE_IDS = [
  'innocent', 'everyman', 'hero', 'caregiver', 'explorer', 'rebel',
  'lover', 'creator', 'jester', 'sage', 'magician', 'ruler',
] as const;
export type ArchetypeId = (typeof ARCHETYPE_IDS)[number];

export type Archetype = {
  id: ArchetypeId;
  name: string;
  drive: string;
  gift: string;
  fear: string;
  shadowForm: string;
  jungNote: string;
};

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  innocent: {
    id: 'innocent', name: 'Innocent', drive: 'To be safe and happy; to find paradise', gift: 'Faith, optimism and goodness',
    fear: 'Doing wrong and being punished', shadowForm: 'Denial: refusing to see what is painful',
    jungNote: "Related to Jung's divine child: new beginnings and the promise of wholeness.",
  },
  everyman: {
    id: 'everyman', name: 'Everyman', drive: 'To belong and connect', gift: 'Realism, empathy and solidarity',
    fear: 'Being left out, or standing out', shadowForm: 'The conformist who disappears into the crowd',
    jungNote: 'Echoes Jung’s warning about mass-mindedness: belonging is human, but individuation needs a self that is more than the group.',
  },
  hero: {
    id: 'hero', name: 'Hero', drive: 'To prove worth through courageous action', gift: 'Courage, discipline and competence',
    fear: 'Weakness and vulnerability', shadowForm: 'The bully, or the burned-out warrior who must always win',
    jungNote: 'The hero myth is central for Jung: the ego’s struggle to free itself from the unconscious, and its later need to return.',
  },
  caregiver: {
    id: 'caregiver', name: 'Caregiver', drive: 'To protect and care for others', gift: 'Compassion and generosity',
    fear: 'Selfishness and ingratitude', shadowForm: 'The martyr, or the smothering helper',
    jungNote: 'Close to the Great Mother archetype: nourishing, and in its shadow, devouring.',
  },
  explorer: {
    id: 'explorer', name: 'Explorer', drive: 'To find yourself by discovering the world', gift: 'Independence and authenticity',
    fear: 'Being trapped by conformity', shadowForm: 'The perpetual wanderer who never commits',
    jungNote: 'Recalls the puer aeternus, the eternal youth Jung and Marie-Louise von Franz described, who resists being pinned down.',
  },
  rebel: {
    id: 'rebel', name: 'Rebel', drive: 'To overturn what is not working', gift: 'Radical freedom and the courage to break rules',
    fear: 'Powerlessness', shadowForm: 'Destruction for its own sake',
    jungNote: 'The rebel often carries the culture’s shadow: whatever the collective has repressed and now needs to face.',
  },
  lover: {
    id: 'lover', name: 'Lover', drive: 'To be close to the people and things you love', gift: 'Passion, gratitude and appreciation',
    fear: 'Being alone and unloved', shadowForm: 'Losing yourself in another: obsession or people-pleasing',
    jungNote: 'Bound up with the anima and animus: the image of the beloved often carries parts of our own soul.',
  },
  creator: {
    id: 'creator', name: 'Creator', drive: 'To make things of lasting value', gift: 'Imagination and craft',
    fear: 'Mediocrity', shadowForm: 'Perfectionism, or creating to escape life',
    jungNote: 'Jung saw creative work as the unconscious seeking form; his own Red Book began that way.',
  },
  jester: {
    id: 'jester', name: 'Jester', drive: 'To live in the moment with joy', gift: 'Humor, lightness and play',
    fear: 'Boredom', shadowForm: 'Cruel jokes, or humor used to avoid feeling',
    jungNote: 'Kin to Jung’s trickster, who overturns order so that something new and truer can appear.',
  },
  sage: {
    id: 'sage', name: 'Sage', drive: 'To understand the world through truth', gift: 'Wisdom and intelligence',
    fear: 'Being deceived, or ignorance', shadowForm: 'Cold detachment; the know-it-all',
    jungNote: 'The wise old man or woman is one of Jung’s central archetypes; Philemon was his own inner guide.',
  },
  magician: {
    id: 'magician', name: 'Magician', drive: 'To understand how things work and transform them', gift: 'Vision and transformation',
    fear: 'Unintended consequences', shadowForm: 'Manipulation',
    jungNote: 'The magician lives where Jung located the transformation of psychic energy: symbol, ritual and alchemy.',
  },
  ruler: {
    id: 'ruler', name: 'Ruler', drive: 'To create order and stability', gift: 'Responsibility and leadership',
    fear: 'Chaos, or being overthrown', shadowForm: 'The tyrant',
    jungNote: 'The king carries order for the whole realm: healthy when it serves, tyrannical when it is the ego wearing a crown.',
  },
};

export type CoreArchetype = { id: 'persona' | 'shadow' | 'anima' | 'self'; name: string; summary: string; reflectionQuestions: string[] };

export const CORE_ARCHETYPES: CoreArchetype[] = [
  {
    id: 'persona',
    name: 'Persona',
    summary: 'The mask we wear to meet the world: roles, manners, reputation. It is necessary, but trouble begins when we mistake the mask for the face.',
    reflectionQuestions: [
      'Which version of you do people at work meet, and how different is it from who you are alone?',
      'What are you afraid people would see if your persona slipped?',
      'Which of your roles feels most like a costume lately?',
    ],
  },
  {
    id: 'shadow',
    name: 'Shadow',
    summary: 'Everything we do not want to be, or do not know we are. It holds what we reject in ourselves, and also our unlived gifts: the gold in the shadow.',
    reflectionQuestions: [
      'Which trait in other people irritates you out of all proportion?',
      'What part of yourself did you learn to hide as a child, and why?',
      'What quality do you secretly envy in others?',
    ],
  },
  {
    id: 'anima',
    name: 'Anima / Animus',
    summary: 'The inner “other”: the image of the soul we often meet first in projection, in partners, muses and idols. Making it conscious deepens both relationships and creativity.',
    reflectionQuestions: [
      'What qualities do you fall for again and again in other people?',
      'Which figure in your dreams feels most alive or mysterious?',
      'What would change if you found that quality in yourself?',
    ],
  },
  {
    id: 'self',
    name: 'Self',
    summary: 'The center and totality of the psyche: the organizing wholeness that guides individuation, often symbolized by mandalas, circles and the divine child.',
    reflectionQuestions: [
      'When have you felt most whole, as if every part of you were in the room?',
      'What keeps returning in your life, asking to be lived?',
      'If your life were a circle, what would sit at its center?',
    ],
  },
];
