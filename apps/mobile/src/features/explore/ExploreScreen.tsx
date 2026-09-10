import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDeviceLocation } from '@/src/hooks/useDeviceLocation';
import {
  EXPLORE_DEFAULT_ZOOM,
  EXPLORE_PLACE_DETAIL_ZOOM,
  type ExploreSheetSnap,
  getExploreDetailMapBottomPadding,
  getMapMyLocationButtonBottom,
} from '@/src/features/explore/constants';
import { ExploreBottomSheet } from '@/src/features/explore/components/ExploreBottomSheet';
import { ExploreSearchBar } from '@/src/features/explore/components/ExploreSearchBar';
import { useExplorePlaceDetail } from '@/src/features/explore/hooks/useExplorePlaceDetail';
import { useExplorePlaces } from '@/src/features/explore/hooks/useExplorePlaces';
import {
  filterPlacesForExploreMap,
  getExploreListTitle,
  getExploreVisibilityMode,
  sortPlacesForExploreList,
} from '@/src/features/explore/map-utils';
import type { ExplorePlace } from '@/src/features/explore/types';
import {
  exploreFilterCategories,
  exploreFilters,
} from '@/src/features/explore/types';
import { filterExplorePlaces } from '@/src/features/explore/utils';
import { DEFAULT_MAP_CENTER } from '@/src/features/map/constants';
import { DiveMapView } from '@/src/features/map/components/DiveMapView';
import { MapMyLocationButton } from '@/src/features/map/components/MapMyLocationButton';
import type { DiveMapViewRef, MapCameraTarget, MapMarker, MapViewport } from '@/src/features/map/types';
import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

