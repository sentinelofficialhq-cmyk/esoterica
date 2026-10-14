import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider, Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { Appearance, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { catchUpMemory } from '@/ai/memory';
import { useLaunchTracking } from '@/analytics/launch';
import { useHydrated } from '@/store/hydration';
import { requestPersistence } from '@/store/storage';
import { ThemeProvider, useTheme } from '@/ui/ThemeProvider';
import { WEB_PAINT_KEY } from '@/ui/theme';
import type { Theme } from '@/ui/themes';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Every look uses the system font, so the stores are all there is to wait for, then enrollment
  // in the A/B tests, so the first screen already shows the assigned look.
  const hydrated = useHydrated();
  const enrolled = useLaunchTracking(hydrated);
  const ready = hydrated && enrolled;

  useEffect(() => {
    if (!ready) return;
    SplashScreen.hideAsync();
    requestPersistence();
    void catchUpMemory();
  }, [ready]);

  return (
    <ThemeProvider>
      <Head>
        <title>Esoterica</title>
      </Head>
      {ready ? (
        <SafeAreaProvider>
          <Navigator />
        </SafeAreaProvider>
      ) : (
        <Blank />
      )}
    </ThemeProvider>
  );
}

function Navigator() {
  const t = useTheme();
  const navigationTheme = useMemo(() => {
    const base = t.scheme === 'dark' ? DarkTheme : DefaultTheme;
    return { ...base, colors: { ...base.colors, background: t.colors.bg, card: t.colors.bg, text: t.colors.text, primary: t.colors.accent, border: t.colors.border } };
  }, [t]);

  // The page outside React follows the look too: the root view behind screens, and the system's own
  // alerts, keyboards and pickers (native) or the page, browser chrome and form controls (web).
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(t.colors.bg);
    if (Platform.OS === 'web') paintWebPage(t);
    else Appearance.setColorScheme(t.scheme);
  }, [t]);

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.bg }, animation: 'fade' }} />
    </NavigationThemeProvider>
  );
}

/** Holds the place while the stores load. Transparent, so what is underneath shows: the splash on native, the stored paint on the web. */
function Blank() {
  return <View style={{ flex: 1 }} />;
}

/** Paints the web page in the look and remembers the paint, so +html can apply it before the next load's bundle runs. */
function paintWebPage(t: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--paint', t.colors.bg);
  root.style.backgroundColor = t.colors.bg;
  root.style.colorScheme = t.scheme;
  document.body.style.backgroundColor = t.colors.bg;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.colors.bg);
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', t.scheme);
  try {
    localStorage.setItem(WEB_PAINT_KEY, JSON.stringify({ bg: t.colors.bg, scheme: t.scheme }));
  } catch {
    // Storage can be off (private mode); the page still paints, only the next load starts in the default look.
  }
}
