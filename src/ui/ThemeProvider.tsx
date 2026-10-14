import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useSettingsStore } from '@/store/settingsStore';
import { EMBER, THEMES, type Theme } from '@/ui/themes';

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
 * Provides the chosen look. Every look draws in the system font, so there is nothing to load and a
 * switch applies at once. A stored id that no longer names a look falls back to Ember Glass.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const chosen = useSettingsStore((s) => s.theme);
  return <ThemeContext.Provider value={THEMES[chosen] ?? EMBER}>{children}</ThemeContext.Provider>;
}
