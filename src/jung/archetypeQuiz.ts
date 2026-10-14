import { ARCHETYPE_IDS, ARCHETYPES, type ArchetypeId } from '@/content/archetypes';
import type { ArchetypeResult } from '@/jung/types';

export type ArchetypeItem = { id: string; prompt: string; options: { text: string; archetype: ArchetypeId }[] };

const Q = (id: string, prompt: string, ...pairs: [ArchetypeId, string][]): ArchetypeItem => ({
  id,
  prompt,
  options: pairs.map(([archetype, text]) => ({ archetype, text })),
});

/** 24 original items in 8 rounds; each round uses all twelve archetypes once. */
export const ARCHETYPE_ITEMS: ArchetypeItem[] = [
  Q('a1', 'What makes a day feel well spent?', ['innocent', 'Everyone was kind and nothing went wrong'], ['hero', 'I faced something hard and won'], ['sage', 'I understood something new'], ['lover', 'I shared a beautiful moment with someone']),
  Q('a2', 'In a team, you naturally become…', ['everyman', 'The reliable one everyone can relate to'], ['caregiver', 'The one who looks after people'], ['rebel', 'The one who questions how things are done'], ['magician', 'The one who makes the impossible happen']),
  Q('a3', 'Your ideal weekend is…', ['explorer', 'Somewhere I have never been'], ['creator', 'Making something with my hands or mind'], ['jester', 'Laughing with friends, no plans'], ['ruler', 'Getting life in order and planning ahead']),

  Q('a4', 'What you fear most is…', ['innocent', 'Doing something wrong and being punished'], ['caregiver', 'Being selfish or ungrateful'], ['explorer', 'Being trapped in a life that isn’t mine'], ['jester', 'Being bored, or boring']),
  Q('a5', 'The compliment that would mean the most:', ['everyman', 'You’re so easy to be around'], ['hero', 'You’re brave'], ['creator', 'You’re so original'], ['ruler', 'You’re a natural leader']),
  Q('a6', 'You are drawn to stories about…', ['rebel', 'Outsiders who overturn the system'], ['lover', 'Great romances'], ['sage', 'Seekers of truth'], ['magician', 'Transformation against the odds']),

  Q('a7', 'When something goes wrong, your first instinct is to…', ['innocent', 'Believe it will work out'], ['rebel', 'Break the rules if they are the problem'], ['creator', 'Invent a new way around it'], ['sage', 'Step back and analyze what happened']),
  Q('a8', 'Home should feel…', ['everyman', 'Down-to-earth and welcoming to all'], ['explorer', 'Like base camp for the next trip'], ['lover', 'Beautiful, warm and sensual'], ['ruler', 'Orderly and secure']),
  Q('a9', 'People thank you most for…', ['hero', 'Stepping up when it counts'], ['caregiver', 'Being there when they needed you'], ['jester', 'Making them laugh'], ['magician', 'Helping them see things differently']),

  Q('a10', 'You would like your life to be…', ['innocent', 'Simple and good'], ['everyman', 'Connected and fair'], ['magician', 'Transformative'], ['ruler', 'Stable and successful']),
  Q('a11', 'Your relationship with risk:', ['hero', 'I take risks to prove myself'], ['explorer', 'Risk is the price of freedom'], ['sage', 'I study it before deciding'], ['jester', 'Life is too short not to']),
  Q('a12', 'What gives your work meaning?', ['caregiver', 'Helping others'], ['rebel', 'Challenging what is broken'], ['lover', 'Doing what I love with people I love'], ['creator', 'Leaving something original behind']),

  Q('a13', 'Which word draws you most?', ['innocent', 'Faith'], ['explorer', 'Freedom'], ['lover', 'Passion'], ['magician', 'Vision']),
  Q('a14', 'At a party you are probably…', ['everyman', 'Chatting easily with anyone'], ['rebel', 'In a corner questioning everything'], ['sage', 'Deep in one long conversation'], ['jester', 'The life of it']),
  Q('a15', 'When a project starts, your role is to…', ['hero', 'Take on the hardest part'], ['caregiver', 'Make sure everyone is okay'], ['creator', 'Dream up the concept'], ['ruler', 'Set the structure and the plan']),

  Q('a16', 'Your shadow side might be…', ['innocent', 'Denial when things get ugly'], ['jester', 'Joking to avoid feeling'], ['creator', 'Perfectionism'], ['ruler', 'Needing control']),
  Q('a17', 'You would rather be known as…', ['everyman', 'Genuine'], ['hero', 'Courageous'], ['lover', 'Devoted'], ['magician', 'Inspiring']),
  Q('a18', 'Change excites you when it…', ['caregiver', 'Helps people I care about'], ['explorer', 'Opens new horizons'], ['rebel', 'Overthrows something unjust'], ['sage', 'Leads to deeper understanding']),

  Q('a19', 'Under pressure you…', ['innocent', 'Hold on to hope'], ['hero', 'Push harder'], ['rebel', 'Get defiant'], ['ruler', 'Take charge']),
  Q('a20', 'The best gift is…', ['everyman', 'Something practical we can share'], ['caregiver', 'Something that shows you care'], ['sage', 'A great book or idea'], ['creator', 'Something handmade']),
  Q('a21', 'You recharge by…', ['explorer', 'Going somewhere new'], ['lover', 'Closeness and pleasure'], ['jester', 'Play and silliness'], ['magician', 'Ritual, meditation, or something mystical']),

  Q('a22', 'What matters most in a leader?', ['innocent', 'Goodness'], ['caregiver', 'Compassion'], ['magician', 'Vision that changes things'], ['sage', 'Wisdom']),
  Q('a23', 'Your dream project is…', ['everyman', 'A community everyone feels part of'], ['explorer', 'A journey around the world'], ['creator', 'A work of art or an invention'], ['jester', 'Something that makes people laugh']),
  Q('a24', 'You admire most…', ['hero', 'Someone who overcame great odds'], ['rebel', 'Someone who broke the mold'], ['lover', 'Someone who loves wholeheartedly'], ['ruler', 'Someone who built something that lasts']),
];

/** `answers[i]` is the chosen option index (0–3) for item i. */
export function scoreArchetypes(answers: number[], takenAt: string): ArchetypeResult {
  if (answers.length !== ARCHETYPE_ITEMS.length) throw new Error(`Answer all ${ARCHETYPE_ITEMS.length} questions`);
  const counts = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, 0])) as Record<ArchetypeId, number>;
  ARCHETYPE_ITEMS.forEach((item, i) => {
    const opt = item.options[answers[i]];
    if (opt) counts[opt.archetype] += 1;
  });
  const top = [...ARCHETYPE_IDS].sort((a, b) => counts[b] - counts[a] || ARCHETYPE_IDS.indexOf(a) - ARCHETYPE_IDS.indexOf(b)).slice(0, 3);
  return { top, counts, shadowForm: ARCHETYPES[top[0]].shadowForm, takenAt };
}
