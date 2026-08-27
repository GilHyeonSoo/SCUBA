import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

import { MapScreenLayout } from '@/src/components/layout/MapScreenLayout';
import { AppHeader } from '@/src/components/ui';
import { MapFilterChips } from '@/src/features/map/components/MapFilterChips';
import {
  buddyScreenMarkers,
  mockUserMapLocation,
} from '@/src/features/map/mock-markers';

const buddyFilters = ['5km', '10km', '30km', '스쿠버', '프리다이빙'];

export default function BuddyScreen() {
  const router = useRouter();

  const goHome = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const handleBackPress = useCallback(() => {
    goHome();
    return true;
  }, [goHome]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [handleBackPress]),
  );

  return (
    <MapScreenLayout
      header={
        <AppHeader
          title="버디"
          subtitle="주변 다이버를 찾고 함께 다이빙을 계획하세요"
          onBack={goHome}
        />
      }
      markers={buddyScreenMarkers}
      overlay={<MapFilterChips filters={buddyFilters} selectedIndex={1} />}
      initialCenter={mockUserMapLocation}
      showMyLocationButton
      userLocation={mockUserMapLocation}
    />
  );
}
