import { Stack, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { AppProviders } from '@/src/providers/AppProviders';
import { initializeMapbox } from '@/src/services/mapbox';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      initializeMapbox();
    }
  }, []);

  useEffect(() => {
    if (navigationState?.key) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore if splash was already hidden.
      });
    }
  }, [navigationState?.key]);

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="gear/register" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </AppProviders>
  );
}
