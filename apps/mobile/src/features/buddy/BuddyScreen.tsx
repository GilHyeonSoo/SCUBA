import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BuddyBottomSheet } from '@/src/features/buddy/components/BuddyBottomSheet';
import {
  buddyFilters,
  buddyProfiles,
  filterBuddyProfiles,
} from '@/src/features/buddy/mock-data';
import { getMapMyLocationButtonBottom } from '@/src/features/explore/constants';
import { DEFAULT_MAP_CENTER, USER_LOCATION_ZOOM } from '@/src/features/map/constants';
import { DiveMapView } from '@/src/features/map/components/DiveMapView';
import { MapMyLocationButton } from '@/src/features/map/components/MapMyLocationButton';
import type { DiveMapViewRef, MapCameraTarget, MapMarker } from '@/src/features/map/types';
import { useDeviceLocation } from '@/src/hooks/useDeviceLocation';
import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

const MY_LOCATION_CAMERA_DURATION = 800;

export default function BuddyScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<DiveMapViewRef>(null);
  const hasCenteredOnUser = useRef(false);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(1);
  const { location, refresh } = useDeviceLocation();

  const screenHeight = Dimensions.get('window').height;
  const myLocationBottom = getMapMyLocationButtonBottom(screenHeight, insets.bottom);
  const resetChrome = useScrollChromeStore((s) => s.resetChrome);

  const filteredBuddies = useMemo(
    () => filterBuddyProfiles(buddyProfiles, selectedFilterIndex),
    [selectedFilterIndex],
  );

  const userMapTarget = useMemo<MapCameraTarget | undefined>(() => {
    if (!location) {
      return undefined;
    }

    return {
      latitude: location.latitude,
      longitude: location.longitude,
      zoomLevel: USER_LOCATION_ZOOM,
    };
  }, [location]);

  const centerMapOnUser = useCallback((target: MapCameraTarget, animated: boolean) => {
    mapRef.current?.flyTo(target, animated ? MY_LOCATION_CAMERA_DURATION : 0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetChrome();

      if (!userMapTarget || hasCenteredOnUser.current) {
        return;
      }

      hasCenteredOnUser.current = true;
      requestAnimationFrame(() => {
        centerMapOnUser(userMapTarget, false);
      });
    }, [centerMapOnUser, resetChrome, userMapTarget]),
  );

  const mapMarkers = useMemo<MapMarker[]>(() => {
    const buddyMarkers: MapMarker[] = filteredBuddies.map((buddy) => ({
      id: buddy.id,
      label: buddy.nickname,
      latitude: buddy.latitude,
      longitude: buddy.longitude,
      tone: 'buddy',
      variant: 'profile',
      profileImageUrl: buddy.profileImageUrl,
    }));

    if (!location) {
      return buddyMarkers;
    }

    const userMarker: MapMarker = {
      id: 'me',
      label: '나',
      latitude: location.latitude,
      longitude: location.longitude,
      tone: 'buddy',
      variant: 'profile',
      isCurrentUser: true,
      profileImageUrl: null,
    };

    return [userMarker, ...buddyMarkers];
  }, [filteredBuddies, location]);

  const handleMyLocationPress = async () => {
    const latestLocation = await refresh();
    if (!latestLocation) {
      return;
    }

    centerMapOnUser(
      {
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
        zoomLevel: USER_LOCATION_ZOOM,
      },
      true,
    );
  };

  const initialCenter = userMapTarget ?? {
    latitude: DEFAULT_MAP_CENTER.latitude,
    longitude: DEFAULT_MAP_CENTER.longitude,
    zoomLevel: USER_LOCATION_ZOOM,
  };

  return (
    <View style={styles.container}>
      <DiveMapView
        ref={mapRef}
        markers={mapMarkers}
        initialCenter={initialCenter}
        style={StyleSheet.absoluteFill}
      />

      <MapMyLocationButton onPress={handleMyLocationPress} bottom={myLocationBottom} />

      <BuddyBottomSheet
        buddies={filteredBuddies}
        filters={buddyFilters}
        selectedFilterIndex={selectedFilterIndex}
        onFilterChange={setSelectedFilterIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
