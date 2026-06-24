import '../../global.css';

import { useEffect } from 'react';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';

import { ToastProvider } from '@/components/common';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/lib/api/query-client';
import { useAuthStore } from '@/stores';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const status = useAuthStore((s) => s.status);
  const activePanel = useAuthStore((s) => s.activePanel);
  const init = useAuthStore((s) => s.init);

  // Resolve any persisted session and keep the store in sync with the auth provider.
  useEffect(() => init(), [init]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const isAuthed = status === 'authed';

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <ToastProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Protected guard={status === 'signedOut'}>
                  <Stack.Screen name="(public)" />
                </Stack.Protected>
                <Stack.Protected guard={status === 'onboarding'}>
                  <Stack.Screen name="(onboarding)" />
                </Stack.Protected>
                <Stack.Protected guard={isAuthed && activePanel === 'player'}>
                  <Stack.Screen name="(player)" />
                </Stack.Protected>
                <Stack.Protected guard={isAuthed && activePanel === 'venue'}>
                  <Stack.Screen name="(venue)" />
                </Stack.Protected>
                <Stack.Screen name="index" />
                {/* Shared screens pushed from both panels. */}
                <Stack.Screen name="notifications" />
                <Stack.Screen name="edit-profile" />
                {/* Every player-facing pushed screen — venue browse + booking detail,
                    player calendar — lives in the (player-stack) group. */}
                <Stack.Screen name="(player-stack)" />
                {/* Every venue-owner pushed screen — account, bookings, calendar, memberships,
                    offers, customers, members, teams, closures, venue editing, create-venue —
                    lives in the (venue-stack) group. Route-group parens keep all URLs unchanged. */}
                <Stack.Screen name="(venue-stack)" />
                <Stack.Screen name="+not-found" />
              </Stack>
              {/* App is light-locked: dark icons on BOTH the status bar and the Android
              navigation bar (SystemBars covers both). Onboarding overrides to "light". */}
              <SystemBars style="dark" />
            </ToastProvider>
          </ThemeProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
