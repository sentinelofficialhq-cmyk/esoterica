export type DayGuidance = { bestFor: string[]; watchOut: string[]; reflection: string };

/** What each moon phase traditionally favors. */
export const MOON_GUIDANCE: Record<string, string> = {
  'New Moon': 'A time for intentions and quiet beginnings.',
  'Waxing Crescent': 'Early momentum: nurture what you have started.',
  'First Quarter': 'A point of decision and effort.',
  'Waxing Gibbous': 'Refine and build toward completion.',
  'Full Moon': 'Culmination and heightened feeling; things come to light.',
  'Waning Gibbous': 'Share what you have learned, and give thanks.',
  'Last Quarter': 'Let go of what is not working.',
  'Waning Crescent': 'Rest, release and reflect before the next cycle.',
};

/** Themes for Personal Years 1–9. */
export const PERSONAL_YEAR_THEMES: Record<number, string> = {
  1: 'A year of beginnings: plant seeds, start fresh, act on your own initiative.',
  2: 'A year of patience and partnership: cooperate, listen, and let things grow at their own pace.',
  3: 'A year of expression: create, socialize, and let your voice be heard.',
  4: 'A year of building: work steadily, organize, and lay foundations that last.',
  5: 'A year of change: travel, experiment, and welcome the unexpected.',
  6: 'A year of responsibility and home: family, care, and commitments come first.',
  7: 'A year of reflection: study, rest, turn inward, and look for meaning.',
  8: 'A year of power and results: ambition, money and recognition are in play.',
  9: 'A year of completion: release what is finished and make room for what comes next.',
};

/** Guidance for personal days 1–9. */
export const DAY_GUIDANCE: Record<number, DayGuidance> = {
  1: {
    bestFor: ['Starting something new', 'Making a decision', 'Taking the lead'],
    watchOut: ['Steamrolling others', 'Impatience'],
    reflection: "What wants to begin through you today, and what would you do if you didn't wait for permission?",
  },
  2: {
    bestFor: ['Partnerships and talks', 'Listening', 'Patient follow-up'],
    watchOut: ['People-pleasing', 'Taking things personally'],
    reflection: 'Where are you holding two sides of something? What would it be like to let both be true for now?',
  },
  3: {
    bestFor: ['Creative work', 'Socializing', 'Writing or speaking'],
    watchOut: ['Scattered energy', 'Saying yes to everything'],
    reflection: 'What feeling wants to be expressed today, rather than performed?',
  },
  4: {
    bestFor: ['Planning and admin', 'Steady work', 'Fixing foundations'],
    watchOut: ['Rigidity', 'All work and no play'],
    reflection: 'Which structure in your life is supporting you, and which one has quietly become a cage?',
  },
  5: {
    bestFor: ['Change and travel', 'Trying something new', 'Meeting people'],
    watchOut: ['Impulsiveness', 'Overindulgence'],
    reflection: 'What are you moving toward today, and what might you be running from?',
  },
  6: {
    bestFor: ['Home and family', 'Care and repair', 'Beauty and design'],
    watchOut: ['Overgiving', 'Controlling through care'],
    reflection: 'Who are you caring for today, and have you included yourself?',
  },
  7: {
    bestFor: ['Research and study', 'Rest and solitude', 'Reflection or prayer'],
    watchOut: ['Isolation', 'Overthinking'],
    reflection: 'What does your inner voice say when the outer noise drops away?',
  },
  8: {
    bestFor: ['Money and business', 'Negotiation', 'Big decisions'],
    watchOut: ['Power struggles', 'Overwork'],
    reflection: 'How are you using your power today, and what is it protecting?',
  },
  9: {
    bestFor: ['Completing and releasing', 'Generosity', 'Big-picture thinking'],
    watchOut: ['Clinging to what is over', 'Martyrdom'],
    reflection: 'What is ready to end so that something new has room?',
  },
};
