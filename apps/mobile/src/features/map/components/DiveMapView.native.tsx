import { Camera, MapView, MarkerView } from '@rnmapbox/maps';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
import type {
  DiveMapViewProps,
  DiveMapViewRef,
  MapBounds,
  MapCameraPadding,
  MapViewport,
} from '@/src/features/map/types';
import { initializeMapbox, isMapboxConfigured } from '@/src/services/mapbox';
import { MAP_API_DISABLED_MESSAGE } from '@/src/services/map-api-guard';

import { DiveMapViewFallback } from './DiveMapViewFallback';

const LATITUDE_DELTA_SCALE = 100_000;
const VIEWPORT_DEBOUNCE_MS = 80;

type CameraState = {
  properties: {
    center?: number[];
    zoom?: number;
    bounds?: {
      ne: number[];
      sw: number[];
    };
  };
};

function toViewport(state: CameraState): MapViewport | null {
  const center = state.properties.center;
  const zoom = state.properties.zoom;
  const bounds = state.properties.bounds;

  if (!center || zoom == null) {
    return null;
  }

  const viewport: MapViewport = {
    centerLatitude: center[1],
    centerLongitude: center[0],
    zoomLevel: zoom,
  };

  if (bounds?.ne && bounds?.sw) {
    viewport.bounds = {
      north: bounds.ne[1],
      east: bounds.ne[0],
      south: bounds.sw[1],
      west: bounds.sw[0],
    } satisfies MapBounds;
  }

  return viewport;
}

function toCameraPadding(padding?: MapCameraPadding) {
  return {
    paddingTop: padding?.paddingTop ?? 0,
    paddingRight: padding?.paddingRight ?? 0,
    paddingBottom: padding?.paddingBottom ?? 0,
    paddingLeft: padding?.paddingLeft ?? 0,
  };
}

export const DiveMapView = forwardRef<DiveMapViewRef, DiveMapViewProps>(function DiveMapView(
  {
    markers = [],
    selectedMarkerId,
    onMarkerPress,
    onMapPress,
    onMapMove,
    onMapMoveEnd,
    onViewportChange,
    bottomInset,
    initialCenter,
    style,
  },
  ref,
) {
  const cameraRef = useRef<Camera>(null);
  const lastGestureActive = useRef(false);
  const lastCenter = useRef<[number, number] | null>(null);
  const viewportDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastViewportRef = useRef<MapViewport | null>(null);

  const emitViewport = (state: CameraState, force = false) => {
    const viewport = toViewport(state);
    if (!viewport) {
      return;
    }

    const previous = lastViewportRef.current;
    const hasMeaningfulChange =
      !previous ||
      Math.abs(previous.zoomLevel - viewport.zoomLevel) > 0.02 ||
      Math.abs(previous.centerLatitude - viewport.centerLatitude) > 0.0001 ||
      Math.abs(previous.centerLongitude - viewport.centerLongitude) > 0.0001;

    if (!force && !hasMeaningfulChange) {
      return;
    }

    lastViewportRef.current = viewport;
    onViewportChange?.(viewport);
  };

  const scheduleViewportEmit = (state: CameraState) => {
    if (viewportDebounceRef.current) {
      clearTimeout(viewportDebounceRef.current);
    }

    viewportDebounceRef.current = setTimeout(() => {
      emitViewport(state);
    }, VIEWPORT_DEBOUNCE_MS);
  };

  useEffect(() => {
    initializeMapbox();

    return () => {
      if (viewportDebounceRef.current) {
        clearTimeout(viewportDebounceRef.current);
      }
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      flyTo(target, duration = 800) {
        cameraRef.current?.setCamera({
          centerCoordinate: [target.longitude, target.latitude],
          zoomLevel: target.zoomLevel ?? DEFAULT_MAP_ZOOM,
          padding: toCameraPadding(target.padding),
          animationDuration: duration,
          animationMode: 'flyTo',
        });
      },
      setCameraPadding(padding) {
        cameraRef.current?.setCamera({
          padding: toCameraPadding(padding),
          animationDuration: 0,
          animationMode: 'none',
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
        onViewportChange={onViewportChange}
        selectedMarkerId={selectedMarkerId}
        onMarkerPress={onMarkerPress}
        onMapPress={onMapPress}
        bottomInset={bottomInset}
        initialCenter={initialCenter}
        style={style}
        message={MAP_API_DISABLED_MESSAGE}
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
        onPress={() => {
          onMapPress?.();
        }}
        onCameraChanged={(state) => {
          const center = state.properties.center as [number, number];

          scheduleViewportEmit(state);

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
            emitViewport(state, true);
            lastGestureActive.current = false;
          }
        }}
        onMapIdle={(state) => {
          emitViewport(state, true);
        }}>
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [defaultCenter.longitude, defaultCenter.latitude],
            zoomLevel: defaultZoom,
          }}
        />

        {markers.map((marker) => (
          <MarkerView
            key={marker.id}
            coordinate={[marker.longitude, marker.latitude]}
            anchor={{ x: 0.5, y: 0.5 }}
            allowOverlap
            isSelected={selectedMarkerId === marker.id}>
            <Pressable
              accessibilityLabel={marker.label}
              hitSlop={6}
              onPress={() => {
                onMarkerPress?.(marker.id);
              }}>
              {marker.variant === 'profile' ? (
                <ProfileMapMarkerPin
                  profileImageUrl={marker.profileImageUrl}
                  isCurrentUser={marker.isCurrentUser}
                />
              ) : (
                <MapMarkerPin
                  tone={marker.tone}
                  selected={selectedMarkerId === marker.id}
                />
              )}
            </Pressable>
          </MarkerView>
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