const MY_LOCATION_CAMERA_DURATION = 800;
const SEARCH_MAP_MARKER_LIMIT = 40;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<DiveMapViewRef>(null);
  const hasCenteredOnUser = useRef(false);
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapViewport, setMapViewport] = useState<MapViewport | null>(null);
  const [detailPlaceId, setDetailPlaceId] = useState<string | null>(null);
  const [sheetSnap, setSheetSnap] = useState<ExploreSheetSnap>('peek');
  const { location, refresh } = useDeviceLocation();
  const resetChrome = useScrollChromeStore((s) => s.resetChrome);
  const { places: explorePlaces, isLoading, isError, refetch } = useExplorePlaces();

  const screen = Dimensions.get('window');
  const screenHeight = screen.height;
  const screenWidth = screen.width;
  const myLocationBottom = getMapMyLocationButtonBottom(screenHeight, insets.bottom);
  const isSearchActive = searchQuery.trim().length > 0;

  const detailFallbackPlace = useMemo(
    () => explorePlaces.find((place) => place.id === detailPlaceId) ?? null,
    [detailPlaceId, explorePlaces],
  );

  const { detail: detailPlace, isLoading: isDetailLoading } = useExplorePlaceDetail(
    detailPlaceId,
    detailFallbackPlace,
  );

  const userMapTarget = useMemo<MapCameraTarget | undefined>(() => {
    if (!location) {
      return undefined;
    }

    return {
      latitude: location.latitude,
      longitude: location.longitude,
      zoomLevel: EXPLORE_DEFAULT_ZOOM,
    };
  }, [location]);

  const resetMapCameraPadding = useCallback(() => {
    mapRef.current?.setCameraPadding({
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
    });
  }, []);

  const focusPlaceOnMap = useCallback(
    (place: ExplorePlace, zoomLevel: number) => {
      const bottomPadding = getExploreDetailMapBottomPadding(screenHeight);

      mapRef.current?.flyTo(
        {
          latitude: place.latitude,
          longitude: place.longitude,
          zoomLevel,
          padding: { paddingBottom: bottomPadding },
        },
        MY_LOCATION_CAMERA_DURATION,
      );

      setMapViewport({
        centerLatitude: place.latitude,
        centerLongitude: place.longitude,
        zoomLevel,
      });
    },
    [screenHeight],
  );

  const centerMapOnUser = useCallback(
    (target: MapCameraTarget, animated: boolean) => {
      mapRef.current?.flyTo(target, animated ? MY_LOCATION_CAMERA_DURATION : 0);
    },
    [],
  );

  const closePlaceDetail = useCallback(() => {
    setDetailPlaceId(null);
    setSheetSnap('peek');
    resetMapCameraPadding();
  }, [resetMapCameraPadding]);

  const openPlaceDetail = useCallback(
    (place: ExplorePlace) => {
      setDetailPlaceId(place.id);
      setSheetSnap('half');
      focusPlaceOnMap(place, EXPLORE_PLACE_DETAIL_ZOOM);
    },
    [focusPlaceOnMap],
  );

  const clearPlaceSelection = useCallback(() => {
    closePlaceDetail();
  }, [closePlaceDetail]);

  const handleMarkerPress = useCallback(
    (markerId: string) => {
      if (markerId === 'me') {
        return;
      }

      const place = explorePlaces.find((item) => item.id === markerId);
      if (!place) {
        return;
      }

      openPlaceDetail(place);
    },
    [explorePlaces, openPlaceDetail],
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
  }, [explorePlaces, searchQuery, selectedFilterIndex]);

  const visibilityMode = useMemo(
    () => getExploreVisibilityMode(mapViewport),
    [mapViewport],
  );

  const mapVisiblePlaces = useMemo(() => {
    if (isSearchActive) {
      return filteredPlaces.slice(0, SEARCH_MAP_MARKER_LIMIT);
    }

    const visible = filterPlacesForExploreMap(
      filteredPlaces,
      mapViewport,
      screenWidth,
      screenHeight,
      location,
    );

    const sorted = sortPlacesForExploreList(visible, location);

    if (!detailPlaceId) {
      return sorted;
    }

    const activePlace = explorePlaces.find((place) => place.id === detailPlaceId);
    if (!activePlace || sorted.some((place) => place.id === detailPlaceId)) {
      return sorted;
    }

    return [activePlace, ...sorted];
  }, [
    detailPlaceId,
    explorePlaces,
    filteredPlaces,
    isSearchActive,
    location,
    mapViewport,
    screenHeight,
    screenWidth,
  ]);

  const listPlaces = isSearchActive ? filteredPlaces : mapVisiblePlaces;
  const listTitle = isSearchActive ? '검색 결과' : getExploreListTitle(visibilityMode);

  const mapMarkers = useMemo<MapMarker[]>(() => {
    const placeMarkers: MapMarker[] = mapVisiblePlaces.map((place) => ({
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
  }, [location, mapVisiblePlaces]);

  const handleMyLocationPress = async () => {
    const latestLocation = await refresh();
    if (!latestLocation) {
      return;
    }

    clearPlaceSelection();

    centerMapOnUser(
      {
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
        zoomLevel: EXPLORE_DEFAULT_ZOOM,
      },
      true,
    );

    setMapViewport({
      centerLatitude: latestLocation.latitude,
      centerLongitude: latestLocation.longitude,
      zoomLevel: EXPLORE_DEFAULT_ZOOM,
    });
  };

  const initialCenter = userMapTarget ?? {
    latitude: DEFAULT_MAP_CENTER.latitude,
    longitude: DEFAULT_MAP_CENTER.longitude,
    zoomLevel: EXPLORE_DEFAULT_ZOOM,
  };

  const handleViewportChange = useCallback((viewport: MapViewport) => {
    setMapViewport(viewport);
  }, []);

  return (
    <View style={styles.container}>
      <DiveMapView
        ref={mapRef}
        markers={mapMarkers}
        selectedMarkerId={detailPlaceId}
        initialCenter={initialCenter}
        onMarkerPress={handleMarkerPress}
        onMapPress={() => {
          if (detailPlaceId) {
            closePlaceDetail();
          }
        }}
        onViewportChange={handleViewportChange}
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
        places={listPlaces}
        listTitle={listTitle}
        filters={exploreFilters}
        selectedFilterIndex={selectedFilterIndex}
        onFilterChange={setSelectedFilterIndex}
        searchQuery={searchQuery}
        onPlacePress={openPlaceDetail}
        detailPlace={detailPlace}
        isDetailLoading={isDetailLoading}
        sheetSnap={sheetSnap}
        onDetailBack={closePlaceDetail}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => {
          void refetch();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
