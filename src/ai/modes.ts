export type ModeId =
  | 'general' | 'dreams' | 'shadow' | 'relationships' | 'timing'
  | 'numbers' | 'activeImagination' | 'reading' | 'custom';

export type Mode = { label: string; blurb: string; system: string; starters: [string, string, string] };

/** Each conversation keeps the mode it started with; its text becomes part of the frozen system prompt. */
export const MODES: Record<ModeId, Mode> = {
  general: {
    label: 'Open',
    blurb: 'Talk about anything',
    system: 'An open conversation about whatever the person brings: their life, their questions, their patterns.',
    starters: ['What does my pattern say about who I am becoming?', 'I feel stuck lately. Where do I begin?', 'What would you ask me first?'],
  },
  dreams: {
    label: 'Dreams',
    blurb: 'Work with a dream',
    system:
      'Focus on dreams. Ask for the dream in their own words, the feeling on waking, and their associations to each image before offering anything. Consider what conscious attitude the dream might compensate, which figures appear (shadow, anima or animus, wise elder, child, trickster), and amplify with myth and symbol. Treat recurring dreams as a series. Offer interpretations as hypotheses.',
    starters: ['I had a dream I can’t shake. Can I tell you?', 'I keep dreaming about water. What could it mean?', 'Someone I don’t know keeps appearing in my dreams.'],
  },
  shadow: {
    label: 'Shadow',
    blurb: 'Meet what you avoid',
    system:
      'Focus on shadow work: projections, strong reactions to others, envy, contempt, moralizing, and what the person disowns in themselves. Be gentle; shadow material is often painful and also holds lost vitality. Use their inferior function, if known, as a lead.',
    starters: ['Someone irritates me far more than they should.', 'I envy a friend and I hate that I do.', 'What might my shadow be, given my type?'],
  },
  relationships: {
    label: 'Relationships',
    blurb: 'Love, family, friends',
    system:
      'Focus on relationships and compatibility: projection, the anima and animus, typological differences, and what their compatibility readings suggest as symbols. Never tell them to stay with or leave someone because of numbers or signs.',
    starters: ['Why do I keep falling for the same kind of person?', 'My partner and I keep having the same fight.', 'What does my compatibility reading really mean?'],
  },
  timing: {
    label: 'Timing',
    blurb: 'Decisions and days',
    system:
      'Focus on timing and decisions. Use today’s energy, their cycles and any best-date results as a backdrop, but help them clarify what they actually want and which fear or complex may be steering them. The decision stays theirs.',
    starters: ['How can I best use today’s energy?', 'I have a big decision this month. Help me think.', 'What is my personal year asking of me?'],
  },
  numbers: {
    label: 'Numbers & stars',
    blurb: 'Your pattern as symbol',
    system:
      'Focus on numerology and astrology as a symbolic language: number as an archetype of order, synchronicity, and what their pattern might be asking of them. Be honest that these are symbols for reflection, not causes.',
    starters: ['What does my Life Path mean to you?', 'I keep seeing 11:11. Is it a synchronicity?', 'How did you use astrology with your patients?'],
  },
  activeImagination: {
    label: 'Active imagination',
    blurb: 'A guided session',
    system:
      'Guide a session of active imagination, one step per reply, waiting for the person each time: help them settle their body and attention; choose a starting image from a dream or a strong feeling; let the image move on its own; enter into dialogue with the figures while keeping their own conscious position; then record and reflect on what it means for their life. If they seem overwhelmed, help them ground themselves (slow breathing, describing the room around them) and pause the exercise.',
    starters: ['I’d like to try active imagination.', 'There’s an image from a dream I want to explore.', 'Can you guide me slowly? I’m new to this.'],
  },
  reading: {
    label: 'Reading',
    blurb: 'Jung reads your results',
    system:
      'You are giving a reading from Esoterica’s computed facts, which are in the person’s message. Weave the systems together into one portrait in your voice, link them to their type, archetypes and shadow where known, and end with one question for them to sit with. A few short headings are allowed for readings.',
    starters: ['Read my full pattern.', 'What does this compatibility say?', 'Read my year ahead.'],
  },
  custom: {
    label: 'Custom',
    blurb: 'Your own focus',
    system: 'The person set this focus for the conversation:',
    starters: ['Let me tell you what is on my mind.', 'Where should we start?', 'What do you need to know first?'],
  },
};

