import { Platform, type TextStyle } from 'react-native';

/** The three original looks, then the three calmer looks added for the launch A/B test. */
export type ThemeId = 'ember' | 'gilded' | 'nebula' | 'emberQuiet' | 'brass' | 'daylight';
export type ThemeScheme = 'dark' | 'light';

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
  // Grounds
  bg: string;
  bgElev: string;
  /** Card fill; translucent in the glass looks. */
  card: string;
  /** Opaque surface equal to the card's visible fill (charts paint it to draw their gaps). */
  cardSolid: string;
  cardHi: string;
  border: string;
  borderHi: string;
  // Text
  text: string;
  textDim: string;
  /** Decorative or large text only (below 4.5:1 on purpose). */
  textFaint: string;
  placeholder: string;
  /** The emphasized half of a headline, and italic asides. */
  emphasis: string;
  // Accent
  accent: string;
  accentBright: string;
  accentSoft: string;
  accentBorder: string;
  /** Text on the primary call-to-action. */
  onAccent: string;
  /** Zodiac glyphs, animal characters and other ornaments. */
  glyph: string;
  /** The Jung mark on Home's banner. */
  emblem: string;
  // Supporting tones
  gold: string;
  goldSoft: string;
  violet: string;
  violetSoft: string;
  teal: string;
  tealSoft: string;
  danger: string;
  dangerSoft: string;
  dangerBorder: string;
  // Meters
  /** Energy meters and inactive chart columns. */
  track: string;
  /** Score rings, match bars and progress bars. */
  meterTrack: string;
  // Controls
  /** Text and border of secondary (ghost) buttons. */
  ghostInk: string;
  ghostBorder: string;
  /** Round icon buttons. */
  controlBg: string;
  controlBorder: string;
  chipInk: string;
  chipBg: string;
  chipBorder: string;
  /** Text field fill and border. */
  field: string;
  fieldBorder: string;
  switchThumb: string;
  /** The switch track when off. */
  switchTrack: string;
  // Tab bar
  tabBar: string;
  tabActive: string;
  tabInactive: string;
  /** Border of the active tab's pill (pill style only). */
  tabActiveBorder: string;
  /** The docked bar's top hairline. */
  tabBarBorder: string;
  // Home
  /** Icons and letters on Home's tool tiles, and the fill of card tiles. */
  tileInk: string;
  tileBg: string;
  /** Border of card tiles. */
  tileBorder: string;
  /** The go button on the Jung banner, and the text on it. */
  bannerGo: string;
  onBannerGo: string;
  /** The selected lens pill on the Calculator, and its text. */
  pillActive: string;
  onPillActive: string;
  /** Dims whatever sits behind a sheet or an emblem label. */
  scrim: string;
  /** Recessed input wells, such as the Ask bar's field. */
  inputWell: string;
  // The hero gradient card (Ember's Jung card)
  onHero: string;
  onHeroStrong: string;
  heroChip: string;
  heroBorder: string;
  heroButton: string;
  heroButtonBorder: string;
  // The energy orb (Nebula)
  onOrb: string;
  orbRing: string;
  orbTrack: string;
};

/**
 * A face of the system font: SF Pro on Apple devices, Roboto on Android, the platform UI font on the
 * web. Spread it into a style (`...t.fonts.bodySemi`). Native leaves `fontFamily` unset, which is how
 * React Native uses the platform default.
 */
export type FontFace = Pick<TextStyle, 'fontFamily' | 'fontWeight' | 'fontStyle'>;

const SYSTEM_STACK = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const face = (fontWeight: NonNullable<TextStyle['fontWeight']>, italic = false): FontFace => ({
  ...(Platform.OS === 'web' ? { fontFamily: SYSTEM_STACK } : {}),
  fontWeight,
  ...(italic ? { fontStyle: 'italic' as const } : {}),
});

/** react-native-svg takes font props instead of a style. */
export const svgFont = (f: FontFace) => ({ fontFamily: f.fontFamily, fontWeight: f.fontWeight, fontStyle: f.fontStyle });

export type ThemeFonts = {
  display: FontFace;
  displaySemi: FontFace;
  displayBold: FontFace;
  /** Italic asides and the accent half of headlines: a true italic in Gilded, upright elsewhere. */
  emphasis: FontFace;
  body: FontFace;
  bodyMedium: FontFace;
  bodySemi: FontFace;
  bodyBold: FontFace;
  bodyHeavy: FontFace;
  /** Big hero figures: Life Path, energy score, timer. */
  numeral: FontFace;
  /** Small figures inside charts and rows. */
  figure: FontFace;
  /** **Bold** inside prose. */
  strong: FontFace;
};

export type Line = { color: string; opacity: number; width: number };

/** The app mark: ring and rays around a star with an open eye. */
export type LogoSpec = {
  ring: Line | null;
  rays: Line | null;
  /** A two-stop gradient (top to bottom), one color, or null for outline only. */
  starFill: [string, string] | string | null;
  starStroke: Line | null;
  eye: { fill: string; stroke: string; width: number };
  iris: { fill: string; stroke?: { color: string; width: number } };
  pupil: { color: string; r: number };
  highlight: string | null;
};

export type TypographyVariant = 'hero' | 'title' | 'heading' | 'body' | 'bodyDim' | 'small' | 'label' | 'number' | 'prose' | 'question';

/** Text styles that belong to one component rather than to the type scale. */
export type UiText =
  | 'button'
  | 'buttonSmall'
  | 'chip'
  | 'tabLabel'
  | 'tabLabelActive'
  | 'tileLabel'
  | 'tileGlyph'
  | 'glyph'
  | 'askInput'
  /** The Calculator's lens switcher: text tabs and pills. */
  | 'lensTab'
  | 'lensPill'
  /** The Calculator's accordion titles and the lens subtitle. */
  | 'sectionTitle'
  | 'subtitle'
  /** The Calendar's week strip, and its daily-reading button. */
  | 'weekday'
  | 'dayNumber'
  | 'action';

