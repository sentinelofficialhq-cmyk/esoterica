/**
 * Neville Goddard (1905–1972) taught that imagination creates reality. These are Esoterica's own
 * paraphrases of his teaching and practices, not quotations; the Learn articles say more.
 */

export type PracticeId = 'scene' | 'revision' | 'end' | 'iam' | 'diet';

export type Practice = {
  id: PracticeId;
  title: string;
  /** One line for lists. */
  short: string;
  when: string;
  /** Suggested length; 0 means no timer. */
  minutes: number;
  steps: string[];
  /** What to write afterwards. */
  journal: string;
  caution: string;
};

const CARE = 'This is an inner practice, not a promise of results, and never a substitute for action or for medical, legal or financial help.';

export const NEVILLE_PRACTICES: Practice[] = [
  {
    id: 'scene',
    title: 'A scene before sleep',
    short: 'Live one short scene that implies your wish is already fulfilled, in the drowsy state before sleep.',
    when: 'At bedtime, or any quiet drowsy moment',
    minutes: 10,
    steps: [
      'Decide what you want. Then ask: if it were already done, what would I see, hear or feel?',
      'Choose one short scene that implies it is fulfilled: a friend congratulating you, a key in your hand, a message you have been waiting for.',
      'Lie down and let your body grow heavy and drowsy, the state Neville called akin to sleep.',
      'Enter the scene in the first person, as if you are there now, rather than watching yourself from outside.',
      'Loop it gently until it feels natural and real, then let yourself drift off in that feeling.',
    ],
    journal: 'What scene did you use, and how did it feel by the end?',
    caution: `${CARE} If the practice stirs up anxiety, stop, ground yourself in the room, and talk to someone you trust.`,
  },
  {
    id: 'revision',
    title: 'Revising the day',
    short: 'At night, replay one moment of the day the way you wish it had gone.',
    when: 'In the evening, before sleep',
    minutes: 8,
    steps: [
      'Review the day and choose one moment you wish had gone differently.',
      'Relax, then replay it in imagination the way you would have liked it to go, seen from inside your own eyes.',
      'Repeat the new version until it feels as vivid as the memory.',
      'Notice how you feel about the day now, and write a line about it.',
    ],
    journal: 'Which moment did you revise, and what changed in how you feel about it?',
    caution: `Revision changes your inner response; it does not erase what happened. If something harmful happened, also look for real support. ${CARE}`,
  },
  {
    id: 'end',
    title: 'Living in the end',
    short: 'Write and act from the feeling that your wish is already done.',
    when: 'In the morning, or whenever you plan your day',
    minutes: 0,
    steps: [
      'Write your wish as already true, in the present or past tense: “I am so glad that…”.',
      'Ask how you would think, speak and carry yourself today if it were done.',
      'Choose one small, real action today that fits that version of you.',
      'Whenever doubt shows up, return to the feeling of the end rather than arguing with the doubt.',
    ],
    journal: 'Write your wish as already fulfilled, and the one action you will take today.',
    caution: `Feeling it is done goes hand in hand with doing the practical things in front of you. ${CARE}`,
  },
  {
    id: 'iam',
    title: 'The “I AM” assumption',
    short: 'Notice how you finish “I am…”, and choose the statement you want to live from.',
    when: 'Any time; a minute is enough',
    minutes: 3,
    steps: [
      'Notice how you complete the sentence “I am…” through the day, out loud and in your head.',
      'Choose the statement you want to live from (“I am ready”, “I am loved”, “I am well supported”) and say it slowly, with feeling.',
      'Rest for a minute in the plain sense of being, before any label at all.',
    ],
    journal: 'Which “I am” did you catch yourself saying, and which one did you choose?',
    caution: `Statements are for reorienting yourself, not for pushing down what you really feel. Feel what you feel first. ${CARE}`,
  },
  {
    id: 'diet',
    title: 'A mental diet',
    short: 'For one day, notice your inner conversations and revise the ones that run against what you want.',
    when: 'All day, then a few minutes in the evening',
    minutes: 0,
    steps: [
      'For one day, notice your inner conversations, especially the arguments and worries you rehearse.',
      'When you catch one, gently replay it the way it would go if what you want were already true.',
      'In the evening, note how often you caught yourself and what shifted.',
    ],
    journal: 'Which inner conversation kept coming back, and how did you revise it?',
    caution: `Noticing is the practice; there is no failing it. ${CARE}`,
  },
];

export const practiceById = (id: string): Practice | undefined => NEVILLE_PRACTICES.find((p) => p.id === id);

export type Teaching = { id: string; title: string; summary: string };

/** Neville's core ideas, paraphrased. */
export const NEVILLE_TEACHINGS: Teaching[] = [
  { id: 'imagination', title: 'Imagination creates reality', summary: 'What you persistently imagine and accept as true tends to take shape in your experience; the inner act comes first.' },
  { id: 'assumption', title: 'Assume the wish fulfilled', summary: 'Rather than hoping for something, assume the feeling that it is already yours, and think from that state rather than toward it.' },
  { id: 'feeling', title: 'Feeling is the secret', summary: 'An idea becomes powerful when it is felt as real. Neville stressed the emotional tone of an imagined scene above its details.' },
  { id: 'i-am', title: 'I AM', summary: 'He read the divine name in Exodus 3:14 as awareness itself: whatever you join to “I am” with conviction, you begin to become.' },
  { id: 'sats', title: 'The state akin to sleep', summary: 'The drowsy edge of sleep is when an imagined scene sinks in most easily, so he taught people to use it.' },
  { id: 'revision', title: 'Revision', summary: 'Rewriting the day in imagination each night, so that old reactions do not keep repeating.' },
  { id: 'scripture', title: 'The Bible as a drama of the mind', summary: 'He read scripture as a psychological drama played out in consciousness, not mainly as history.' },
  { id: 'promise', title: 'The Promise', summary: 'In later years he spoke of mystical experiences that he believed revealed the spiritual birth awaiting everyone, which he called the Promise.' },
];
