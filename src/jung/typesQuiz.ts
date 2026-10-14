import type { Fn } from '@/content/functions';
import type { Confidence, TypesDepth, TypesResult } from '@/jung/types';

export type TypesItem = { id: string; prompt: string; a: { text: string; fn: Fn }; b: { text: string; fn: Fn } };

const I = (id: string, prompt: string, aFn: Fn, a: string, bFn: Fn, b: string): TypesItem => ({
  id,
  prompt,
  a: { text: a, fn: aFn },
  b: { text: b, fn: bFn },
});

/**
 * Original forced-choice items written from Jung's descriptions in Psychological Types (1921).
 * Built in eight rounds; each round pairs all eight function-attitudes once, so every function
 * appears exactly eight times.
 */
export const TYPES_ITEMS: TypesItem[] = [
  I('t1', 'A group project stalls. You are more likely to…', 'Te', 'Set a clear plan, deadlines, and who does what', 'Fe', 'Check in on how everyone feels and rebuild the team spirit'),
  I('t2', 'When you disagree with an idea, it is usually because…', 'Ti', 'Its logic doesn’t hold together for you', 'Fi', 'It goes against something you deeply value'),
  I('t3', 'On a free afternoon somewhere new, you would rather…', 'Se', 'Wander and soak up the sights, sounds and food', 'Ne', 'Follow whatever intriguing possibility turns up next'),
  I('t4', 'Before a big change, you mostly rely on…', 'Si', 'What has worked for you before', 'Ni', 'A quiet sense of where things are heading'),

  I('t5', 'Faced with a messy problem, you first…', 'Te', 'Find the fastest proven fix and apply it', 'Ti', 'Take it apart until you understand exactly how it works'),
  I('t6', 'When a friend is upset, you tend to…', 'Fe', 'Make sure they feel supported and part of things', 'Fi', 'Quietly sense what this means to them personally'),
  I('t7', 'You remember a special day best by…', 'Se', 'The vivid moments: the heat, the colors, the rush', 'Si', 'How it compared with other days, and how it felt inside'),
  I('t8', 'Ideas come to you mostly…', 'Ne', 'In bursts, sparked by people, places and conversations', 'Ni', 'Slowly, as an image or hunch that ripens over time'),

  I('t9', 'In a job, class or project, you feel most useful when you…', 'Te', 'Organize resources so goals actually get met', 'Se', 'Handle whatever is happening right now, hands-on'),
  I('t10', 'At a gathering you most enjoy…', 'Fe', 'Making sure everyone is included and comfortable', 'Ne', 'Bouncing between people and ideas to see what could happen'),
  I('t11', 'Learning something new, you prefer to…', 'Ti', 'Build your own framework until it makes sense', 'Si', 'Follow tested steps and practice them'),
  I('t12', 'What guides your biggest decisions is…', 'Fi', 'Whether it feels true to who you are', 'Ni', 'A long-range vision you can’t always explain'),

  I('t13', 'Given a blank page, you would rather…', 'Te', 'Turn it into an efficient plan with priorities', 'Ne', 'Fill it with as many possibilities as you can'),
  I('t14', 'In a tense room, you notice first…', 'Fe', 'The emotional temperature between people', 'Se', 'Concrete details: who moved, what was said, how it looked'),
  I('t15', 'People come to you for…', 'Ti', 'A clear, precise analysis', 'Ni', 'A sense of where it is all going'),
  I('t16', 'You feel most at home with…', 'Fi', 'Your own values and private convictions', 'Si', 'Familiar routines, places and comforts'),

  I('t17', 'When a plan conflicts with your feelings, you usually…', 'Te', 'Stick with the plan; results matter', 'Fi', 'Follow your inner sense of what is right'),
  I('t18', 'In a debate you care more about…', 'Ti', 'Getting the reasoning exactly right', 'Fe', 'Keeping the relationship intact'),
  I('t19', 'You are more drawn to…', 'Se', 'Experiencing life fully, right now', 'Ni', 'Understanding the hidden meaning behind events'),
  I('t20', 'When starting something, you…', 'Si', 'Draw on detailed memories of how it went before', 'Ne', 'Get excited about new angles nobody has tried'),

  I('t21', 'Your room or desk is more likely to be…', 'Te', 'Set up for maximum productivity', 'Si', 'Arranged the way it always has been, with familiar things'),
  I('t22', 'When fixing something physical, you…', 'Ti', 'Work out the principle behind it first', 'Se', 'Dive in and adjust as you go'),
  I('t23', 'Meeting someone new, you pay more attention to…', 'Fe', 'Making them feel welcome', 'Ni', 'What they might become, or what they seem to symbolize'),
  I('t24', 'A perfect day off is more…', 'Fi', 'Following your own quiet interests', 'Ne', 'Exploring something brand new on a whim'),

  I('t25', 'When the future is uncertain, you would rather…', 'Te', 'Set targets and take control of what you can', 'Ni', 'Trust the pattern you sense unfolding'),
  I('t26', 'A conversation feels great when…', 'Ti', 'Ideas get sharper and more consistent', 'Ne', 'Ideas multiply in unexpected directions'),
  I('t27', 'When a tradition matters to you, it is because…', 'Fe', 'It brings people together', 'Si', 'It connects you to what you have known and trusted'),
  I('t28', 'You express yourself best through…', 'Fi', 'Something personal that carries your values', 'Se', 'Something physical and immediate: movement, craft, style'),

  I('t29', 'If a rule seems unfair, you…', 'Te', 'Change it through the proper channels so the system works', 'Fe', 'Rally people around a fairer way'),
  I('t30', 'People who know you well would say you are…', 'Ti', 'Clear-headed and analytical', 'Fi', 'Quietly guided by your own values'),
  I('t31', 'You are happier…', 'Se', 'Doing: being in the action', 'Ne', 'Imagining: dreaming up what could be'),
  I('t32', 'Under stress, you steady yourself by…', 'Si', 'Returning to reliable habits', 'Ni', 'Withdrawing to make sense of the bigger picture'),
];