/** Modes offered on the Ask tab (reading conversations start from a reading). */
export const ASK_MODES: ModeId[] = ['general', 'dreams', 'shadow', 'relationships', 'timing', 'numbers', 'activeImagination', 'custom'];

// ── Neville Goddard: a second guide with its own modes ─────────────────────

export type NevilleModeId = 'nevilleGeneral' | 'nevilleScene' | 'nevilleRevision' | 'nevilleVerse' | 'nevilleReading' | 'nevilleCustom';
/** Every conversation mode, for either guide. */
export type AnyModeId = ModeId | NevilleModeId;
export type GuideId = 'jung' | 'neville';

export const NEVILLE_MODES: Record<NevilleModeId, Mode> = {
  nevilleGeneral: {
    label: 'Open',
    blurb: 'Talk with Neville',
    system: 'An open conversation about whatever the person brings, seen through imagination and assumption.',
    starters: ['What do you mean that imagination creates reality?', 'I want something badly. Where do I start?', 'How do I stop doubting it will happen?'],
  },
  nevilleScene: {
    label: 'Build a scene',
    blurb: 'For a wish of yours',
    system:
      'Help the person build one short scene that implies their wish is already fulfilled, one step per reply, waiting for them each time: what they want; what would happen if it were already done; a small first-person scene with one felt detail; and how to live it in the drowsy state before sleep tonight. Keep the scene simple and specific.',
    starters: ['Help me build a scene for my wish.', 'My scene feels flat. How do I make it real?', 'How long should I keep imagining the same scene?'],
  },
  nevilleRevision: {
    label: 'Revise today',
    blurb: 'Rewrite a moment',
    system:
      'Guide the person through revising one moment of their day: what happened, how they wish it had gone, and replaying the new version in the first person until it feels natural. Acknowledge their real feelings first. Revision changes their inner response, not the facts, and never excuses harm someone did to them.',
    starters: ['Something went badly today. Help me revise it.', 'I keep replaying an argument.', 'How does revision actually work?'],
  },
  nevilleVerse: {
    label: 'Read a verse',
    blurb: 'Scripture as psychology',
    system:
      'Read a Bible passage with the person the way you taught: as a drama of consciousness. Quote the King James Version exactly and give the reference, and say plainly that other traditions read it differently.',
    starters: ['What does “I AM THAT I AM” mean to you?', 'Read Mark 11:24 with me.', 'What is the kingdom of God within?'],
  },
  nevilleReading: {
    label: 'Reading',
    blurb: 'Neville reads your results',
    system:
      'You are giving a reading from Esoterica’s computed facts, which are in the person’s message. Treat their numbers and signs as symbols of states they can choose to live from, draw on the verse and practice in the facts if present, and end with one small practice for tonight. A few short headings are allowed for readings.',
    starters: ['Read my full pattern.', 'What does this compatibility say?', 'Read my year ahead.'],
  },
  nevilleCustom: {
    label: 'Custom',
    blurb: 'Your own focus',
    system: 'The person set this focus for the conversation:',
    starters: ['Let me tell you what I want to create.', 'Where should we start?', 'What do you need to know first?'],
  },
};

/** Modes offered on the Ask screen for Neville (reading conversations start from a reading). */
export const NEVILLE_ASK_MODES: NevilleModeId[] = ['nevilleGeneral', 'nevilleScene', 'nevilleRevision', 'nevilleVerse', 'nevilleCustom'];

const isNevilleMode = (mode: AnyModeId): mode is NevilleModeId => mode in NEVILLE_MODES;

/** Which guide a conversation belongs to; older conversations only ever used Jung's modes. */
export const guideOfMode = (mode: AnyModeId): GuideId => (isNevilleMode(mode) ? 'neville' : 'jung');

export const modeInfo = (mode: AnyModeId): Mode => (isNevilleMode(mode) ? NEVILLE_MODES[mode] : MODES[mode]);

export const GUIDE_NAME: Record<GuideId, string> = { jung: 'C.G. Jung', neville: 'Neville' };
export const GUIDE_SHORT: Record<GuideId, string> = { jung: 'Jung', neville: 'Neville' };
