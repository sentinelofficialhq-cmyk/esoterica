/** Jung's eight function-attitudes (Psychological Types, 1921). Shared by quizzes, prompts and the AI. */
export type Fn = 'Te' | 'Ti' | 'Fe' | 'Fi' | 'Se' | 'Si' | 'Ne' | 'Ni';

export const FUNCTIONS: Fn[] = ['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni'];

export type FunctionMeaning = {
  fn: Fn;
  name: string;
  essence: string;
  whenDominant: string;
  /** How this function behaves when it is someone's inferior (least conscious) function. */
  whenInferior: string;
  growthEdge: string;
};

export const FUNCTION_MEANINGS: Record<Fn, FunctionMeaning> = {
  Te: {
    fn: 'Te',
    name: 'Extraverted Thinking',
    essence: 'Orders the outer world by objective logic: goals, systems, evidence and efficiency.',
    whenDominant: 'You organize, decide and get things done; you trust facts and measurable results.',
    whenInferior: 'Logic shows up in harsh bursts: sudden judgments, or an urge to control facts and people when feelings run high.',
    growthEdge: 'Let your inner values be spoken plainly, and test whether your systems serve the people inside them.',
  },
  Ti: {
    fn: 'Ti',
    name: 'Introverted Thinking',
    essence: 'Builds precise inner frameworks and seeks what is true and consistent in principle.',
    whenDominant: 'You analyze, define and question until an idea is clean; independence of thought matters more than consensus.',
    whenInferior: 'Thinking turns cold and cutting, or becomes obsessed with proving a point after you have been hurt.',
    growthEdge: 'Share half-finished thoughts, and let warmth into your precision.',
  },
  Fe: {
    fn: 'Fe',
    name: 'Extraverted Feeling',
    essence: 'Attunes to shared values and to the emotional climate between people.',
    whenDominant: 'You create harmony, read social needs, and help groups feel connected.',
    whenInferior: 'Feelings erupt as sudden neediness, sentimentality, or touchiness about being liked.',
    growthEdge: 'Notice what you feel when no one else is in the room.',
  },
  Fi: {
    fn: 'Fi',
    name: 'Introverted Feeling',
    essence: 'Weighs life by deep inner values: quiet, intense and personal.',
    whenDominant: 'You stay true to what matters, sense authenticity, and feel far more than you show.',
    whenInferior: 'Private feelings surface as hurt pride, moodiness, or the sense of being unappreciated.',
    growthEdge: 'Let your values act in the world, even imperfectly.',
  },
  Se: {
    fn: 'Se',
    name: 'Extraverted Sensation',
    essence: 'Lives in the present through the senses: what is here, now and real.',
    whenDominant: 'You notice details, respond quickly, enjoy experience, and handle the physical world with ease.',
    whenInferior: 'Sensation erupts: bingeing on food, screens or shopping, or feeling at war with the physical world and its details.',
    growthEdge: 'Pause to ask what your experiences mean, not only how they feel.',
  },
  Si: {
    fn: 'Si',
    name: 'Introverted Sensation',
    essence: 'Absorbs experience and compares it with a rich inner archive of past impressions.',
    whenDominant: 'You remember, preserve and steady things; continuity and reliability matter to you.',
    whenInferior: 'Under stress you fixate on bodily symptoms, small details, or routines you usually ignore.',
    growthEdge: 'Let new possibilities in before deciding they will not work.',
  },
  Ne: {
    fn: 'Ne',
    name: 'Extraverted Intuition',
    essence: 'Sees possibilities and connections in the outer world, always asking “what if?”',
    whenDominant: 'You brainstorm, connect, start things, and spot potential others miss.',
    whenInferior: 'Possibilities turn ominous: catastrophizing about everything that might go wrong.',
    growthEdge: 'Finish one thing, and let the body and the present have their say.',
  },
  Ni: {
    fn: 'Ni',
    name: 'Introverted Intuition',
    essence: 'Perceives inner images and patterns, and senses where things are heading beneath the surface.',
    whenDominant: 'You have visions, hunches and long-range insight; you live close to the unconscious.',
    whenInferior: 'Dark hunches and foreboding about the future: meaning arrives as vague dread instead of vision.',
    growthEdge: 'Ground your visions in concrete, sensory steps.',
  },
};