const ORDER: Fn[] = ['Ni', 'Ne', 'Si', 'Se', 'Ti', 'Te', 'Fi', 'Fe'];
const EXTRAVERTED: Fn[] = ['Te', 'Fe', 'Se', 'Ne'];
const JUDGING: Fn[] = ['Te', 'Ti', 'Fe', 'Fi'];
const INFERIOR: Record<Fn, Fn> = { Ni: 'Se', Ne: 'Si', Si: 'Ne', Se: 'Ni', Ti: 'Fe', Te: 'Fi', Fi: 'Te', Fe: 'Ti' };
const CODES: Record<string, string> = {
  NiTe: 'INTJ', NiFe: 'INFJ', NeTi: 'ENTP', NeFi: 'ENFP', SiTe: 'ISTJ', SiFe: 'ISFJ', SeTi: 'ESTP', SeFi: 'ESFP',
  TiNe: 'INTP', TiSe: 'ISTP', FiNe: 'INFP', FiSe: 'ISFP', TeNi: 'ENTJ', TeSi: 'ESTJ', FeNi: 'ENFJ', FeSi: 'ESFJ',
};

/** The function opposite the dominant one: same axis, opposite attitude. */
export const inferiorOf = (fn: Fn): Fn => INFERIOR[fn];
/** Myers–Briggs-style code for a dominant/auxiliary pair, shown for reference only. */
export const codeFor = (dominant: Fn, auxiliary: Fn): string => CODES[`${dominant}${auxiliary}`] ?? '';

/** "Neither fits me" is offered on every item, for people who see themselves in neither choice. */
export type TypesAnswer = 'a' | 'b' | 'neither';
export const NEITHER_TEXT = 'Neither fits me';

