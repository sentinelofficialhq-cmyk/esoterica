import type { TextStyle } from 'react-native';

export type ThemeId = 'ember' | 'gilded' | 'nebula';

/** The tools on Home's grid; Nebula gives each its own gradient. */
export type ToolKey =
  | 'compat'
  | 'date'
  | 'neville'
  | 'letters'
  | 'forecast'
  | 'readings'
  | 'dreams'
  | 'shadow'
  | 'imagine'
  | 'scripture'
  | 'inner'
  | 'family'
  | 'bestDate'
  | 'quizzes'
  | 'sync'
  | 'learn';

/** A soft radial light behind the screen, in percent of the screen (center and radii). */
export type Glow = { cx: number; cy: number; rx: number; ry: number; color: string; opacity: number };

export type ThemeColors = {
  bg: string;
  bgElev: string;
  /** Card fill; translucent in the glass looks. */
  card: string;
  /** Opaque surface for sheets, inputs and anything that must hide what is behind it. */
  cardSolid: string;
  cardHi: string;
  border: string;
  borderHi: string;
  text: string;
  textDim: string;
  /** Decorative or large text only (below 4.5:1 on purpose). */
  textFaint: string;
  accent: string;
  accentBright: string;
  accentSoft: string;
  accentBorder: string;
  /** Text on the primary call-to-action. */
  onAccent: string;
  /** Zodiac glyphs, animal characters and other ornaments. */
  glyph: string;
  gold: string;
  goldSoft: string;
  violet: string;
  violetSoft: string;
  teal: string;
  tealSoft: string;
  danger: string;
  dangerSoft: string;
  tabBar: string;
  /** Meter tracks and inactive columns. */
  track: string;
};

export type ThemeFonts = {
  display: string;
  displaySemi: string;
  displayBold: string;
  displayItalic: string;
  body: string;
  bodyMedium: string;
  bodySemi: string;
  bodyBold: string;
  bodyHeavy: string;
};

export type TypographyVariant = 'hero' | 'title' | 'heading' | 'body' | 'bodyDim' | 'small' | 'label' | 'number';

export type Theme = {
  id: ThemeId;
  name: string;
  blurb: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  gradients: {
    /** Primary button, top to bottom. */
    cta: [string, string];
    /** Hero numerals, top to bottom. */
    numeral: [string, string, string];
    /** The featured card (Jung on Home), top to bottom. */
    hero: [string, string, ...string[]];
    /** Gradient hairline for highlighted cards; null draws a plain accent border. */
    border: [string, string, ...string[]] | null;
    glows: Glow[];
  };
  shadows: { numeral: string | null; cta: string };
  shape: {
    cardRadius: number;
    tile: 'glass' | 'ring' | 'gradient';
    tabActive: 'pill' | 'dot';
    /** How the Home hero and Calculator top are composed. */
    layout: 'split' | 'wide';
    lensTabs: 'icons' | 'text' | 'pills';
    stars: { color: string; opacity: number };
    /** Labels are uppercase and tracked in every look; this is the tracking in px at 11px. */
    labelTracking: number;
  };
  tileGradients: Record<ToolKey, [string, string]>;
  typography: Record<TypographyVariant, TextStyle>;
};

const tools = (pairs: [string, string]): Record<ToolKey, [string, string]> => ({
  compat: pairs,
  date: pairs,
  neville: pairs,
  letters: pairs,
  forecast: pairs,
  readings: pairs,
  dreams: pairs,
  shadow: pairs,
  imagine: pairs,
  scripture: pairs,
  inner: pairs,
  family: pairs,
  bestDate: pairs,
  quizzes: pairs,
  sync: pairs,
  learn: pairs,
});