/** Layout and component choices each look makes, so screens never branch on a look's id. */
export type ThemeShape = {
  cardRadius: number;
  buttonRadius: number;
  buttonHeight: number;
  fieldRadius: number;
  /** Home tool tiles: glass square, gold ring, gradient square, or a filled card with the label inside. */
  tile: 'glass' | 'ring' | 'gradient' | 'card';
  tileRadius: number;
  tileIconSize: number;
  /** Letterology's tile glyph. */
  letterGlyph: string;
  /** A floating blurred pill plus a round More button, or a full-width bar docked to the bottom. */
  tabBar: 'floating' | 'docked';
  tabActive: 'pill' | 'dot' | 'tint';
  /** How Home and the Calculator top are composed. */
  layout: 'split' | 'wide' | 'calm' | 'editorial';
  /** Home's energy widget. */
  energy: 'dial' | 'ring' | 'orb' | 'meter' | 'figure';
  header: 'avatarMoon' | 'formal' | 'avatarChips' | 'greeting';
  /** Copy tone for greetings and the Jung banner. */
  voice: 'warm' | 'formal' | 'playful';
  lensTabs: 'icons' | 'text' | 'pills';
  /** The starfield, or null for none. */
  stars: { color: string; opacity: number } | null;
  /** Uppercase tracked labels, or sentence-case labels. */
  labelCase: 'upper' | 'sentence';
  /** Tracking in px for uppercase labels at 11px. */
  labelTracking: number;
  /** A small accent dot before section labels. */
  labelDot: boolean;
  /** Uppercase text on primary buttons. */
  ctaUppercase: boolean;
  /** Forecast columns: solid bars or hairlines. */
  chart: 'solid' | 'hairline';
  meter: { height: number; radius: number };
  /** Opacity of the accent halo around the Ask screen's sphere (0 for none). */
  orbHalo: number;
  iconStroke: number;
  iconStrokeBold: number;
  numeralSize: { lg: number; md: number };
  /** How a birth date is written: 09 / 14 / 1985, 14 September 1985, or 14 · 09 · 1985. */
  dateStyle: 'slashes' | 'long' | 'dots';
  calendar: {
    /** 'October 2026', or 'Wednesday, the 14th' under a month label. */
    title: 'monthYear' | 'weekdayOrdinal';
    /** 'WED' or 'W' in the week strip (case comes from ui.weekday). */
    weekday: 'initial' | 'short';
    /** Under each day: a dot whose strength is the score, or the score itself. */
    marker: 'score' | 'dot';
    cellRadius: number;
    /** Month grid fill: accent at opacity min + score/100 × span. */
    heat: { min: number; span: number };
  };
};

export type Shadow = { color: string; opacity: number; radius: number };

export type Theme = {
  id: ThemeId;
  name: string;
  blurb: string;
  scheme: ThemeScheme;
  colors: ThemeColors;
  fonts: ThemeFonts;
  gradients: {
    /** Primary button, top to bottom (the same color twice for a solid button). */
    cta: [string, string];
    /** Hero numerals, top to bottom. */
    numeral: [string, string, string];
    /** The featured card (Jung on Home), top to bottom. */
    hero: [string, string, ...string[]];
    /** Gradient hairline for highlighted cards; null draws a plain accent border. */
    border: [string, string, ...string[]] | null;
    /** At most one in the new looks. */
    glows: Glow[];
    /** The energy orb's body. */
    energyOrb: { colors: [string, string, string, string, string]; locations: [number, number, number, number, number] };
    /** The Ask screen's sphere: highlight, then the accent, then depth and core. */
    sphere: { light: string; deep: string; core: string };
  };
  shadows: {
    numeral: string | null;
    cta: string | null;
    featured: Shadow | null;
    tile: Omit<Shadow, 'radius'> | null;
    /** The floating tab bar. */
    float: Omit<Shadow, 'radius'> | null;
    /** Glow on the highlighted chart column. */
    dataGlow: Omit<Shadow, 'color'> | null;
    orb: Shadow | null;
    orbText: string;
    /** Lift under a selected day, in the accent color. */
    selected: { opacity: number; radius: number; y: number } | null;
  };
  logo: LogoSpec;
  /** The picker swatch, bottom to top. */
  preview: [string, string];
  shape: ThemeShape;
  tileGradients: Record<ToolKey, [string, string]>;
  typography: Record<TypographyVariant, TextStyle>;
  ui: Record<UiText, TextStyle>;
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

type TypeScale = {
  hero: number;
  title: number;
  heading: number;
  number: number;
  labelColor: string;
  tracking: number;
  tight: number;
  labelCase: 'upper' | 'sentence';
  /** Faces for the display variants; default to the look's bold and semibold display faces. */
  heroFace?: FontFace;
  titleFace?: FontFace;
  /** Jung's and Neville's voice in readings and chat. */
  proseFace: FontFace;
};

function typography(c: ThemeColors, f: ThemeFonts, s: TypeScale): Record<TypographyVariant, TextStyle> {
  const label: TextStyle =
    s.labelCase === 'sentence'
      ? { ...f.bodySemi, fontSize: 13, lineHeight: 18, color: s.labelColor }
      : { ...f.bodyHeavy, fontSize: 11, lineHeight: 14, letterSpacing: s.tracking, textTransform: 'uppercase', color: s.labelColor };
  const titleFace = s.titleFace ?? f.displaySemi;
  return {
    hero: { ...(s.heroFace ?? f.displayBold), fontSize: s.hero, lineHeight: Math.round(s.hero * 1.15), letterSpacing: s.tight, color: c.text },
    title: { ...titleFace, fontSize: s.title, lineHeight: Math.round(s.title * 1.18), letterSpacing: s.tight, color: c.text },
    heading: { ...f.displaySemi, fontSize: s.heading, lineHeight: Math.round(s.heading * 1.3), color: c.text },
    body: { ...f.body, fontSize: 16, lineHeight: 24, color: c.text },
    bodyDim: { ...f.body, fontSize: 15, lineHeight: 22, color: c.textDim },
    small: { ...f.bodyMedium, fontSize: 13, lineHeight: 18, color: c.textDim },
    label,
    number: { ...f.numeral, fontSize: s.number, lineHeight: Math.round(s.number * 1.08), color: c.text },
    prose: { ...s.proseFace, fontSize: 17, lineHeight: 26, color: c.text },
    question: { ...titleFace, fontSize: 24, lineHeight: 30, letterSpacing: s.tight, color: c.text },
  };
}

// ── Shared by the three original looks ──────────────────────────────────────
// Values the originals drew with hardcoded colors before these tokens existed; kept exactly.
const ORIGINAL_CHROME = {
  dangerBorder: 'rgba(255,92,122,0.45)',
  scrim: 'rgba(7,7,26,0.72)',
  tabBarBorder: 'transparent',
  inputWell: 'rgba(0,0,0,0.3)',
  pillActive: '#FFFFFF',
  chipBorder: 'transparent',
  onHero: '#FFF4E6',
  onHeroStrong: '#1E0B00',
  heroChip: 'rgba(40,12,0,0.32)',
  heroBorder: 'rgba(255,214,160,0.35)',
  heroButton: 'rgba(40,12,0,0.34)',
  heroButtonBorder: 'rgba(255,236,214,0.55)',
  onOrb: '#FFFFFF',
  orbRing: '#FFFFFF',
  orbTrack: 'rgba(255,255,255,0.14)',
} as const;

const ORIGINAL_LOGO: LogoSpec = {
  ring: { color: '#F4C26B', opacity: 0.6, width: 1.5 },
  rays: { color: '#F4C26B', opacity: 0.75, width: 1.5 },
  starFill: ['#FFD08A', '#FF7A2F'],
  starStroke: { color: '#FFF1DC', opacity: 0.55, width: 1 },
  eye: { fill: '#0B0A1F', stroke: '#FFF1DC', width: 1.6 },
  iris: { fill: '#8B7CFF' },
  pupil: { color: '#0B0A1F', r: 2.8 },
  highlight: '#FFF1DC',
};

const ORIGINAL_ENERGY_ORB: Theme['gradients']['energyOrb'] = {
  colors: ['#FFE6CC', '#FF9A5A', '#E8509A', '#6B4DF0', '#2A1B6B'],
  locations: [0, 0.2, 0.48, 0.78, 1],
};
const ORIGINAL_SPHERE = { light: '#FFE2B8', deep: '#7A3BFF', core: '#2A1460' };

const ORIGINAL_SHAPE = {
  buttonRadius: 999,
  buttonHeight: 54,
  fieldRadius: 16,
  tileRadius: 22,
  tabBar: 'floating',
  labelCase: 'upper',
  labelDot: true,
  meter: { height: 10, radius: 999 },
  orbHalo: 0.35,
  iconStroke: 1.8,
  iconStrokeBold: 2.2,
  numeralSize: { lg: 68, md: 44 },
} as const;

const ORIGINAL_HEAT = { min: 0.18, span: 0.7 };

const ORIGINAL_SHADOWS = {
  float: { color: '#000000', opacity: 0.45 },
  dataGlow: { opacity: 0.55, radius: 12 },
  orb: { color: '#E8509A', opacity: 0.55, radius: 26 },
  orbText: 'rgba(30,10,80,0.7)',
  selected: { opacity: 0.45, radius: 14, y: 6 },
} as const;

// ── A · Ember Glass (original) ──────────────────────────────────────────────
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
  placeholder: '#77749A',
  emphasis: '#FFB04A',
  accent: '#FF7A2F',
  accentBright: '#FFB04A',
  accentSoft: 'rgba(255,122,47,0.15)',
  accentBorder: 'rgba(255,138,61,0.42)',
  onAccent: '#1E0B00',
  glyph: '#FFC26E',
  emblem: '#FF7A2F',
  gold: '#F4C26B',
  goldSoft: 'rgba(244,194,107,0.14)',
  violet: '#A99BFF',
  violetSoft: 'rgba(139,124,255,0.16)',
  teal: '#5FE0BF',
  tealSoft: 'rgba(79,209,181,0.14)',
  danger: '#FF6B86',
  dangerSoft: 'rgba(255,92,122,0.14)',
  track: 'rgba(255,122,47,0.16)',
  meterTrack: 'rgba(255,122,47,0.15)',
  ghostInk: '#FFB04A',
  ghostBorder: 'rgba(255,138,61,0.42)',
  controlBg: 'rgba(255,255,255,0.09)',
  controlBorder: 'rgba(255,255,255,0.10)',
  chipInk: '#ABA8C3',
  chipBg: 'rgba(255,255,255,0.09)',
  field: '#14132E',
  fieldBorder: 'rgba(255,255,255,0.10)',
  switchThumb: '#F4F1EA',
  switchTrack: 'rgba(255,255,255,0.09)',
  tabBar: 'rgba(24,20,44,0.82)',
  tabActive: '#FFB04A',
  tabInactive: '#ABA8C3',
  tabActiveBorder: 'rgba(255,138,61,0.42)',
  tileInk: '#FFB04A',
  tileBg: 'rgba(255,255,255,0.09)',
  tileBorder: 'rgba(255,255,255,0.10)',
  bannerGo: '#FF7A2F',
  onBannerGo: '#1E0B00',
  onPillActive: '#1E0B00',
  ...ORIGINAL_CHROME,
};
const emberFonts: ThemeFonts = {
  display: face('600'),
  displaySemi: face('600'),
  displayBold: face('700'),
  emphasis: face('600'),
  body: face('400'),
  bodyMedium: face('500'),
  bodySemi: face('600'),
  bodyBold: face('700'),
  bodyHeavy: face('800'),
  numeral: face('700'),
  figure: face('600'),
  strong: face('700'),
};

