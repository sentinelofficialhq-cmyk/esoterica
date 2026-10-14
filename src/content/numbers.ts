import { reduce } from '@/engines/numerology';

export type NumberMeaning = {
  n: number;
  title: string;
  keywords: string[];
  light: string;
  shadow: string;
  jungNote: string;
};

export type KarmicMeaning = { n: number; lesson: string };

export const NUMBER_MEANINGS: Record<number, NumberMeaning> = {
  1: {
    n: 1,
    title: 'The Initiator',
    keywords: ['independence', 'will', 'beginnings', 'leadership'],
    light: 'Self-starting energy that turns an idea into a first step. You trust your own judgment and can stand alone when others hesitate.',
    shadow: 'Willfulness, impatience and a fear of depending on anyone. Independence can harden into isolation or a need to always be first.',
    jungNote: "The 1 carries strong ego-consciousness: the heroic will to separate and stand apart. Individuation asks the 1 to discover that the ego is not the whole of the Self.",
  },
  2: {
    n: 2,
    title: 'The Diplomat',
    keywords: ['partnership', 'sensitivity', 'cooperation', 'intuition'],
    light: 'A gift for reading the room and holding two sides together. You notice what others miss and make collaboration feel safe.',
    shadow: 'Self-erasure, over-accommodating, and resentment that builds when your own needs stay unspoken.',
    jungNote: "Two is the number of the pair of opposites. Jung saw the tension between opposites as the engine of psychic growth; the 2's task is to hold that tension without collapsing into one side.",
  },
  3: {
    n: 3,
    title: 'The Expresser',
    keywords: ['creativity', 'communication', 'joy', 'charm'],
    light: 'Words, color and humor come easily. You lift a room and turn feeling into expression.',
    shadow: 'Scattered energy, performing instead of feeling, and using charm to avoid depth.',
    jungNote: "Jung linked three with movement and process. The 3's persona is often bright and social; the work is to let the less polished feelings have a voice too.",
  },
  4: {
    n: 4,
    title: 'The Builder',
    keywords: ['structure', 'discipline', 'reliability', 'foundations'],
    light: 'Steady effort, practical sense and loyalty. You make things real and you make them last.',
    shadow: 'Rigidity, over-control and a fear of chaos that keeps life too small.',
    jungNote: 'For Jung, four was the number of wholeness: the quaternity, the four functions, the squared circle of the mandala. The 4 builds containers; the deeper invitation is to leave room in them for the irrational.',
  },
  5: {
    n: 5,
    title: 'The Explorer',
    keywords: ['freedom', 'change', 'curiosity', 'adventure'],
    light: 'Adaptable, quick and alive to experience. You thrive on variety and help others loosen up.',
    shadow: 'Restlessness, excess, and running from commitment the moment life asks you to stay.',
    jungNote: "Five is the quaternity plus one, the quinta essentia of the alchemists Jung studied. The 5 hunts for the spark in experience; individuation asks whether the hunt is a flight from the Self or a path toward it.",
  },
  6: {
    n: 6,
    title: 'The Nurturer',
    keywords: ['responsibility', 'care', 'harmony', 'home'],
    light: 'Warmth, devotion and a feel for beauty. You make places and people feel looked after.',
    shadow: 'Martyrdom, control disguised as care, and perfectionism about how others should live.',
    jungNote: "The 6's caregiving can constellate the Great Mother archetype: nourishing, but devouring when care turns possessive. The task is to mother yourself as well.",
  },
  7: {
    n: 7,
    title: 'The Seeker',
    keywords: ['insight', 'solitude', 'analysis', 'spirit'],
    light: 'Depth, discernment and an appetite for truth. You see beneath surfaces and value the inner life.',
    shadow: 'Withdrawal, suspicion, and a cool detachment that keeps people at arm’s length.',
    jungNote: 'Seven runs through myth as the number of initiation: seven planets, seven days, seven stages of the alchemical work. The 7 is often introverted; the inner world is home, and the risk is losing touch with the body and with others.',
  },
  8: {
    n: 8,
    title: 'The Executive',
    keywords: ['power', 'ambition', 'mastery', 'abundance'],
    light: 'Authority, stamina and a head for resources. You can carry weight and make big things happen.',
    shadow: 'Domination, overwork, and measuring your worth in money or control.',
    jungNote: "Eight doubles the four: wholeness in the material world. The 8's shadow often holds the tenderness and vulnerability that the drive for power was built to protect.",
  },
  9: {
    n: 9,
    title: 'The Humanitarian',
    keywords: ['compassion', 'completion', 'idealism', 'wisdom'],
    light: 'Broad-hearted, generous and attuned to the larger story. You help endings become meaningful.',
    shadow: 'Martyred idealism, distance from your own personal needs, and difficulty letting go.',
    jungNote: "Nine closes the cycle. Jung's own Life Path was 9 (36/9). The 9 feels the collective, and must still tend the personal, or the collective becomes a place to hide.",
  },
  11: {
    n: 11,
    title: 'The Illuminator',
    keywords: ['intuition', 'inspiration', 'sensitivity', 'vision'],
    light: 'Heightened intuition and the capacity to inspire. You sense meanings and possibilities others cannot see yet.',
    shadow: 'Nervous tension, self-doubt, and being flooded by everything you pick up.',
    jungNote: 'Master 11 lives close to the unconscious; intuition and dreams speak loudly. Jung would say: give the images form through writing, art or active imagination, or they will find their way out as anxiety.',
  },
  22: {
    n: 22,
    title: 'The Master Builder',
    keywords: ['vision made real', 'scale', 'discipline', 'legacy'],
    light: 'The rare pairing of vision and practicality: dreams that arrive with blueprints.',
    shadow: 'Crushing pressure, overwhelm, and shrinking from the size of your own potential.',
    jungNote: "22 holds the 11's intuition inside the 4's structure. The shadow danger is inflation: identifying with the grand vision instead of serving it.",
  },
  33: {
    n: 33,
    title: 'The Master Teacher',
    keywords: ['compassion', 'healing', 'service', 'guidance'],
    light: 'Wholehearted care with the wisdom to guide others toward their own growth.',
    shadow: 'Self-sacrifice, burnout, and carrying everyone else’s burdens.',
    jungNote: 'The 33 carries the healer archetype. Jung often spoke of the wounded healer, who can heal because they have tended their own wound. Rest is part of the work.',
  },
};

