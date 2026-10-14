/** Phrases that suggest the person may be in danger. Deliberately broad: a false positive only shows a banner. */
const CRISIS_PATTERNS = [
  /\b(kill|hurt|harm)\s+(myself|me)\b/i,
  /\bsuicid(e|al)\b/i,
  /\bend\s+(it\s+all|my\s+life)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bself[-\s]?harm/i,
  /\bcutting\s+myself\b/i,
  /\boverdos(e|ing)\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\b(being|been)\s+(abused|beaten)\b/i,
];

export const detectCrisis = (text: string): boolean => CRISIS_PATTERNS.some((p) => p.test(text));

export const CRISIS_RESOURCES = [
  { label: 'Call or text 988 (US Suicide & Crisis Lifeline)', url: 'tel:988' },
  { label: 'Find a helpline in your country', url: 'https://findahelpline.com' },
  { label: 'In immediate danger: call your local emergency number', url: 'tel:911' },
];
