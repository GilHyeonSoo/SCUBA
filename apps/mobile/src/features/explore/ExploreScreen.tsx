import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDeviceLocation } from '@/src/hooks/useDeviceLocation';
import {
  getMapMyLocationButtonBottom,
} from '@/src/features/explore/constants';
import { ExploreBottomSheet } from '@/src/features/explore/components/ExploreBottomSheet';
import { ExploreSearchBar } from '@/src/features/explore/components/ExploreSearchBar';
import {
  exploreFilterCategories,
  exploreFilters,
  explorePlaces,
} from '@/src/features/explore/mock-data';
import { filterExplorePlaces } from '@/src/features/explore/utils';
import { DEFAULT_MAP_CENTER, USER_LOCATION_ZOOM } from '@/src/features/map/constants';
import { DiveMapView } from '@/src/features/map/components/DiveMapView';
import { MapMyLocationButton } from '@/src/features/map/components/MapMyLocationButton';
import type { DiveMapViewRef, MapCameraTarget, MapMarker } from '@/src/features/map/types';
import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

const MY_LOCATION_CAMERA_DURATION = 800;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<DiveMapViewRef>(null);
  const hasCenteredOnUser = useRef(false);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { location, refresh } = useDeviceLocation();
  const resetChrome = useScrollChromeStore((s) => s.resetChrome);

  const screenHeight = Dimensions.get('window').height;
  const myLocationBottom = getMapMyLocationButtonBottom(screenHeight, insets.bottom);

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

  const centerMapOnUser = useCallback(
    (target: MapCameraTarget, animated: boolean) => {
      mapRef.current?.flyTo(target, animated ? MY_LOCATION_CAMERA_DURATION : 0);
    },
    [],
  );

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

  const filteredPlaces = useMemo(() => {
    const category = exploreFilterCategories[selectedFilterIndex];
    return filterExplorePlaces(explorePlaces, category, searchQuery);
  }, [searchQuery, selectedFilterIndex]);

  const mapMarkers = useMemo<MapMarker[]>(() => {
    const placeMarkers: MapMarker[] = filteredPlaces.map((place) => ({
      id: place.id,
      label: place.name,
      latitude: place.latitude,
      longitude: place.longitude,
      tone: place.category,
    }));

    if (!location) {
      return placeMarkers;
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

    return [userMarker, ...placeMarkers];
  }, [filteredPlaces, location]);

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

      <ExploreSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        topInset={insets.top}
      />

      <MapMyLocationButton
        onPress={handleMyLocationPress}
        bottom={myLocationBottom}
      />

      <ExploreBottomSheet
        places={filteredPlaces}
        filters={exploreFilters}
        selectedFilterIndex={selectedFilterIndex}
        onFilterChange={setSelectedFilterIndex}
        searchQuery={searchQuery}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