export const KARMIC_MEANINGS: Record<number, KarmicMeaning> = {
  13: { n: 13, lesson: 'Effort over shortcuts: steady, focused work and finishing what you start. Cutting corners keeps resetting the lesson.' },
  14: { n: 14, lesson: 'Freedom with moderation: changing without excess. The lesson is self-command in the face of restlessness and temptation.' },
  16: { n: 16, lesson: 'Humility and rebirth: old ego structures may fall so something truer can be built. Let pride go and rebuild from the inside.' },
  19: { n: 19, lesson: 'Independence with interdependence: standing on your own without refusing help. Self-reliance and receiving can live together.' },
};

const sumDigits = (n: number) => String(n).split('').reduce((a, ch) => a + Number(ch), 0);

/** Meaning for a reduced value (1–9 or a master number); anything else falls back to its root. */
export function meaningFor(value: number): NumberMeaning {
  return NUMBER_MEANINGS[value] ?? NUMBER_MEANINGS[sumDigits(value) % 9 || 9];
}

export type LoveAndWork = { love: string; career: string };

/** How each number tends to love and to work. Original writing, read as tendencies, never verdicts. */
export const LOVE_AND_WORK: Record<number, LoveAndWork> = {
  1: {
    love: 'In love the 1 wants a partner, not a follower or a project. Attraction runs to people with their own fire. The growth edge is letting someone in before everything is figured out, and asking for help without feeling smaller.',
    career: 'Best where you can start things and own the outcome: founding, leading, freelancing, first-to-market roles. Long chains of approval drain you. Pair your drive with someone who loves finishing.',
  },
  2: {
    love: 'The 2 is built for partnership: attentive, tender, quick to sense a mood. Love deepens when you say what you need out loud instead of hoping it will be noticed, and when harmony is not bought with silence.',
    career: 'Thrives in roles that join people together: mediation, counseling, design, diplomacy, any team where tact is a skill. You do your best work beside someone you trust; noisy competition wears you down.',
  },
  3: {
    love: 'The 3 courts with words, play and warmth, and needs a partner who laughs and listens. The deeper intimacy comes when you share the moods you usually decorate with charm.',
    career: 'Made for expression: writing, performance, teaching, marketing, design, anything with an audience. Routine without creativity dulls you; choose work where your voice is part of the product.',
  },
  4: {
    love: 'The 4 loves through reliability: showing up, keeping promises, building a home. Partners feel safe with you. Let spontaneity in, and remember that feelings do not need a plan to be real.',
    career: 'Strong in systems, building and craft: engineering, operations, finance, the trades, project management. You turn chaos into order; protect yourself from carrying everyone else’s load.',
  },
  5: {
    love: 'The 5 falls for curiosity and adventure and needs room to breathe. Love lasts when freedom is shared rather than taken: travel together, change together, and let commitment be a choice you keep making.',
    career: 'Thrives on variety, movement and people: sales, travel, media, entrepreneurship, roles with new problems every week. Rigid schedules feel like a cage, so build structure you choose rather than structure imposed.',
  },
  6: {
    love: 'The 6 loves wholeheartedly and naturally takes care. Your gift is devotion; the trap is caring as a way to control or to be needed. The healthiest love lets your partner care for you too.',
    career: 'Called to service and beauty: healing, teaching, hospitality, design, community work, family business. You do well where care is valued; watch for taking on responsibility that is not yours.',
  },
  7: {
    love: 'The 7 needs depth over volume: a partner who respects silence and can meet you in ideas and the inner life. Trust comes slowly. Let it come, and share your inner world before it feels perfectly safe.',
    career: 'Built for depth: research, analysis, science, technology, writing, spiritual and psychological work. You need quiet time to think; noise and shallow tasks drain you.',
  },
  8: {
    love: 'The 8 brings strength, loyalty and a wish to provide. Love asks you to set down the role of the one in charge and let a partner see your softer side; respect grows when power is shared.',
    career: 'Made for authority and scale: business, finance, law, leadership, building organizations. You understand money and influence; the long test is using them in a way you would be proud of.',
  },
  9: {
    love: 'The 9 loves broadly and compassionately, sometimes more easily in general than in particular. Intimacy grows when you let one person matter personally and do not hide behind the bigger picture.',
    career: 'Drawn to work with meaning: the arts, humanitarian work, teaching, healing, causes larger than yourself. Endings come easily to you; finish cleanly and the next chapter opens.',
  },
  11: {
    love: 'The 11 feels everything and senses a partner’s inner weather at once. You need a steady, kind partner and real rest. Name your intuitions gently; not everyone can follow how you knew.',
    career: 'Inspired work suits you: counseling, the arts, spiritual teaching, innovation, anything that carries insight to others. Nervous energy runs high, so give it structure and recovery time.',
  },
  22: {
    love: 'The 22 brings the 4’s steadiness to love with a visionary’s scope. Partners need to know they matter more than the plan. Make time that has no purpose except being together.',
    career: 'The master builder: large projects, institutions, architecture, systems that last. Your vision needs patient, practical steps; delegate generously so its weight does not crush you.',
  },
  33: {
    love: 'The 33 loves as a healer and teacher: generous, protective, deeply caring. The lesson is receiving: letting a partner hold you sometimes, and not turning love into a duty.',
    career: 'Drawn to healing, teaching, ministry, counseling and creative work that lifts people up. You give a great deal; burnout is the main risk, so build rest and boundaries into the work itself.',
  },
};

/** Love and career guidance for a number; compounds reduce first (29 → 11). */
export function loveAndWork(value: number): LoveAndWork {
  return LOVE_AND_WORK[value] ?? LOVE_AND_WORK[reduce(value).value];
}