export const EMBER: Theme = {
  id: 'ember',
  name: 'Ember Glass',
  blurb: 'Navy night, ember glow, frosted glass.',
  scheme: 'dark',
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
    energyOrb: ORIGINAL_ENERGY_ORB,
    sphere: ORIGINAL_SPHERE,
  },
  shadows: {
    numeral: 'rgba(255,140,60,0.7)',
    cta: 'rgba(255,106,31,0.45)',
    featured: { color: '#FF7A2F', opacity: 0.35, radius: 22 },
    tile: null,
    ...ORIGINAL_SHADOWS,
  },
  logo: ORIGINAL_LOGO,
  preview: ['#FF681C', '#08081A'],
  shape: {
    ...ORIGINAL_SHAPE,
    cardRadius: 24,
    tile: 'glass',
    tileIconSize: 29,
    letterGlyph: 'ABC',
    tabActive: 'pill',
    layout: 'split',
    energy: 'dial',
    header: 'avatarMoon',
    voice: 'warm',
    lensTabs: 'icons',
    stars: { color: '#FFFFFF', opacity: 1 },
    labelTracking: 1.7,
    ctaUppercase: false,
    chart: 'solid',
    dateStyle: 'slashes',
    calendar: { title: 'monthYear', weekday: 'short', marker: 'dot', cellRadius: 20, heat: ORIGINAL_HEAT },
  },
  tileGradients: tools(['#FFB04A', '#FF7A2F']),
  typography: typography(emberColors, emberFonts, {
    hero: 34,
    title: 26,
    heading: 18,
    number: 56,
    labelColor: emberColors.textDim,
    tracking: 1.7,
    tight: -0.4,
    labelCase: 'upper',
    proseFace: emberFonts.display,
  }),
  ui: {
    button: { ...emberFonts.displayBold, fontSize: 16, letterSpacing: 0 },
    buttonSmall: { fontSize: 14 },
    chip: { ...emberFonts.bodyBold, fontSize: 12.5 },
    tabLabel: { ...emberFonts.bodySemi, fontSize: 11, letterSpacing: 0 },
    tabLabelActive: emberFonts.bodyBold,
    tileLabel: { ...emberFonts.bodySemi, fontSize: 11.5, letterSpacing: 0, color: emberColors.text },
    tileGlyph: { ...emberFonts.displayBold, fontSize: 18 },
    glyph: { ...emberFonts.body, fontSize: 32, lineHeight: 38 },
    askInput: { ...emberFonts.bodyMedium, fontSize: 15 },
    lensTab: { ...emberFonts.bodyBold, fontSize: 11.5, letterSpacing: 1.6, textTransform: 'uppercase' },
    lensPill: { ...emberFonts.bodyBold, fontSize: 13 },
    sectionTitle: { ...emberFonts.displayBold, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' },
    subtitle: { ...emberFonts.displaySemi, fontSize: 17, lineHeight: 23 },
    weekday: { ...emberFonts.bodyBold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase' },
    dayNumber: { ...emberFonts.displayBold, fontSize: 18 },
    action: { ...emberFonts.displaySemi, fontSize: 17 },
  },
};

// ── B · Gilded Night (original) ─────────────────────────────────────────────
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
  placeholder: '#7A7262',
  emphasis: '#F1D9A3',
  accent: '#D9B46C',
  accentBright: '#F1D9A3',
  accentSoft: 'rgba(217,180,108,0.13)',
  accentBorder: 'rgba(217,180,108,0.42)',
  onAccent: '#1A1408',
  glyph: '#F1D9A3',
  emblem: '#D9B46C',
  gold: '#D9B46C',
  goldSoft: 'rgba(217,180,108,0.13)',
  violet: '#C2B6E8',
  violetSoft: 'rgba(194,182,232,0.12)',
  teal: '#9FD4B4',
  tealSoft: 'rgba(159,212,180,0.12)',
  danger: '#E8907F',
  dangerSoft: 'rgba(232,144,127,0.13)',
  track: 'rgba(217,180,108,0.16)',
  meterTrack: 'rgba(217,180,108,0.13)',
  ghostInk: '#F1D9A3',
  ghostBorder: 'rgba(217,180,108,0.42)',
  controlBg: 'transparent',
  controlBorder: 'rgba(217,180,108,0.42)',
  chipInk: '#A89F8E',
  chipBg: 'rgba(217,180,108,0.10)',
  field: '#141210',
  fieldBorder: 'rgba(217,180,108,0.24)',
  switchThumb: '#EFE8DA',
  switchTrack: 'rgba(217,180,108,0.10)',
  tabBar: 'rgba(18,16,14,0.94)',
  tabActive: '#F1D9A3',
  tabInactive: '#A89F8E',
  tabActiveBorder: 'rgba(217,180,108,0.42)',
  tileInk: '#D9B46C',
  tileBg: 'rgba(217,180,108,0.10)',
  tileBorder: 'rgba(217,180,108,0.24)',
  bannerGo: '#D9B46C',
  onBannerGo: '#1A1408',
  onPillActive: '#1A1408',
  ...ORIGINAL_CHROME,
};
const gildedFonts: ThemeFonts = {
  display: face('500'),
  displaySemi: face('600'),
  displayBold: face('600'),
  emphasis: face('500', true),
  body: face('400'),
  bodyMedium: face('500'),
  bodySemi: face('600'),
  bodyBold: face('700'),
  bodyHeavy: face('700'),
  numeral: face('600'),
  figure: face('600'),
  strong: face('600'),
};

