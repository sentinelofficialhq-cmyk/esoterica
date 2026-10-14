import type { Animal } from '@/engines/chinese';
import type { Profile } from '@/engines/profile';
import type { WElement } from '@/engines/western';
import type { AlignmentResult } from '@/jung/types';

export type AlignmentQuestion = { id: string; text: string; source: 'lifePath' | 'element' | 'animal' };

const BY_NUMBER: Record<number, [string, string]> = {
  1: ['I take the lead without waiting to be asked.', 'I trust my own judgment over other people’s opinions.'],
  2: ['I notice what other people need before they say it.', 'I prefer cooperation to competition.'],
  3: ['I express myself easily, in words or in art.', 'People find me playful and fun.'],
  4: ['I like structure, plans and steady routines.', 'I finish what I start, even when it gets dull.'],
  5: ['I get restless when life stays the same for long.', 'I am quick to try new things.'],
  6: ['I am the one people rely on to look after things.', 'Home and family come first for me.'],
  7: ['I need time alone to think things through.', 'I look beneath the surface for the real reason.'],
  8: ['I am driven to achieve and to be in charge of outcomes.', 'I am comfortable handling money and power.'],
  9: ['I care about the bigger picture and people I will never meet.', 'I let go of things once they have run their course.'],
};
const BY_ELEMENT: Record<WElement, [string, string]> = {
  Fire: ['I act on enthusiasm and inspiration.', 'I am bold, even when it is risky.'],
  Earth: ['I am practical and grounded.', 'I prefer tangible results to big ideas.'],
  Air: ['I live in ideas and conversation.', 'I can see a situation from many sides.'],
  Water: ['My feelings run deep and guide me.', 'I pick up on the mood in a room.'],
};
const BY_ANIMAL: Record<Animal, [string, string]> = {
  Rat: ['I spot opportunities quickly.', 'I am resourceful when things get tight.'],
  Ox: ['I am steady and patient, even under pressure.', 'People can count on me to do the work.'],
  Tiger: ['I stand up for what I believe in.', 'I am drawn to challenges and intensity.'],
  Rabbit: ['I avoid conflict and keep things calm.', 'I have a refined sense of taste and beauty.'],
  Dragon: ['I think big and aim high.', 'I have a lot of energy and presence.'],
  Snake: ['I keep my own counsel and choose my words carefully.', 'I trust my intuition about people.'],
  Horse: ['I need freedom and room to move.', 'I am energetic and sociable.'],
  Goat: ['I am gentle and creative.', 'I am sensitive to other people’s feelings.'],
  Monkey: ['I solve problems in clever, unusual ways.', 'I get bored easily and love novelty.'],
  Rooster: ['I am organized and pay attention to detail.', 'I speak frankly, even when it isn’t welcome.'],
  Dog: ['I am loyal to the people I love.', 'Fairness and honesty matter enormously to me.'],
  Pig: ['I am generous and easygoing.', 'I enjoy life’s pleasures without guilt.'],
};

/** Six statements describing who the birth pattern suggests you are; you rate how true each feels now. */
export function alignmentQuestions(p: Profile): AlignmentQuestion[] {
  const n = BY_NUMBER[p.lifePath.root];
  const e = BY_ELEMENT[p.western.element];
  const a = BY_ANIMAL[p.chinese.animal];
  return [
    { id: 'lp1', text: n[0], source: 'lifePath' },
    { id: 'lp2', text: n[1], source: 'lifePath' },
    { id: 'el1', text: e[0], source: 'element' },
    { id: 'el2', text: e[1], source: 'element' },
    { id: 'an1', text: a[0], source: 'animal' },
    { id: 'an2', text: a[1], source: 'animal' },
  ];
}

export const ALIGNMENT_SCALE = ['Not me', 'Rarely', 'Sometimes', 'Often', 'Very me'] as const;

/** Answers are 1–5. 100% means the person you are being matches your birth pattern. */
export function scoreAlignment(answers: number[], takenAt: string): AlignmentResult {
  if (answers.length !== 6) throw new Error('Answer all six statements');
  const avg = answers.reduce((s, x) => s + x, 0) / answers.length;
  const percent = Math.round(((avg - 1) / 4) * 100);
  const tier =
    percent >= 75
      ? 'In step: Persona and Self agree'
      : percent >= 50
        ? 'Partly masked: some of your pattern is lived, some is waiting'
        : 'A borrowed persona: what in you is still unlived?';
  return { percent, tier, takenAt };
}
