import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';

import { AppTabBar } from '@/src/components/navigation/AppTabBar';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      tabBar={(props) => (
        <AppTabBar
          {...(props as ComponentProps<typeof AppTabBar>)}
        />
      )}
      screenOptions={{
        headerShown: false,
        lazy: true,
      }}>
      <Tabs.Screen name="explore" options={{ title: '탐색' }} />
      <Tabs.Screen name="dive" options={{ title: '다이빙' }} />
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="gear" options={{ title: '내 장비' }} />
      <Tabs.Screen name="my" options={{ title: '마이' }} />
    </Tabs>
  );
}