export const GILDED: Theme = {
  id: 'gilded',
  name: 'Gilded Night',
  blurb: 'Black and champagne gold, fine gold lines.',
  scheme: 'dark',
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
    energyOrb: ORIGINAL_ENERGY_ORB,
    sphere: ORIGINAL_SPHERE,
  },
  shadows: {
    numeral: null,
    cta: 'rgba(201,154,78,0.28)',
    featured: { color: '#D9B46C', opacity: 0.15, radius: 22 },
    tile: null,
    ...ORIGINAL_SHADOWS,
  },
  logo: ORIGINAL_LOGO,
  preview: ['#D9B46C', '#0B0A09'],
  shape: {
    ...ORIGINAL_SHAPE,
    cardRadius: 20,
    tile: 'ring',
    tileIconSize: 26,
    letterGlyph: 'Aa',
    tabActive: 'dot',
    layout: 'wide',
    energy: 'ring',
    header: 'formal',
    voice: 'formal',
    lensTabs: 'text',
    stars: { color: '#F1D9A3', opacity: 0.55 },
    labelTracking: 2.4,
    ctaUppercase: true,
    chart: 'hairline',
    dateStyle: 'long',
    calendar: { title: 'weekdayOrdinal', weekday: 'initial', marker: 'dot', cellRadius: 39, heat: ORIGINAL_HEAT },
  },
  tileGradients: tools(['#F1D9A3', '#C99A4E']),
  // The display sizes were set for Cormorant's small x-height; on SF Pro they step down to read the same.
  typography: typography(gildedColors, gildedFonts, {
    hero: 36,
    title: 28,
    heading: 20,
    number: 60,
    labelColor: gildedColors.accent,
    tracking: 2.4,
    tight: 0,
    labelCase: 'upper',
    heroFace: gildedFonts.display,
    titleFace: gildedFonts.display,
    proseFace: gildedFonts.display,
  }),
  ui: {
    button: { ...gildedFonts.bodyHeavy, fontSize: 13, letterSpacing: 2.4 },
    buttonSmall: { fontSize: 11.5 },
    chip: { ...gildedFonts.bodyBold, fontSize: 12.5 },
    tabLabel: { ...gildedFonts.bodyBold, fontSize: 9.5, letterSpacing: 0.8, textTransform: 'uppercase' },
    tabLabelActive: gildedFonts.bodyBold,
    tileLabel: { ...gildedFonts.bodyBold, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase', color: gildedColors.textDim },
    tileGlyph: { ...gildedFonts.displayBold, fontSize: 21 },
    glyph: { ...gildedFonts.body, fontSize: 32, lineHeight: 38 },
    askInput: { ...gildedFonts.emphasis, fontSize: 18 },
    lensTab: { ...gildedFonts.bodyBold, fontSize: 11.5, letterSpacing: 1.6, textTransform: 'uppercase' },
    lensPill: { ...gildedFonts.bodyBold, fontSize: 13 },
    sectionTitle: { ...gildedFonts.displaySemi, fontSize: 20, letterSpacing: 0 },
    subtitle: { ...gildedFonts.displaySemi, fontSize: 22, lineHeight: 26 },
    weekday: { ...gildedFonts.bodyBold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase' },
    dayNumber: { ...gildedFonts.displayBold, fontSize: 22 },
    action: { ...gildedFonts.emphasis, fontSize: 20 },
  },
};

// ── C · Nebula (original) ───────────────────────────────────────────────────
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
  placeholder: '#8A82B5',
  emphasis: '#C9BEFF',
  accent: '#8B7CFF',
  accentBright: '#C9BEFF',
  accentSoft: 'rgba(139,124,255,0.26)',
  accentBorder: 'rgba(139,124,255,0.55)',
  onAccent: '#1B1245',
  glyph: '#FFD7B0',
  emblem: '#C9BEFF',
  gold: '#FFC24D',
  goldSoft: 'rgba(255,194,77,0.18)',
  violet: '#C9BEFF',
  violetSoft: 'rgba(139,124,255,0.22)',
  teal: '#7BE3A6',
  tealSoft: 'rgba(87,217,138,0.18)',
  danger: '#FF7D97',
  dangerSoft: 'rgba(255,107,139,0.18)',
  track: 'rgba(159,134,255,0.22)',
  meterTrack: 'rgba(139,124,255,0.26)',
  ghostInk: '#C9BEFF',
  ghostBorder: 'rgba(139,124,255,0.55)',
  controlBg: 'rgba(255,255,255,0.12)',
  controlBorder: 'rgba(255,255,255,0.16)',
  chipInk: '#B9B2DD',
  chipBg: 'rgba(255,255,255,0.12)',
  field: '#17123A',
  fieldBorder: 'rgba(255,255,255,0.16)',
  switchThumb: '#F5F3FF',
  switchTrack: 'rgba(255,255,255,0.12)',
  tabBar: 'rgba(30,22,70,0.66)',
  tabActive: '#FFFFFF',
  tabInactive: '#B9B2DD',
  tabActiveBorder: 'transparent',
  tileInk: '#FFFFFF',
  tileBg: 'rgba(255,255,255,0.12)',
  tileBorder: 'rgba(255,255,255,0.16)',
  bannerGo: '#FFFFFF',
  onBannerGo: '#1B1245',
  onPillActive: '#1B1245',
  ...ORIGINAL_CHROME,
};
const nebulaFonts: ThemeFonts = {
  display: face('600'),
  displaySemi: face('600'),
  displayBold: face('700'),
  emphasis: face('500'),
  body: face('400'),
  bodyMedium: face('500'),
  bodySemi: face('600'),
  bodyBold: face('700'),
  bodyHeavy: face('700'),
  numeral: face('700'),
  figure: face('600'),
  strong: face('700'),
};

