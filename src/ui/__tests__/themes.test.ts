import { THEME_IDS, THEMES, type ThemeColors } from '@/ui/themes';

type RGBA = [number, number, number, number];

function parse(color: string): RGBA {
  const hex = /^#([0-9a-f]{6})$/i.exec(color);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const rgba = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(color);
  if (rgba) return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), Number(rgba[4])];
  throw new Error(`Unparseable color ${color}`);
}

/** A translucent color as it actually appears over an opaque ground. */
function over(top: string, ground: string): RGBA {
  const [r, g, b, a] = parse(top);
  const [R, G, B] = parse(ground);
  return [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
}

function luminance([r, g, b]: RGBA): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(fg: RGBA, bg: RGBA): number {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

describe.each(THEME_IDS)('%s theme', (id) => {
  const t = THEMES[id];
  const surfaces: [string, RGBA][] = [
    ['bg', parse(t.colors.bg)],
    ['card', over(t.colors.card, t.colors.bg)],
    ['cardSolid', parse(t.colors.cardSolid)],
  ];

  test('every color token is set and parseable', () => {
    for (const [key, value] of Object.entries(t.colors) as [keyof ThemeColors, string][]) {
      expect(typeof value).toBe('string');
      expect(() => parse(value)).not.toThrow();
      expect(key.length).toBeGreaterThan(0);
    }
  });

  test.each(['text', 'textDim', 'accentBright'] as const)('%s is readable (4.5:1) on every surface', (token) => {
    for (const [, surface] of surfaces) expect(contrast(parse(t.colors[token]), surface)).toBeGreaterThanOrEqual(4.5);
  });

  test('labels are readable on cards', () => {
    const label = String(t.typography.label.color);
    for (const [, surface] of surfaces) expect(contrast(parse(label), surface)).toBeGreaterThanOrEqual(4.5);
  });

  test('call-to-action text is readable across the whole gradient', () => {
    for (const stop of t.gradients.cta) expect(contrast(parse(t.colors.onAccent), parse(stop))).toBeGreaterThanOrEqual(4.5);
  });

  test('every font role and typography variant is defined', () => {
    for (const f of Object.values(t.fonts)) expect(f).toMatch(/_\d00/);
    for (const v of ['hero', 'title', 'heading', 'body', 'bodyDim', 'small', 'label', 'number'] as const) {
      expect(t.typography[v].fontFamily).toBeTruthy();
      expect(t.typography[v].fontSize).toBeGreaterThan(0);
    }
  });
});