function typography(c: ThemeColors, f: ThemeFonts, s: { hero: number; title: number; heading: number; number: number; labelColor: string; tracking: number; tight: number }): Record<TypographyVariant, TextStyle> {
  return {
    hero: { fontFamily: f.displayBold, fontSize: s.hero, lineHeight: Math.round(s.hero * 1.15), letterSpacing: s.tight, color: c.text },
    title: { fontFamily: f.displaySemi, fontSize: s.title, lineHeight: Math.round(s.title * 1.18), letterSpacing: s.tight, color: c.text },
    heading: { fontFamily: f.displaySemi, fontSize: s.heading, lineHeight: Math.round(s.heading * 1.3), color: c.text },
    body: { fontFamily: f.body, fontSize: 16, lineHeight: 24, color: c.text },
    bodyDim: { fontFamily: f.body, fontSize: 15, lineHeight: 22, color: c.textDim },
    small: { fontFamily: f.bodyMedium, fontSize: 13, lineHeight: 18, color: c.textDim },
    label: { fontFamily: f.bodyHeavy, fontSize: 11, lineHeight: 14, letterSpacing: s.tracking, textTransform: 'uppercase', color: s.labelColor },
    number: { fontFamily: f.displayBold, fontSize: s.number, lineHeight: Math.round(s.number * 1.08), color: c.text },
  };
}


const lining = (t: Record<TypographyVariant, TextStyle>): Record<TypographyVariant, TextStyle> =>
  Object.fromEntries(Object.entries(t).map(([k, v]) => [k, { ...v, fontVariant: ['lining-nums'] }])) as Record<TypographyVariant, TextStyle>;

// ── A · Ember Glass ─────────────────────────────────────────────────────────
const emberColors: ThemeColors = {
  bg: '#08081A',
  bgElev: '#12112A',
  card: 'rgba(255,255,255,0.05)',
  cardSolid: '#14132E',
  cardHi: 'rgba(255,255,255,0.09)',
  border: 'rgba(255,255,255,0.10)',
  borderHi: 'rgba(255,255,255,0.20)',
  text: '#F4F1EA',
  textDim: '#ABA8C3',
  textFaint: '#77749A',
  accent: '#FF7A2F',
  accentBright: '#FFB04A',
  accentSoft: 'rgba(255,122,47,0.15)',
  accentBorder: 'rgba(255,138,61,0.42)',
  onAccent: '#1E0B00',
  glyph: '#FFC26E',
  gold: '#F4C26B',
  goldSoft: 'rgba(244,194,107,0.14)',
  violet: '#A99BFF',
  violetSoft: 'rgba(139,124,255,0.16)',
  teal: '#5FE0BF',
  tealSoft: 'rgba(79,209,181,0.14)',
  danger: '#FF6B86',
  dangerSoft: 'rgba(255,92,122,0.14)',
  tabBar: 'rgba(24,20,44,0.82)',
  track: 'rgba(255,122,47,0.16)',
};
const emberFonts: ThemeFonts = {
  display: 'Sora_600SemiBold',
  displaySemi: 'Sora_600SemiBold',
  displayBold: 'Sora_700Bold',
  displayItalic: 'Sora_600SemiBold',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemi: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyHeavy: 'Manrope_800ExtraBold',
};

export const EMBER: Theme = {
  id: 'ember',
  name: 'Ember Glass',
  blurb: 'Navy night, ember glow, frosted glass.',
  colors: emberColors,
  fonts: emberFonts,
  gradients: {
    cta: ['#FFA650', '#FF6A1F'],
    numeral: ['#FFD08A', '#FFB04A', '#FF7A2F'],
    hero: ['#FFB15A', '#FF7A2F', '#C9461A', '#7A2A10'],
    border: null,
    glows: [
      { cx: 50, cy: 108, rx: 95, ry: 52, color: '#FF681C', opacity: 0.5 },
      { cx: 0, cy: 0, rx: 70, ry: 38, color: '#705CFF', opacity: 0.2 },
    ],
  },
  shadows: { numeral: 'rgba(255,140,60,0.7)', cta: 'rgba(255,106,31,0.45)' },
  shape: {
    cardRadius: 24,
    tile: 'glass',
    tabActive: 'pill',
    layout: 'split',
    lensTabs: 'icons',
    stars: { color: '#FFFFFF', opacity: 1 },
    labelTracking: 1.7,
  },
  tileGradients: tools(['#FFB04A', '#FF7A2F']),
  typography: typography(emberColors, emberFonts, { hero: 34, title: 26, heading: 18, number: 56, labelColor: emberColors.textDim, tracking: 1.7, tight: -0.4 }),
};