/**
 * The quick read, in the order asked. The four items that set one function against itself in the
 * other attitude (t5–t8), four that set thinking against feeling or sensation against intuition
 * across attitudes (t17–t20), and two more: every function appears two or three times, and the
 * extraverted and introverted sides ten times each.
 */
export const QUICK_IDS = ['t5', 't19', 't6', 't20', 't7', 't17', 't8', 't18', 't25', 't28'] as const;
export const QUICK_ITEMS: TypesItem[] = QUICK_IDS.map((id) => TYPES_ITEMS.find((i) => i.id === id)!);

export const itemsFor = (depth: TypesDepth): TypesItem[] => (depth === 'quick' ? QUICK_ITEMS : TYPES_ITEMS);

const zeroes = () => Object.fromEntries(ORDER.map((f) => [f, 0])) as Record<Fn, number>;

/**
 * Each function scores by how often it was chosen when it was offered, so the quick set (where
 * functions appear two or three times) stays fair. "Neither" counts as offered but not chosen.
 * On the full quiz every function is offered 8 times, so scores match the original counting.
 */
export function scoreTypes(answers: TypesAnswer[], takenAt: string, depth: TypesDepth = 'full'): TypesResult {
  const items = itemsFor(depth);
  if (answers.length !== items.length) throw new Error(`Answer all ${items.length} questions`);
  const chosen = zeroes();
  const offered = zeroes();
  items.forEach((item, i) => {
    offered[item.a.fn] += 1;
    offered[item.b.fn] += 1;
    if (answers[i] === 'a') chosen[item.a.fn] += 1;
    else if (answers[i] === 'b') chosen[item.b.fn] += 1;
  });
  const rate = Object.fromEntries(ORDER.map((f) => [f, offered[f] ? chosen[f] / offered[f] : 0])) as Record<Fn, number>;
  const total = (fns: Fn[]) => fns.reduce((s, f) => s + rate[f], 0);
  const extraversion = total(EXTRAVERTED);
  const introversion = total(ORDER.filter((f) => !EXTRAVERTED.includes(f)));
  const favoredAttitude = (f: Fn) => (EXTRAVERTED.includes(f) ? extraversion >= introversion : introversion > extraversion);

  const best = (candidates: Fn[]) =>
    [...candidates].sort(
      (x, y) =>
        rate[y] - rate[x] ||
        Number(favoredAttitude(y)) - Number(favoredAttitude(x)) ||
        ORDER.indexOf(x) - ORDER.indexOf(y),
    )[0];

  const dominant = best(ORDER);
  const domJudging = JUDGING.includes(dominant);
  const domExtraverted = EXTRAVERTED.includes(dominant);
  const auxiliary = best(
    ORDER.filter((f) => JUDGING.includes(f) !== domJudging && EXTRAVERTED.includes(f) !== domExtraverted),
  );
  const scores = Object.fromEntries(ORDER.map((f) => [f, Math.round(rate[f] * 100)])) as Record<Fn, number>;
  return {
    scores,
    dominant,
    auxiliary,
    inferior: inferiorOf(dominant),
    code: codeFor(dominant, auxiliary),
    takenAt,
    depth,
    confidence: confidenceOf(answers, rate, dominant, depth),
  };
}

/**
 * Low when under 60% of answers were decisive or the top two functions tie; high only on the full
 * quiz with 80%+ decisive answers and a lead of two choices or more. The quick read tops out at medium.
 */
function confidenceOf(answers: TypesAnswer[], rate: Record<Fn, number>, dominant: Fn, depth: TypesDepth): Confidence {
  const decisive = answers.filter((a) => a !== 'neither').length / answers.length;
  const runnerUp = Math.max(...ORDER.filter((f) => f !== dominant).map((f) => rate[f]));
  const lead = rate[dominant] - runnerUp;
  if (decisive < 0.6 || lead <= 0) return 'low';
  if (depth === 'full' && decisive >= 0.8 && lead >= 0.25) return 'high';
  return 'medium';
}
