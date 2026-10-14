import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { NEW_THEME_IDS, ORIGINAL_THEME_IDS, THEME_IDS, THEMES, type ThemeColors } from '@/ui/themes';

type RGBA = [number, number, number, number];

function parse(color: string): RGBA {
  if (color === 'transparent') return [0, 0, 0, 0];
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
function over(top: string, ground: string | RGBA): RGBA {
  const [r, g, b, a] = parse(top);
  const [R, G, B] = typeof ground === 'string' ? parse(ground) : ground;
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

test('six looks: the three originals and the three new ones', () => {
  expect(THEME_IDS).toEqual([...ORIGINAL_THEME_IDS, ...NEW_THEME_IDS]);
  for (const id of THEME_IDS) expect(THEMES[id].id).toBe(id);
  expect(THEME_IDS.filter((id) => THEMES[id].scheme === 'light')).toEqual(['daylight']);
});

describe.each(THEME_IDS)('%s', (id) => {
  const t = THEMES[id];
  const c = t.colors;
  const ground = (fill: string) => over(fill === 'transparent' ? c.bg : fill, c.bg);
  const surfaces: [string, RGBA][] = [
    ['bg', parse(c.bg)],
    ['card', ground(c.card)],
    ['cardSolid', parse(c.cardSolid)],
  ];

  test('every color token is set and parseable', () => {
    for (const [key, value] of Object.entries(c) as [keyof ThemeColors, string][]) {
      expect(typeof value).toBe(`string`);
      expect(() => parse(value)).not.toThrow();
      expect(key.length).toBeGreaterThan(0);
    }
  });

  test.each(['text', 'textDim', 'accentBright', 'emphasis', 'ghostInk', 'chipInk'] as const)('%s is readable (4.5:1) on every surface', (token) => {
    for (const [, surface] of surfaces) expect(contrast(parse(c[token]), surface)).toBeGreaterThanOrEqual(4.5);
  });

  test('labels are readable on cards', () => {
    const label = String(t.typography.label.color);
    for (const [, surface] of surfaces) expect(contrast(parse(label), surface)).toBeGreaterThanOrEqual(4.5);
  });

  test('the Home Ask placeholder is readable in its well', () => {
    expect(contrast(parse(c.askPlaceholder), over(c.inputWell, ground(c.card)))).toBeGreaterThanOrEqual(4.5);
  });

  test('Mandala labels are readable on their pills over the fill and the track', () => {
    for (const fill of [over(c.gold, c.bg), over(c.goldSoft, c.bg)]) expect(contrast(parse(c.text), over(c.labelScrim, fill))).toBeGreaterThanOrEqual(4.5);
  });

  test('call-to-action text is readable across the whole gradient', () => {
    for (const stop of t.gradients.cta) expect(contrast(parse(c.onAccent), parse(stop))).toBeGreaterThanOrEqual(4.5);
  });

  test('tab bar, tiles, banner and pill text are readable', () => {
    const bar = ground(c.tabBar);
    expect(contrast(parse(c.tabActive), bar)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(parse(c.tabInactive), bar)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(parse(c.onBannerGo), parse(c.bannerGo))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(parse(c.onPillActive), parse(c.pillActive))).toBeGreaterThanOrEqual(4.5);
    // Gradient tiles draw their ink on per-tool gradients; the others on the tile fill.
    if (t.shape.tile !== 'gradient') expect(contrast(parse(c.tileInk), ground(c.tileBg))).toBeGreaterThanOrEqual(3);
  });

  test('every font face has a weight, and every type style and component text style is defined', () => {
    for (const [role, f] of Object.entries(t.fonts)) {
      if (role === 'emphasis') continue; // {} inherits the surrounding weight in the new looks
      expect(f.fontWeight).toBeTruthy();
    }
    for (const v of ['hero', 'title', 'heading', 'body', 'bodyDim', 'small', 'label', 'number', 'prose', 'question'] as const) {
      expect(t.typography[v].fontWeight).toBeTruthy();
      expect(t.typography[v].fontSize).toBeGreaterThan(0);
    }
    for (const u of ['button', 'buttonSmall', 'chip', 'tabLabel', 'tabLabelActive', 'tileLabel', 'tileGlyph', 'glyph', 'compound'] as const) {
      expect(t.ui[u]).toBeTruthy();
    }
  });
});

describe.each(NEW_THEME_IDS)('new look %s stays calm', (id) => {
  const t = THEMES[id];
  test('solid fills: the button, numerals and hero card are one color each, with no gradient hairline', () => {
    expect(new Set(t.gradients.cta).size).toBe(1);
    expect(new Set(t.gradients.numeral).size).toBe(1);
    expect(new Set(t.gradients.hero).size).toBe(1);
    expect(t.gradients.border).toBeNull();
  });
  test('at most one glow, no stars, no glow shadows', () => {
    expect(t.gradients.glows.length).toBeLessThanOrEqual(1);
    for (const g of t.gradients.glows) expect(g.opacity).toBeLessThanOrEqual(0.2);
    expect(t.shape.stars).toBeNull();
    expect(t.shadows.cta).toBeNull();
    expect(t.shadows.numeral).toBeNull();
    expect(t.shadows.featured).toBeNull();
    expect(t.shadows.hero).toBeNull();
    expect(t.shape.orbHalo).toBe(0);
  });
  test('placeholders are readable in the field', () => {
    const field = t.colors.field === 'transparent' ? t.colors.bg : t.colors.field;
    expect(contrast(parse(t.colors.placeholder), over(field, t.colors.bg))).toBeGreaterThanOrEqual(4.5);
  });
});

/** Colors live in themes.ts only, so every look can change them. */
test('no hardcoded colors outside themes.ts', () => {
  const root = join(__dirname, '..', '..');
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        if (name !== '__tests__') walk(path);
      } else if (/\.tsx?$/.test(name) && !path.endsWith(join('ui', 'themes.ts'))) {
        readFileSync(path, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            if (/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(/.test(line) && !/^\s*(\/\/|\*)/.test(line)) offenders.push(`${path.slice(root.length + 1)}:${i + 1}`);
          });
      }
    }
  };
  walk(root);
  expect(offenders).toEqual([]);
});
