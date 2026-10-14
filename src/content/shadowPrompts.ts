import type { Fn } from '@/content/functions';

export type PromptTag = 'general' | 'projection' | 'persona' | 'anima' | 'self' | Fn;
export type ShadowPrompt = { id: string; text: string; tags: PromptTag[] };

const P = (id: string, tags: PromptTag[], text: string): ShadowPrompt => ({ id, text, tags });

/**
 * Function-tagged prompts address that function as the *inferior* one, so the daily prompt
 * can be aimed at the least-developed side of the person's type.
 */
export const SHADOW_PROMPTS: ShadowPrompt[] = [
  // Inferior Extraverted Sensation (often dominant Ni)
  P('se1', ['Se'], 'When did you last fully inhabit your body (eating, moving, touching) without thinking about something else? What has gotten in the way since?'),
  P('se2', ['Se'], 'What do you reach for (food, scrolling, shopping) when the inner world gets too loud? What is it trying to give you?'),
  P('se3', ['Se'], "Describe one physical detail of your surroundings right now that you hadn't noticed. What does noticing it do to your mood?"),
  P('se4', ['Se'], 'Where are you ignoring a practical, physical task because it feels beneath the “real” work? What would it mean to honor it?'),
  P('se5', ['Se'], 'Recall a moment you felt clumsy or out of step with the physical world. What part of you was being asked to wake up?'),
  P('se6', ['Se', 'projection'], 'What sensual pleasure do you quietly judge in other people? Could some of it belong in your own life?'),
  P('se7', ['Se'], 'If your body could write you a letter today, what would it complain about, and what would it ask for?'),
  P('se8', ['Se'], 'What is happening in this exact moment that your plans for the future keep you from experiencing?'),
  // Inferior Introverted Intuition (often dominant Se)
  P('ni1', ['Ni'], 'What vague dread about the future visits you most often? If it were an image, what would it look like?'),
  P('ni2', ['Ni'], 'What pattern has repeated in your life three or more times? What might it be trying to show you?'),
  P('ni3', ['Ni'], 'Which “irrational” hunch did you dismiss recently that turned out to matter?'),
  P('ni4', ['Ni'], 'When you keep yourself constantly busy, what question are you avoiding sitting with?'),
  P('ni5', ['Ni', 'projection'], 'What do you dismiss as too mystical or impractical in other people? What might it hold for you?'),
  P('ni6', ['Ni'], 'Imagine yourself ten years from now looking back at today. What do they see that you cannot?'),
  P('ni7', ['Ni'], 'What symbol, animal or image keeps turning up lately? Write down everything it brings to mind.'),
  P('ni8', ['Ni'], 'Where are you chasing more experience when what you actually need is meaning?'),
  // Inferior Extraverted Intuition (often dominant Si)
  P('ne1', ['Ne'], 'When stress hits, what worst-case scenarios does your mind spin? Write one down, then write three neutral alternatives.'),
  P('ne2', ['Ne'], "Which new possibility did you reject automatically because it didn't match how things have always been done?"),
  P('ne3', ['Ne'], 'What part of your routine protects you from uncertainty, and what does it cost you?'),
  P('ne4', ['Ne'], 'If you could try a completely different way of living for a month, what would it be? What frightens you about it?'),
  P('ne5', ['Ne', 'projection'], 'Whose unpredictability bothers you most? What freedom might they be living that you deny yourself?'),
  P('ne6', ['Ne'], 'What idea have you shelved because it felt unrealistic? Give it five minutes of daydreaming today.'),
  P('ne7', ['Ne'], 'When did change last feel like a threat? What was actually lost, and what arrived instead?'),
  P('ne8', ['Ne'], 'List three wild “what ifs” about your life without judging any of them.'),
  // Inferior Introverted Sensation (often dominant Ne)
  P('si1', ['Si'], 'What does your body keep trying to tell you that you keep overriding for the next exciting thing?'),
  P('si2', ['Si'], 'Which memory from childhood still shapes how you react today? How does it show up?'),
  P('si3', ['Si'], 'What simple routine would genuinely support you, and why do you resist it?'),
  P('si4', ['Si'], 'What have you started and abandoned again and again? What happens in you right before you drop it?'),
  P('si5', ['Si'], 'When you are exhausted, which small details suddenly become unbearable? What do they point to?'),
  P('si6', ['Si', 'projection'], 'Which family tradition or habit do you reject? Is there anything in it worth keeping?'),
  P('si7', ['Si'], 'Recall a time you ignored a past lesson because a new idea was more exciting. What did it cost?'),
  P('si8', ['Si'], 'What would it mean to treat your body as an old friend rather than a vehicle?'),
  // Inferior Extraverted Thinking (often dominant Fi)
  P('te1', ['Te'], 'When did you last snap with cold criticism or an urge to take control? What feeling came just before it?'),
  P('te2', ['Te'], 'Which practical decision have you postponed because it felt too cold to make?'),
  P('te3', ['Te', 'projection'], 'Whose bluntness or efficiency irritates you? What might you gain from a little of it?'),
  P('te4', ['Te'], 'Where are your values strong but your follow-through weak? Name one concrete step.'),
  P('te5', ['Te'], 'What would change if you set one clear, measurable goal for something you care about?'),
  P('te6', ['Te'], "When you feel misunderstood, do you reach for facts to prove you're right? What would it be like to stay with the feeling instead?"),
  P('te7', ['Te'], 'What boundary do you need to state plainly, without apologizing?'),
  P('te8', ['Te'], 'What system or structure would free you if you finally built it?'),
  // Inferior Introverted Thinking (often dominant Fe)
  P('ti1', ['Ti'], 'When you have been hurt, do you build a cold, airtight case against someone? What does the case protect you from feeling?'),
  P('ti2', ['Ti'], 'What do you believe mainly because the people around you believe it? Examine it today.'),
  P('ti3', ['Ti', 'projection'], 'Whose detachment or skepticism bothers you most? What clarity might it offer you?'),
  P('ti4', ['Ti'], 'Where do you let harmony win over honesty? What is the cost?'),
  P('ti5', ['Ti'], 'Pick one of your strong opinions and argue the opposite side as fairly as you can.'),
  P('ti6', ['Ti'], 'What do you truly think (not feel, not what others think) about a decision in front of you?'),
  P('ti7', ['Ti'], 'When did your need to be liked keep you from saying something true?'),
  P('ti8', ['Ti'], 'Which self-criticism repeats in your head? Is it logically true, or only familiar?'),
  // Inferior Extraverted Feeling (often dominant Ti)
  P('fe1', ['Fe'], 'When did you last feel a sudden, intense need for approval? Whose approval was it, really?'),
  P('fe2', ['Fe'], 'Which relationship have you neglected while living in your head? What small gesture would reach it?'),
  P('fe3', ['Fe', 'projection'], 'Whose emotional expressiveness makes you uncomfortable? What feeling of yours might it mirror?'),
  P('fe4', ['Fe'], 'How do you show care in ways others might not recognize? How could you make it visible?'),
  P('fe5', ['Fe'], 'What feeling did you analyze away this week instead of feeling it?'),
  P('fe6', ['Fe'], "Where do you secretly long to belong, even while acting like you don't need anyone?"),
  P('fe7', ['Fe'], "What would you say to someone you love if you didn't need to be precise?"),
  P('fe8', ['Fe'], "When were you hurt because a group's mood shifted? What did you need in that moment?"),
  // Inferior Introverted Feeling (often dominant Te)
  P('fi1', ['Fi'], 'When did you last feel deeply unappreciated? Which value of yours was being stepped on?'),
  P('fi2', ['Fi'], 'What do you genuinely love, apart from what is useful or impressive?'),
  P('fi3', ['Fi', 'projection'], 'Whose “oversensitivity” annoys you? What tenderness might you be keeping locked away?'),
  P('fi4', ['Fi'], 'Which of your achievements felt empty? What was missing from it?'),
  P('fi5', ['Fi'], 'Where have you been efficient at the expense of being true to yourself?'),
  P('fi6', ['Fi'], "Name a feeling you have had all week but haven't admitted, even privately."),
  P('fi7', ['Fi'], 'What would you do differently tomorrow if your own values counted as much as results?'),
  P('fi8', ['Fi'], 'Which moral line will you not cross, and when did you learn that it mattered?'),
  // Projection
  P('pr1', ['projection'], 'Who irritated you most this week? List the exact qualities that bothered you. Where might a small dose of each live in you?'),
  P('pr2', ['projection'], 'Who do you admire almost too much? What gift of your own might you be handing to them?'),
  P('pr3', ['projection'], 'Which kind of person do you instantly dislike? What would happen if you behaved like them for an afternoon?'),
  P('pr4', ['projection'], 'Finish this sentence five times without stopping: “People who … really get on my nerves.”'),
  P('pr5', ['projection'], "Recall an argument where you were certain you were right. What part of the other person's view might be yours?"),
  P('pr6', ['projection'], 'Which public figure do you love to hate? What do they get away with that you never allow yourself?'),
  P('pr7', ['projection'], 'When you gossip, what do you most often criticize? Turn the same lens, gently, on yourself.'),
  P('pr8', ['projection'], 'Who do you keep rescuing? What part of you might you be trying to save through them?'),
  P('pr9', ['projection'], 'What do you assume other people think of you? Whose voice is that, really?'),
  P('pr10', ['projection'], 'Think of someone you envy. Envy is a signpost; what is it pointing you toward?'),
  // Persona
  P('pe1', ['persona'], 'Describe the “you” most people meet. What did you have to leave out to become that person?'),
  P('pe2', ['persona'], 'Which compliment do you get most often? Does it fit, or does it feel like a costume?'),
  P('pe3', ['persona'], 'Where in your life are you performing rather than living?'),
  P('pe4', ['persona'], 'What would your social media look like if it showed the real week you had?'),
  P('pe5', ['persona'], 'Which role (parent, boss, the funny one, the strong one) are you tired of playing?'),
  P('pe6', ['persona'], 'What would you do differently if no one could ever find out?'),
  P('pe7', ['persona'], "When did you last say “I'm fine” and mean the opposite? What stopped the truth?"),
  P('pe8', ['persona'], 'Which version of yourself do you show your family, and how is it different with friends?'),
  P('pe9', ['persona'], 'What are you known for that you no longer want to be known for?'),
  P('pe10', ['persona'], 'If you took off your work persona for a day, who would people meet instead?'),
  // Anima / Animus
  P('an1', ['anima'], 'What qualities do you fall for again and again in partners or crushes? Which of them are asking to grow in you?'),
  P('an2', ['anima'], 'Describe the most compelling stranger in a recent dream. What did they want from you?'),
  P('an3', ['anima'], 'Which artist, character or public figure fascinates you beyond reason? What part of your soul might they carry?'),
  P('an4', ['anima'], 'When you are moody, sulky or opinionated in a way that surprises you, which inner figure is speaking?'),
  P('an5', ['anima'], 'What do you expect a partner to provide that you could begin providing for yourself?'),
  P('an6', ['anima'], 'Write a short dialogue with your inner “other”, the figure who sees what you do not. Let them speak first.'),
  P('an7', ['anima'], 'Which kind of person do you idealize at first and then feel disappointed by? What does that pattern suggest?'),
  P('an8', ['anima'], 'What creative impulse have you been waiting for someone else to give you permission to follow?'),
  P('an9', ['anima'], 'If your soul were a person walking beside you today, how would they describe your choices?'),
  P('an10', ['anima'], 'Which relationship mirrors your inner life most closely right now? What is it showing you?'),
  // Self
  P('sf1', ['self'], 'When have you felt most whole, as if all of you were in the room? What made it possible?'),
  P('sf2', ['self'], 'Imagine a circle with your life inside it. What sits at the center, and what has been pushed to the edge?'),
  P('sf3', ['self'], 'What keeps returning in your life, asking to be lived?'),
  P('sf4', ['self'], 'Which coincidence recently felt meaningful? What might it be telling you about your path?'),
  P('sf5', ['self'], 'If your life had a guiding image or symbol, what would it be?'),
  P('sf6', ['self'], 'Write a short letter from your future, more whole self to the person you are today.'),
  // General
  P('ge1', ['general'], "What did you do today that you wish you hadn't? Instead of judging it, ask what it needed."),
  P('ge2', ['general'], 'Which emotion is hardest for you to admit: anger, envy, fear, longing, or something else? Where did it show up this week?'),
  P('ge3', ['general'], 'What was forbidden in your family growing up? How does that rule still live in you?'),
  P('ge4', ['general'], "Name one thing you're proud of that you rarely let yourself enjoy."),
  P('ge5', ['general'], 'What did your strongest reaction today reveal about what you care about?'),
  P('ge6', ['general'], "Which of your “flaws” has quietly protected you? Thank it, then ask what it needs now."),
  P('ge7', ['general'], 'Where are you saying yes when you mean no, or no when you mean yes?'),
  P('ge8', ['general'], 'What part of you has been waiting for your attention? Give it five minutes now.'),
];
