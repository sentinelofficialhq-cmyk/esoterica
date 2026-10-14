import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { useSettingsStore } from '@/store/settingsStore';
import { useThemeFonts } from '@/ui/themeFonts';
import { EMBER, THEMES, type Theme, type ThemeId } from '@/ui/themes';

const ThemeContext = createContext<Theme>(EMBER);

/** The active look. Components read colors, fonts and shapes from here, never from a static import. */
export const useTheme = (): Theme => useContext(ThemeContext);

/**
 * Styles built from the active look, rebuilt only when the look changes. Pass a module-level
 * `(t) => StyleSheet.create({...})` so the result keeps StyleSheet's precise types.
 */
export function useStyles<T>(make: (t: Theme) => T): T {
  const t = useTheme();
  return useMemo(() => make(t), [make, t]);
}

/**
 * Provides the chosen look once its fonts are ready; until then the previous look stays on screen,
 * so switching never flashes system fonts.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const chosen = useSettingsStore((s) => s.theme);
  const ready = useThemeFonts(chosen);
  const [shown, setShown] = useState<ThemeId>(chosen);
  if (ready && shown !== chosen) setShown(chosen);
  return <ThemeContext.Provider value={THEMES[shown]}>{children}</ThemeContext.Provider>;
}

/** For the root layout's splash gate: are the chosen look's fonts ready? */
export function useChosenThemeReady(): boolean {
  return useThemeFonts(useSettingsStore((s) => s.theme));
}