export const NEBULA: Theme = {
  id: 'nebula',
  name: 'Nebula',
  blurb: 'Violet, magenta and ember light through frosted glass.',
  scheme: 'dark',
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
    energyOrb: ORIGINAL_ENERGY_ORB,
    sphere: ORIGINAL_SPHERE,
  },
  shadows: {
    numeral: 'rgba(232,80,154,0.45)',
    cta: 'rgba(232,80,154,0.45)',
    featured: { color: '#8B7CFF', opacity: 0.35, radius: 22 },
    tile: { color: '#000000', opacity: 0.3 },
    ...ORIGINAL_SHADOWS,
  },
  logo: ORIGINAL_LOGO,
  preview: ['#7C5CFF', '#0A0820'],
  shape: {
    ...ORIGINAL_SHAPE,
    cardRadius: 28,
    tile: 'gradient',
    tileIconSize: 29,
    letterGlyph: 'ABC',
    tabActive: 'pill',
    layout: 'wide',
    energy: 'orb',
    header: 'avatarChips',
    voice: 'playful',
    lensTabs: 'pills',
    stars: { color: '#FFFFFF', opacity: 1 },
    labelTracking: 1.8,
    ctaUppercase: false,
    chart: 'solid',
    dateStyle: 'dots',
    calendar: { title: 'monthYear', weekday: 'short', marker: 'score', cellRadius: 20, heat: ORIGINAL_HEAT },
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
  typography: typography(nebulaColors, nebulaFonts, {
    hero: 34,
    title: 28,
    heading: 19,
    number: 56,
    labelColor: nebulaColors.accentBright,
    tracking: 1.8,
    tight: -0.6,
    labelCase: 'upper',
    proseFace: nebulaFonts.display,
  }),
  ui: {
    button: { ...nebulaFonts.displayBold, fontSize: 16, letterSpacing: 0 },
    buttonSmall: { fontSize: 14 },
    chip: { ...nebulaFonts.bodyBold, fontSize: 12.5 },
    tabLabel: { ...nebulaFonts.bodySemi, fontSize: 11, letterSpacing: 0 },
    tabLabelActive: nebulaFonts.bodyBold,
    tileLabel: { ...nebulaFonts.bodySemi, fontSize: 11.5, letterSpacing: 0, color: nebulaColors.text },
    tileGlyph: { ...nebulaFonts.displayBold, fontSize: 18 },
    glyph: { ...nebulaFonts.body, fontSize: 32, lineHeight: 38 },
    askInput: { ...nebulaFonts.bodyMedium, fontSize: 15 },
    lensTab: { ...nebulaFonts.bodyBold, fontSize: 11.5, letterSpacing: 1.6, textTransform: 'uppercase' },
    lensPill: { ...nebulaFonts.bodyBold, fontSize: 13 },
    sectionTitle: { ...nebulaFonts.displayBold, fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' },
    subtitle: { ...nebulaFonts.displaySemi, fontSize: 17, lineHeight: 23 },
    weekday: { ...nebulaFonts.bodyBold, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase' },
    dayNumber: { ...nebulaFonts.displayBold, fontSize: 18 },
    action: { ...nebulaFonts.displaySemi, fontSize: 17 },
  },
};

// ── Shared by the three new looks ───────────────────────────────────────────
// Solid fills, no gradients or glows beyond Ember Quiet's one horizon light, no stars, a docked tab bar.
const NEW_SHAPE = {
  buttonHeight: 56,
  tile: 'card',
  tileIconSize: 22,
  letterGlyph: 'Aa',
  tabBar: 'docked',
  tabActive: 'tint',
  header: 'greeting',
  stars: null,
  labelDot: false,
  ctaUppercase: false,
  orbHalo: 0,
  numeralSize: { lg: 92, md: 44 },
} as const;

const NO_SHADOWS = {
  numeral: null,
  cta: null,
  featured: null,
  tile: null,
  float: null,
  dataGlow: null,
  orb: null,
  orbText: 'transparent',
  selected: null,
} as const;

const calmFonts: ThemeFonts = {
  display: face('700'),
  displaySemi: face('600'),
  displayBold: face('700'),
  emphasis: {},
  body: face('400'),
  bodyMedium: face('500'),
  bodySemi: face('600'),
  bodyBold: face('600'),
  bodyHeavy: face('600'),
  numeral: face('200'),
  figure: face('500'),
  strong: face('600'),
};

const calmUi = (c: ThemeColors): Record<UiText, TextStyle> => ({
  button: { ...calmFonts.bodySemi, fontSize: 17, letterSpacing: 0 },
  buttonSmall: { fontSize: 15 },
  chip: { ...calmFonts.body, fontSize: 14 },
  tabLabel: { ...calmFonts.bodySemi, fontSize: 10, letterSpacing: 0 },
  tabLabelActive: calmFonts.bodySemi,
  tileLabel: { ...calmFonts.body, fontSize: 12, lineHeight: 15, letterSpacing: 0, color: c.text },
  tileGlyph: { ...calmFonts.bodySemi, fontSize: 16 },
  glyph: { ...calmFonts.body, fontSize: 30, lineHeight: 36 },
  askInput: { ...calmFonts.body, fontSize: 16 },
  lensTab: { ...calmFonts.bodySemi, fontSize: 13 },
  lensPill: { ...calmFonts.bodySemi, fontSize: 14 },
  sectionTitle: { ...calmFonts.bodySemi, fontSize: 15, letterSpacing: 0 },
  subtitle: { ...calmFonts.displaySemi, fontSize: 17, lineHeight: 22 },
  weekday: { ...calmFonts.bodySemi, fontSize: 11, letterSpacing: 0.2 },
  dayNumber: { ...calmFonts.displaySemi, fontSize: 18 },
  action: { ...calmFonts.bodySemi, fontSize: 17 },
});

// ── D · Ember Quiet (new) ───────────────────────────────────────────────────
// One ember accent on warm near-black, with a single low horizon light.
const emberQuietColors: ThemeColors = {
  bg: '#110F0D',
  bgElev: '#1B1815',
  card: '#1B1815',
  cardSolid: '#1B1815',
  cardHi: '#25211D',
  border: 'rgba(244,238,228,0.10)',
  borderHi: 'rgba(244,238,228,0.20)',
  text: '#F4EEE4',
  textDim: '#A69D91',
  textFaint: '#7A7268',
  placeholder: '#8E867B',
  emphasis: '#E8743B',
  accent: '#E8743B',
  accentBright: '#F09A63',
  accentSoft: 'rgba(232,116,59,0.12)',
  accentBorder: 'rgba(232,116,59,0.45)',
  onAccent: '#1A0C04',
  glyph: '#E8743B',
  emblem: '#E8743B',
  gold: '#D9A441',
  goldSoft: 'rgba(217,164,65,0.12)',
  violet: '#C7B9A6',
  violetSoft: 'rgba(199,185,166,0.10)',
  teal: '#8FBF9F',
  tealSoft: 'rgba(143,191,159,0.12)',
  danger: '#F07A6A',
  dangerSoft: 'rgba(240,122,106,0.12)',
  dangerBorder: 'rgba(240,122,106,0.40)',
  track: 'rgba(244,238,228,0.10)',
  meterTrack: 'rgba(244,238,228,0.10)',
  ghostInk: '#F4EEE4',
  ghostBorder: 'transparent',
  controlBg: '#1B1815',
  controlBorder: 'transparent',
  chipInk: '#F4EEE4',
  chipBg: 'transparent',
  chipBorder: 'rgba(244,238,228,0.14)',
  field: '#110F0D',
  fieldBorder: 'rgba(244,238,228,0.12)',
  switchThumb: '#F4EEE4',
  switchTrack: 'rgba(244,238,228,0.14)',
  tabBar: '#110F0D',
  tabActive: '#E8743B',
  tabBarBorder: 'rgba(244,238,228,0.08)',
  tabInactive: '#8E867B',
  tabActiveBorder: 'transparent',
  tileInk: '#E8743B',
  tileBg: '#1B1815',
  tileBorder: 'transparent',
  bannerGo: '#E8743B',
  onBannerGo: '#1A0C04',
  pillActive: '#E8743B',
  onPillActive: '#1A0C04',
  scrim: 'rgba(6,5,4,0.62)',
  inputWell: '#110F0D',
  onHero: '#F4EEE4',
  onHeroStrong: '#F4EEE4',
  heroChip: 'rgba(244,238,228,0.08)',
  heroBorder: 'rgba(244,238,228,0.10)',
  heroButton: 'rgba(244,238,228,0.06)',
  heroButtonBorder: 'rgba(244,238,228,0.18)',
  onOrb: '#F4EEE4',
  orbRing: '#E8743B',
  orbTrack: 'rgba(244,238,228,0.10)',
};

export const EMBER_QUIET: Theme = {
  id: 'emberQuiet',
  name: 'Ember Quiet',
  blurb: 'Warm night, one ember, a low horizon light.',
  scheme: 'dark',
  colors: emberQuietColors,
  fonts: calmFonts,
  gradients: {
    cta: ['#E8743B', '#E8743B'],
    numeral: ['#F4EEE4', '#F4EEE4', '#F4EEE4'],
    hero: ['#1B1815', '#1B1815'],
    border: null,
    glows: [{ cx: 50, cy: 108, rx: 95, ry: 52, color: '#E8743B', opacity: 0.16 }],
    energyOrb: { colors: ['#F6C9A8', '#E8743B', '#C4582A', '#7A3418', '#2A140A'], locations: [0, 0.2, 0.48, 0.78, 1] },
    sphere: { light: '#F6D2B8', deep: '#B8562A', core: '#2A140A' },
  },
  shadows: NO_SHADOWS,
  logo: {
    ring: { color: '#E8743B', opacity: 0.55, width: 1.2 },
    rays: { color: '#E8743B', opacity: 0.6, width: 1.2 },
    starFill: '#E8743B',
    starStroke: null,
    eye: { fill: '#110F0D', stroke: '#F4EEE4', width: 1.6 },
    iris: { fill: '#F4EEE4' },
    pupil: { color: '#110F0D', r: 2.8 },
    highlight: null,
  },
  preview: ['#3A2216', '#110F0D'],
  shape: {
    ...NEW_SHAPE,
    cardRadius: 22,
    buttonRadius: 16,
    fieldRadius: 22,
    tileRadius: 16,
    layout: 'calm',
    energy: 'meter',
    voice: 'warm',
    lensTabs: 'pills',
    labelCase: 'sentence',
    labelTracking: 0,
    chart: 'solid',
    meter: { height: 6, radius: 999 },
    iconStroke: 1.8,
    iconStrokeBold: 2.4,
    dateStyle: 'long',
    calendar: { title: 'monthYear', weekday: 'short', marker: 'dot', cellRadius: 18, heat: { min: 0.12, span: 0.5 } },
  },
  tileGradients: tools(['#E8743B', '#E8743B']),
  typography: typography(emberQuietColors, calmFonts, {
    hero: 34,
    title: 28,
    heading: 18,
    number: 64,
    labelColor: emberQuietColors.textDim,
    tracking: 0,
    tight: -0.4,
    labelCase: 'sentence',
    titleFace: calmFonts.displayBold,
    proseFace: calmFonts.body,
  }),
  ui: calmUi(emberQuietColors),
};

// ── E · Night & Brass (new) ─────────────────────────────────────────────────
// Neutral black, one brass accent, hairline rules and outlined cards. No glow, no stars.
const brassColors: ThemeColors = {
  bg: '#0C0C0D',
  bgElev: '#151517',
  card: '#0C0C0D',
  cardSolid: '#0C0C0D',
  cardHi: '#151517',
  border: 'rgba(237,235,230,0.14)',
  borderHi: 'rgba(237,235,230,0.26)',
  text: '#EDEBE6',
  textDim: '#9C9890',
  textFaint: '#6E6A64',
  placeholder: '#8C8880',
  emphasis: '#C9A96B',
  accent: '#C9A96B',
  accentBright: '#D8BC85',
  accentSoft: 'rgba(201,169,107,0.10)',
  accentBorder: 'rgba(201,169,107,0.45)',
  onAccent: '#17130B',
  glyph: '#C9A96B',
  emblem: '#C9A96B',
  gold: '#C9A96B',
  goldSoft: 'rgba(201,169,107,0.10)',
  violet: '#B9B2A5',
  violetSoft: 'rgba(185,178,165,0.08)',
  teal: '#9DBF9E',
  tealSoft: 'rgba(157,191,158,0.10)',
  danger: '#E88A7A',
  dangerSoft: 'rgba(232,138,122,0.10)',
  dangerBorder: 'rgba(232,138,122,0.40)',
  track: 'rgba(237,235,230,0.12)',
  meterTrack: 'rgba(237,235,230,0.12)',
  ghostInk: '#EDEBE6',
  ghostBorder: 'rgba(237,235,230,0.18)',
  controlBg: 'transparent',
  controlBorder: 'rgba(237,235,230,0.16)',
  chipInk: '#EDEBE6',
  chipBg: 'transparent',
  chipBorder: 'rgba(237,235,230,0.14)',
  field: '#0C0C0D',
  fieldBorder: 'rgba(237,235,230,0.18)',
  switchThumb: '#EDEBE6',
  switchTrack: 'rgba(237,235,230,0.16)',
  tabBar: '#0C0C0D',
  tabActive: '#C9A96B',
  tabBarBorder: 'rgba(237,235,230,0.12)',
  tabInactive: '#8C8880',
  tabActiveBorder: 'transparent',
  tileInk: '#C9A96B',
  tileBg: '#0C0C0D',
  tileBorder: 'rgba(237,235,230,0.12)',
  bannerGo: '#C9A96B',
  onBannerGo: '#17130B',
  pillActive: '#C9A96B',
  onPillActive: '#17130B',
  scrim: 'rgba(0,0,0,0.66)',
  inputWell: '#0C0C0D',
  onHero: '#EDEBE6',
  onHeroStrong: '#EDEBE6',
  heroChip: 'rgba(237,235,230,0.06)',
  heroBorder: 'rgba(237,235,230,0.14)',
  heroButton: 'transparent',
  heroButtonBorder: 'rgba(237,235,230,0.18)',
  onOrb: '#EDEBE6',
  orbRing: '#C9A96B',
  orbTrack: 'rgba(237,235,230,0.12)',
};
const brassFonts: ThemeFonts = {
  ...calmFonts,
  display: face('300'),
  displaySemi: face('500'),
  displayBold: face('600'),
  numeral: face('100'),
  figure: face('400'),
};

export const BRASS: Theme = {
  id: 'brass',
  name: 'Night & Brass',
  blurb: 'Black, brass and fine lines. No glow.',
  scheme: 'dark',
  colors: brassColors,
  fonts: brassFonts,
  gradients: {
    cta: ['#C9A96B', '#C9A96B'],
    numeral: ['#C9A96B', '#C9A96B', '#C9A96B'],
    hero: ['#0C0C0D', '#0C0C0D'],
    border: null,
    glows: [],
    energyOrb: { colors: ['#E9D9B5', '#C9A96B', '#A88A50', '#5E4C2A', '#1A160E'], locations: [0, 0.2, 0.48, 0.78, 1] },
    sphere: { light: '#E9D9B5', deep: '#8A7140', core: '#1A160E' },
  },
  shadows: NO_SHADOWS,
  logo: {
    ring: null,
    rays: null,
    starFill: null,
    starStroke: { color: '#C9A96B', opacity: 1, width: 1.4 },
    eye: { fill: '#0C0C0D', stroke: '#EDEBE6', width: 1.4 },
    iris: { fill: 'none', stroke: { color: '#C9A96B', width: 1.4 } },
    pupil: { color: '#C9A96B', r: 2.6 },
    highlight: null,
  },
  preview: ['#1A1814', '#0C0C0D'],
  shape: {
    ...NEW_SHAPE,
    cardRadius: 12,
    buttonRadius: 12,
    buttonHeight: 54,
    fieldRadius: 12,
    tileRadius: 12,
    layout: 'editorial',
    energy: 'figure',
    voice: 'formal',
    lensTabs: 'text',
    labelCase: 'upper',
    labelTracking: 1.8,
    chart: 'hairline',
    meter: { height: 2, radius: 0 },
    iconStroke: 1.5,
    iconStrokeBold: 2.2,
    numeralSize: { lg: 118, md: 44 },
    dateStyle: 'long',
    calendar: { title: 'weekdayOrdinal', weekday: 'short', marker: 'score', cellRadius: 12, heat: { min: 0.1, span: 0.45 } },
  },
  tileGradients: tools(['#C9A96B', '#C9A96B']),
  typography: typography(brassColors, brassFonts, {
    hero: 38,
    title: 30,
    heading: 19,
    number: 84,
    labelColor: brassColors.textDim,
    tracking: 1.8,
    tight: -0.5,
    labelCase: 'upper',
    heroFace: brassFonts.display,
    titleFace: brassFonts.display,
    proseFace: brassFonts.body,
  }),
  ui: {
    ...calmUi(brassColors),
    button: { ...brassFonts.bodySemi, fontSize: 17, letterSpacing: 0 },
    glyph: { ...brassFonts.body, fontSize: 26, lineHeight: 32 },
    lensTab: { ...brassFonts.bodySemi, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase' },
    sectionTitle: { ...brassFonts.bodySemi, fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase' },
    subtitle: { ...brassFonts.display, fontSize: 20, lineHeight: 25 },
    weekday: { ...brassFonts.bodySemi, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase' },
    dayNumber: { ...brassFonts.numeral, fontSize: 22 },
  },
};

// ── F · Daylight (new) ──────────────────────────────────────────────────────
// The light look: warm paper, ink, one deep blue. White cards, no glow, no stars.
const daylightColors: ThemeColors = {
  bg: '#F5F2EC',
  bgElev: '#FFFFFF',
  card: '#FFFFFF',
  cardSolid: '#FFFFFF',
  cardHi: '#EFEBE3',
  border: 'rgba(23,22,20,0.10)',
  borderHi: 'rgba(23,22,20,0.20)',
  text: '#171614',
  textDim: '#5F5A52',
  textFaint: '#8A847A',
  placeholder: '#6F6A62',
  emphasis: '#2C4A9E',
  accent: '#2C4A9E',
  accentBright: '#2C4A9E',
  accentSoft: 'rgba(44,74,158,0.08)',
  accentBorder: 'rgba(44,74,158,0.35)',
  onAccent: '#FFFFFF',
  glyph: '#2C4A9E',
  emblem: '#2C4A9E',
  gold: '#8A5A12',
  goldSoft: 'rgba(138,90,18,0.08)',
  violet: '#4A4F7A',
  violetSoft: 'rgba(74,79,122,0.07)',
  teal: '#1F6B4C',
  tealSoft: 'rgba(31,107,76,0.08)',
  danger: '#A3261C',
  dangerSoft: 'rgba(163,38,28,0.07)',
  dangerBorder: 'rgba(163,38,28,0.35)',
  track: 'rgba(23,22,20,0.08)',
  meterTrack: 'rgba(23,22,20,0.08)',
  ghostInk: '#171614',
  ghostBorder: 'transparent',
  controlBg: '#FFFFFF',
  controlBorder: 'rgba(23,22,20,0.10)',
  chipInk: '#171614',
  chipBg: 'transparent',
  chipBorder: 'rgba(23,22,20,0.14)',
  field: '#F5F2EC',
  fieldBorder: 'rgba(23,22,20,0.12)',
  switchThumb: '#FFFFFF',
  switchTrack: 'rgba(23,22,20,0.16)',
  tabBar: '#F5F2EC',
  tabActive: '#2C4A9E',
  tabBarBorder: 'rgba(23,22,20,0.10)',
  tabInactive: '#6F6A62',
  tabActiveBorder: 'transparent',
  tileInk: '#2C4A9E',
  tileBg: '#FFFFFF',
  tileBorder: 'rgba(23,22,20,0.08)',
  bannerGo: '#2C4A9E',
  onBannerGo: '#FFFFFF',
  pillActive: '#2C4A9E',
  onPillActive: '#FFFFFF',
  scrim: 'rgba(23,22,20,0.35)',
  inputWell: '#F5F2EC',
  onHero: '#171614',
  onHeroStrong: '#171614',
  heroChip: 'rgba(23,22,20,0.05)',
  heroBorder: 'rgba(23,22,20,0.10)',
  heroButton: 'transparent',
  heroButtonBorder: 'rgba(23,22,20,0.18)',
  onOrb: '#FFFFFF',
  orbRing: '#2C4A9E',
  orbTrack: 'rgba(23,22,20,0.08)',
};

export const DAYLIGHT: Theme = {
  id: 'daylight',
  name: 'Daylight',
  blurb: 'Paper, ink and one deep blue.',
  scheme: 'light',
  colors: daylightColors,
  fonts: calmFonts,
  gradients: {
    cta: ['#2C4A9E', '#2C4A9E'],
    numeral: ['#171614', '#171614', '#171614'],
    hero: ['#FFFFFF', '#FFFFFF'],
    border: null,
    glows: [],
    energyOrb: { colors: ['#C9D4F0', '#6F86C8', '#2C4A9E', '#1E3577', '#101A3A'], locations: [0, 0.2, 0.48, 0.78, 1] },
    sphere: { light: '#C9D4F0', deep: '#1E3577', core: '#101A3A' },
  },
  shadows: NO_SHADOWS,
  logo: {
    ring: { color: '#171614', opacity: 0.25, width: 1 },
    rays: { color: '#171614', opacity: 0.35, width: 1 },
    starFill: '#2C4A9E',
    starStroke: null,
    eye: { fill: '#F5F2EC', stroke: '#F5F2EC', width: 1.6 },
    iris: { fill: '#171614' },
    pupil: { color: '#F5F2EC', r: 2.8 },
    highlight: null,
  },
  preview: ['#E6DFD3', '#F5F2EC'],
  shape: {
    ...NEW_SHAPE,
    cardRadius: 20,
    buttonRadius: 16,
    fieldRadius: 22,
    tileRadius: 16,
    layout: 'calm',
    energy: 'meter',
    voice: 'warm',
    lensTabs: 'pills',
    labelCase: 'sentence',
    labelTracking: 0,
    chart: 'solid',
    meter: { height: 6, radius: 999 },
    iconStroke: 1.8,
    iconStrokeBold: 2.4,
    dateStyle: 'long',
    calendar: { title: 'monthYear', weekday: 'short', marker: 'dot', cellRadius: 18, heat: { min: 0.08, span: 0.32 } },
  },
  tileGradients: tools(['#2C4A9E', '#2C4A9E']),
  typography: typography(daylightColors, calmFonts, {
    hero: 34,
    title: 28,
    heading: 18,
    number: 64,
    labelColor: daylightColors.textDim,
    tracking: 0,
    tight: -0.5,
    labelCase: 'sentence',
    titleFace: calmFonts.displayBold,
    proseFace: calmFonts.body,
  }),
  ui: calmUi(daylightColors),
};

export const THEMES: Record<ThemeId, Theme> = {
  ember: EMBER,
  gilded: GILDED,
  nebula: NEBULA,
  emberQuiet: EMBER_QUIET,
  brass: BRASS,
  daylight: DAYLIGHT,
};
/** Picker order: the originals, then the new looks. */
export const THEME_IDS: ThemeId[] = ['ember', 'gilded', 'nebula', 'emberQuiet', 'brass', 'daylight'];
export const ORIGINAL_THEME_IDS: ThemeId[] = ['ember', 'gilded', 'nebula'];
export const NEW_THEME_IDS: ThemeId[] = ['emberQuiet', 'brass', 'daylight'];
export const isThemeId = (v: unknown): v is ThemeId => typeof v === 'string' && Object.prototype.hasOwnProperty.call(THEMES, v);
