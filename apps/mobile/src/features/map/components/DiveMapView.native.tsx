import { Camera, MapView, PointAnnotation } from '@rnmapbox/maps';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/src/constants';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MAP_GESTURE_SETTINGS,
  MAPBOX_LABEL_LOCALE,
  MAPBOX_STYLE_URL,
} from '@/src/features/map/constants';
import { MapMarkerPin } from '@/src/features/map/components/MapMarkerPin';
import { ProfileMapMarkerPin } from '@/src/features/map/components/ProfileMapMarkerPin';
import type { DiveMapViewProps, DiveMapViewRef } from '@/src/features/map/types';
import { initializeMapbox, isMapboxConfigured } from '@/src/services/mapbox';

import { DiveMapViewFallback } from './DiveMapViewFallback';

const LATITUDE_DELTA_SCALE = 100_000;

export const DiveMapView = forwardRef<DiveMapViewRef, DiveMapViewProps>(function DiveMapView(
  {
    markers = [],
    onMapMove,
    onMapMoveEnd,
    bottomInset,
    initialCenter,
    style,
  },
  ref,
) {
  const cameraRef = useRef<Camera>(null);
  const lastGestureActive = useRef(false);
  const lastCenter = useRef<[number, number] | null>(null);

  useEffect(() => {
    initializeMapbox();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      flyTo(target, duration = 800) {
        cameraRef.current?.setCamera({
          centerCoordinate: [target.longitude, target.latitude],
          zoomLevel: target.zoomLevel ?? DEFAULT_MAP_ZOOM,
          animationDuration: duration,
          animationMode: 'flyTo',
        });
      },
    }),
    [],
  );

  if (!isMapboxConfigured) {
    return (
      <DiveMapViewFallback
        ref={ref}
        markers={markers}
        onMapMove={onMapMove}
        onMapMoveEnd={onMapMoveEnd}
        bottomInset={bottomInset}
        initialCenter={initialCenter}
        style={style}
        message="Mapbox 토큰이 필요합니다"
      />
    );
  }

  const defaultCenter = initialCenter ?? DEFAULT_MAP_CENTER;
  const defaultZoom = initialCenter?.zoomLevel ?? DEFAULT_MAP_ZOOM;

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        styleURL={MAPBOX_STYLE_URL}
        localizeLabels={{ locale: MAPBOX_LABEL_LOCALE }}
        scrollEnabled
        zoomEnabled
        rotateEnabled
        pitchEnabled={false}
        gestureSettings={MAP_GESTURE_SETTINGS}
        compassEnabled={false}
        scaleBarEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        onCameraChanged={(state) => {
          const center = state.properties.center as [number, number];

          if (state.gestures.isGestureActive) {
            if (lastCenter.current) {
              const deltaLng = (center[0] - lastCenter.current[0]) * LATITUDE_DELTA_SCALE;
              const deltaLat = (center[1] - lastCenter.current[1]) * LATITUDE_DELTA_SCALE;
              onMapMove?.(deltaLng, deltaLat);
            }

            lastCenter.current = center;
            lastGestureActive.current = true;
            return;
          }

          if (lastGestureActive.current) {
            lastCenter.current = null;
            onMapMoveEnd?.();
            lastGestureActive.current = false;
          }
        }}>
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [defaultCenter.longitude, defaultCenter.latitude],
            zoomLevel: defaultZoom,
          }}
        />

        {markers.map((marker) => (
          <PointAnnotation
            key={marker.id}
            id={marker.id}
            coordinate={[marker.longitude, marker.latitude]}
            title={marker.label}>
            {marker.variant === 'profile' ? (
              <ProfileMapMarkerPin
                profileImageUrl={marker.profileImageUrl}
                isCurrentUser={marker.isCurrentUser}
              />
            ) : (
              <MapMarkerPin tone={marker.tone} />
            )}
          </PointAnnotation>
        ))}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primarySoft,
  },
  map: {
    flex: 1,
  },
});
