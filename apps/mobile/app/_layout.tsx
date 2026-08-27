import { Stack } from 'expo-router';
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
  useEffect(() => {
    if (Platform.OS !== 'web') {
      initializeMapbox();
    }
    SplashScreen.hideAsync();
  }, []);

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="buddy" />
        <Stack.Screen name="gear/register" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </AppProviders>
  );
}
