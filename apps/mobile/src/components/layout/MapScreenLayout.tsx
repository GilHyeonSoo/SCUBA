import { useFocusEffect } from 'expo-router';
import { ReactNode, useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollapsibleChromeHeader } from '@/src/components/layout/CollapsibleChromeHeader';
import { MapChromeOverlay } from '@/src/components/layout/MapChromeOverlay';
import { colors, getTabBarChromeHeight, spacing } from '@/src/constants';
import { DiveMapView } from '@/src/features/map/components/DiveMapView';
import { MapMyLocationButton } from '@/src/features/map/components/MapMyLocationButton';
import type { DiveMapViewRef, MapCameraTarget, MapMarker } from '@/src/features/map/types';
import { useChromeMapInteraction } from '@/src/hooks/useChromeMapInteraction';
import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

const MY_LOCATION_CAMERA_DURATION = 800;

type MapScreenLayoutProps = {
  header: ReactNode;
  markers?: MapMarker[];
  overlay?: ReactNode;
  withTabBarInset?: boolean;
  /** 첫 진입 시 카메라를 사용자 위치로 맞춤 */
  initialCenter?: MapCameraTarget;
  /** 내 위치 버튼 표시 및 카메라 이동 대상 */
  showMyLocationButton?: boolean;
  userLocation?: MapCameraTarget;
};

export function MapScreenLayout({
  header,
  markers,
  overlay,
  withTabBarInset = false,
  initialCenter,
  showMyLocationButton = false,
  userLocation,
}: MapScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  const mapRef = useRef<DiveMapViewRef>(null);
  const hasCenteredInitially = useRef(false);
  const resetChrome = useScrollChromeStore((s) => s.resetChrome);
  const { onMapMove, onMapMoveEnd } = useChromeMapInteraction();

  const tabBarInset = withTabBarInset ? getTabBarChromeHeight(insets.bottom) : insets.bottom;
  const mapBottomInset = tabBarInset + spacing.md;
  const myLocationBottomVisible = withTabBarInset
    ? tabBarInset + spacing.lg
    : insets.bottom + spacing.xl;
  const myLocationBottomHidden = withTabBarInset
    ? insets.bottom + spacing.md
    : insets.bottom + spacing.sm;

  useFocusEffect(
    useCallback(() => {
      resetChrome();

      if (initialCenter && !hasCenteredInitially.current) {
        hasCenteredInitially.current = true;
        requestAnimationFrame(() => {
          mapRef.current?.flyTo(initialCenter, 0);
        });
      }
    }, [initialCenter, resetChrome]),
  );

  const handleMyLocationPress = useCallback(() => {
    if (!userLocation) {
      return;
    }

    mapRef.current?.flyTo(userLocation, MY_LOCATION_CAMERA_DURATION);
  }, [userLocation]);

  return (
    <View style={styles.container}>
      <DiveMapView
        ref={mapRef}
        markers={markers}
        onMapMove={onMapMove}
        onMapMoveEnd={onMapMoveEnd}
        bottomInset={mapBottomInset}
        initialCenter={initialCenter}
        style={StyleSheet.absoluteFill}
      />

      {overlay ? (
        <MapChromeOverlay headerHeight={headerHeight}>{overlay}</MapChromeOverlay>
      ) : null}

      {showMyLocationButton && userLocation ? (
        <MapMyLocationButton
          onPress={handleMyLocationPress}
          bottom={myLocationBottomVisible}
          bottomWhenChromeVisible={myLocationBottomVisible}
          bottomWhenChromeHidden={myLocationBottomHidden}
        />
      ) : null}

      <CollapsibleChromeHeader headerHeight={headerHeight} onHeightChange={setHeaderHeight}>
        {header}
      </CollapsibleChromeHeader>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
