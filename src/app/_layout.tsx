import { DarkTheme, ThemeProvider as NavigationThemeProvider, Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { catchUpMemory } from '@/ai/memory';
import { useHydrated } from '@/store/hydration';
import { requestPersistence } from '@/store/storage';
import { ThemeProvider, useChosenThemeReady, useTheme } from '@/ui/ThemeProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrated = useHydrated();
  const fontsReady = useChosenThemeReady();
  const ready = hydrated && fontsReady;

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
  const navigationTheme = useMemo(
    () => ({
      ...DarkTheme,
      colors: { ...DarkTheme.colors, background: t.colors.bg, card: t.colors.bg, text: t.colors.text, primary: t.colors.accent, border: t.colors.border },
    }),
    [t],
  );
  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.colors.bg }, animation: 'fade' }} />
    </NavigationThemeProvider>
  );
}

function Blank() {
  const t = useTheme();
  return <View style={{ flex: 1, backgroundColor: t.colors.bg }} />;
}
