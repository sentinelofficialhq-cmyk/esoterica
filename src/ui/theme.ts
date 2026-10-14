/** Layout constants shared by every look. Colors, fonts and shapes come from `useTheme()` in `@/ui/ThemeProvider`. */
export const space = (n: number): number => n * 4;
export const radii = { sm: 8, md: 12, lg: 20, pill: 999 } as const;
/** Content column width on wide screens; phones use the full width with a 16px gutter. */
export const MAX_WIDTH = 560;
/** The docked tab bar's row, above the bottom safe-area inset. */
export const DOCKED_TAB_BAR_HEIGHT = 56;
/** Where the web build keeps the look's page paint ({ bg, scheme }) for +html's script to apply before the bundle loads. */
export const WEB_PAINT_KEY = 'esoterica-paint';

/** The one color of a gradient whose stops are all equal (draw a plain fill), or null for a real gradient. */
export const solidFill = (stops: readonly string[]): string | null => (stops.every((c) => c === stops[0]) ? stops[0] : null);

export type { TypographyVariant } from '@/ui/themes';