// ── B · Gilded Night ────────────────────────────────────────────────────────
const gildedColors: ThemeColors = {
  bg: '#0B0A09',
  bgElev: '#151310',
  card: '#141210',
  cardSolid: '#141210',
  cardHi: 'rgba(217,180,108,0.10)',
  border: 'rgba(217,180,108,0.24)',
  borderHi: 'rgba(217,180,108,0.45)',
  text: '#EFE8DA',
  textDim: '#A89F8E',
  textFaint: '#7A7262',
  accent: '#D9B46C',
  accentBright: '#F1D9A3',
  accentSoft: 'rgba(217,180,108,0.13)',
  accentBorder: 'rgba(217,180,108,0.42)',
  onAccent: '#1A1408',
  glyph: '#F1D9A3',
  gold: '#D9B46C',
  goldSoft: 'rgba(217,180,108,0.13)',
  violet: '#C2B6E8',
  violetSoft: 'rgba(194,182,232,0.12)',
  teal: '#9FD4B4',
  tealSoft: 'rgba(159,212,180,0.12)',
  danger: '#E8907F',
  dangerSoft: 'rgba(232,144,127,0.13)',
  tabBar: 'rgba(18,16,14,0.94)',
  track: 'rgba(217,180,108,0.16)',
};
const gildedFonts: ThemeFonts = {
  display: 'CormorantGaramond_500Medium',
  displaySemi: 'CormorantGaramond_600SemiBold',
  displayBold: 'CormorantGaramond_600SemiBold',
  displayItalic: 'CormorantGaramond_500Medium_Italic',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemi: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
  bodyHeavy: 'Manrope_700Bold',
};

export const GILDED: Theme = {
  id: 'gilded',
  name: 'Gilded Night',
  blurb: 'Black and champagne gold, serif numerals.',
  colors: gildedColors,
  fonts: gildedFonts,
  gradients: {
    cta: ['#F6E1AE', '#C99A4E'],
    numeral: ['#FBEBC4', '#D9B46C', '#9C7536'],
    hero: ['rgba(217,180,108,0.16)', 'rgba(217,180,108,0.04)'],
    border: null,
    glows: [
      { cx: 50, cy: 0, rx: 80, ry: 36, color: '#D9B46C', opacity: 0.13 },
      { cx: 50, cy: 100, rx: 90, ry: 40, color: '#966028', opacity: 0.16 },
    ],
  },
  shadows: { numeral: null, cta: 'rgba(201,154,78,0.28)' },
  shape: {
    cardRadius: 20,
    tile: 'ring',
    tabActive: 'dot',
    layout: 'wide',
    lensTabs: 'text',
    stars: { color: '#F1D9A3', opacity: 0.55 },
    labelTracking: 2.4,
  },
  tileGradients: tools(['#F1D9A3', '#C99A4E']),
  // Cormorant defaults to old-style figures; lining figures keep numbers full height next to text.
  typography: lining({
    ...typography(gildedColors, gildedFonts, { hero: 42, title: 32, heading: 22, number: 64, labelColor: gildedColors.accent, tracking: 2.4, tight: 0 }),
    hero: { fontFamily: gildedFonts.display, fontSize: 42, lineHeight: 46, color: gildedColors.text },
    title: { fontFamily: gildedFonts.display, fontSize: 32, lineHeight: 36, color: gildedColors.text },
  }),
};

