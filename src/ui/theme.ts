/** Layout constants shared by every look. Colors, fonts and shapes come from `useTheme()` in `@/ui/ThemeProvider`. */
export const space = (n: number): number => n * 4;
export const radii = { sm: 8, md: 12, lg: 20, pill: 999 } as const;
/** Content column width on wide screens; phones use the full width with a 16px gutter. */
export const MAX_WIDTH = 560;

export type { TypographyVariant } from '@/ui/themes';
