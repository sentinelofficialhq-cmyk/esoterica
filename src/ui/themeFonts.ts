import { CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond/500Medium';
import { CormorantGaramond_500Medium_Italic } from '@expo-google-fonts/cormorant-garamond/500Medium_Italic';
import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond/600SemiBold';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { Sora_600SemiBold } from '@expo-google-fonts/sora/600SemiBold';
import { Sora_700Bold } from '@expo-google-fonts/sora/700Bold';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk/600SemiBold';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

import type { ThemeId } from '@/ui/themes';

const MANROPE = { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold };

/** Only the active look's fonts are downloaded. */
export const FONT_SETS: Record<ThemeId, Record<string, Font.FontSource>> = {
  ember: { Sora_600SemiBold, Sora_700Bold, ...MANROPE },
  gilded: { CormorantGaramond_500Medium, CormorantGaramond_500Medium_Italic, CormorantGaramond_600SemiBold, ...MANROPE },
  nebula: { SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold },
};

const allLoaded = (id: ThemeId) => Object.keys(FONT_SETS[id]).every((name) => Font.isLoaded(name));

/** True once every font the given look uses is ready. Starts loading when the look changes. */
export function useThemeFonts(id: ThemeId): boolean {
  const [loaded, setLoaded] = useState<ThemeId[]>([]);
  useEffect(() => {
    let alive = true;
    const done = () => {
      if (alive) setLoaded((l) => (l.includes(id) ? l : [...l, id]));
    };
    // A font that fails to load falls back to the system face; never block the app on it.
    Font.loadAsync(FONT_SETS[id]).then(done, done);
    return () => {
      alive = false;
    };
  }, [id]);
  return loaded.includes(id) || allLoaded(id);
}