// ── C · Nebula ─────────────────────────────────────────────────────────────
const nebulaColors: ThemeColors = {
  bg: '#0A0820',
  bgElev: '#16123A',
  card: 'rgba(255,255,255,0.07)',
  cardSolid: '#17123A',
  cardHi: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.16)',
  borderHi: 'rgba(255,255,255,0.28)',
  text: '#F5F3FF',
  textDim: '#B9B2DD',
  textFaint: '#8A82B5',
  accent: '#8B7CFF',
  accentBright: '#C9BEFF',
  accentSoft: 'rgba(139,124,255,0.26)',
  accentBorder: 'rgba(139,124,255,0.55)',
  onAccent: '#1B1245',
  glyph: '#FFD7B0',
  gold: '#FFC24D',
  goldSoft: 'rgba(255,194,77,0.18)',
  violet: '#C9BEFF',
  violetSoft: 'rgba(139,124,255,0.22)',
  teal: '#7BE3A6',
  tealSoft: 'rgba(87,217,138,0.18)',
  danger: '#FF7D97',
  dangerSoft: 'rgba(255,107,139,0.18)',
  tabBar: 'rgba(30,22,70,0.66)',
  track: 'rgba(159,134,255,0.22)',
};
const nebulaFonts: ThemeFonts = {
  display: 'SpaceGrotesk_600SemiBold',
  displaySemi: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  displayItalic: 'SpaceGrotesk_500Medium',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemi: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
  bodyHeavy: 'DMSans_700Bold',
};

export const NEBULA: Theme = {
  id: 'nebula',
  name: 'Nebula',
  blurb: 'Violet, magenta and ember light through frosted glass.',
  colors: nebulaColors,
  fonts: nebulaFonts,
  gradients: {
    cta: ['#FFFFFF', '#F1EEFF'],
    numeral: ['#B9A8FF', '#F06BB0', '#FFA25A'],
    hero: ['#8B7CFF', '#E8509A'],
    border: ['#8B7CFF', '#E8509A', '#FF8A3D'],
    glows: [
      { cx: 8, cy: 6, rx: 60, ry: 34, color: '#7C5CFF', opacity: 0.55 },
      { cx: 100, cy: 34, rx: 55, ry: 32, color: '#E8509A', opacity: 0.32 },
      { cx: 50, cy: 104, rx: 85, ry: 40, color: '#FF7A2F', opacity: 0.42 },
    ],
  },
  shadows: { numeral: 'rgba(232,80,154,0.45)', cta: 'rgba(232,80,154,0.45)' },
  shape: {
    cardRadius: 28,
    tile: 'gradient',
    tabActive: 'pill',
    layout: 'wide',
    lensTabs: 'pills',
    stars: { color: '#FFFFFF', opacity: 1 },
    labelTracking: 1.8,
  },
  tileGradients: {
    compat: ['#FF6FA8', '#FF8A3D'],
    date: ['#3FD0C9', '#4D7CFF'],
    neville: ['#FFB86B', '#C65BD8'],
    letters: ['#A88BFF', '#5B3FE0'],
    forecast: ['#FFC24D', '#FF7A2F'],
    readings: ['#6FA8FF', '#7C5CFF'],
    dreams: ['#5D4BD8', '#2C1F7A'],
    shadow: ['#7A6E9E', '#2B2448'],
    imagine: ['#F06BB0', '#8B7CFF'],
    scripture: ['#E9C987', '#B07A3C'],
    inner: ['#8B7CFF', '#3FD0C9'],
    family: ['#57D98A', '#1FA9A0'],
    bestDate: ['#FF8A3D', '#E8509A'],
    quizzes: ['#4D7CFF', '#A88BFF'],
    sync: ['#3FD0C9', '#7C5CFF'],
    learn: ['#B9A8FF', '#6FA8FF'],
  },
  typography: typography(nebulaColors, nebulaFonts, { hero: 34, title: 28, heading: 19, number: 56, labelColor: nebulaColors.accentBright, tracking: 1.8, tight: -0.6 }),
};

export const THEMES: Record<ThemeId, Theme> = { ember: EMBER, gilded: GILDED, nebula: NEBULA };
export const THEME_IDS: ThemeId[] = ['ember', 'gilded', 'nebula'];
