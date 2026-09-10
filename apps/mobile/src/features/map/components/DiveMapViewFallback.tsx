import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { MapMarkerPin } from '@/src/features/map/components/MapMarkerPin';
import { ProfileMapMarkerPin } from '@/src/features/map/components/ProfileMapMarkerPin';
import { EXPLORE_DEFAULT_ZOOM } from '@/src/features/explore/constants';
import type { DiveMapViewProps, DiveMapViewRef, MapViewport } from '@/src/features/map/types';
import { toPlaceholderPercent } from '@/src/features/map/utils';

type DiveMapViewFallbackProps = DiveMapViewProps & {
  message?: string;
};

export const DiveMapViewFallback = forwardRef<DiveMapViewRef, DiveMapViewFallbackProps>(
  function DiveMapViewFallback(
    {
      markers = [],
      selectedMarkerId,
      onMarkerPress,
      onMapPress,
      onMapMove,
      onMapMoveEnd,
      onViewportChange,
      bottomInset = spacing.lg,
      initialCenter,
      style,
      message = '드래그하여 지도 이동',
    },
    ref,
  ) {
    const containerRef = useRef<View>(null);
    const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
    const scale = useRef(new Animated.Value(1)).current;
    const offset = useRef({ x: 0, y: 0 });
    const cameraPaddingOffsetY = useRef(0);
    const scaleValue = useRef(1);
    const lastGesture = useRef({ x: 0, y: 0 });

    const emitViewport = () => {
      if (!initialCenter) {
        return;
      }

      const zoomLevel = EXPLORE_DEFAULT_ZOOM - Math.log2(scaleValue.current);
      const viewport: MapViewport = {
        centerLatitude: initialCenter.latitude,
        centerLongitude: initialCenter.longitude,
        zoomLevel,
      };

      onViewportChange?.(viewport);
    };

    useEffect(() => {
      emitViewport();
    }, [initialCenter?.latitude, initialCenter?.longitude]);

    useImperativeHandle(
      ref,
      () => ({
        flyTo(target, duration = 800) {
          if (!initialCenter) {
            return;
          }

          const targetPosition = toPlaceholderPercent(target.latitude, target.longitude);
          const originPosition = toPlaceholderPercent(
            initialCenter.latitude,
            initialCenter.longitude,
          );
          const deltaX = (originPosition.x - targetPosition.x) * 4;
          const deltaY = (originPosition.y - targetPosition.y) * 4;
          const nextPaddingOffsetY = (target.padding?.paddingBottom ?? 0) / 2;
          const paddingDeltaY = nextPaddingOffsetY - cameraPaddingOffsetY.current;
          cameraPaddingOffsetY.current = nextPaddingOffsetY;

          Animated.timing(pan, {
            toValue: {
              x: offset.current.x + deltaX,
              y: offset.current.y + deltaY + paddingDeltaY,
            },
            duration,
            useNativeDriver: true,
          }).start(() => {
            offset.current = {
              x: offset.current.x + deltaX,
              y: offset.current.y + deltaY + paddingDeltaY,
            };
          });
        },
        setCameraPadding(padding) {
          const nextPaddingOffsetY = (padding.paddingBottom ?? 0) / 2;
          const paddingDeltaY = nextPaddingOffsetY - cameraPaddingOffsetY.current;
          cameraPaddingOffsetY.current = nextPaddingOffsetY;

          Animated.timing(pan, {
            toValue: {
              x: offset.current.x,
              y: offset.current.y + paddingDeltaY,
            },
            duration: 0,
            useNativeDriver: true,
          }).start(() => {
            offset.current = {
              x: offset.current.x,
              y: offset.current.y + paddingDeltaY,
            };
          });
        },
      }),
      [initialCenter, pan],
    );

    useEffect(() => {
      if (Platform.OS !== 'web') {
        return;
      }

      const node = containerRef.current as unknown as HTMLElement | null;
      if (!node) {
        return;
      }

      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();

        if (event.ctrlKey || event.metaKey) {
          const zoomDelta = -event.deltaY * 0.0025;
          const nextScale = Math.min(2.4, Math.max(0.7, scaleValue.current + zoomDelta));
          scaleValue.current = nextScale;
          scale.setValue(nextScale);
          emitViewport();
          return;
        }

        offset.current = {
          x: offset.current.x - event.deltaX,
          y: offset.current.y - event.deltaY,
        };
        pan.setValue({ x: offset.current.x, y: offset.current.y });
        onMapMove?.(-event.deltaX, -event.deltaY);
      };

      node.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        node.removeEventListener('wheel', handleWheel);
      };
    }, [onMapMove, pan, scale]);

    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: () => {
            lastGesture.current = { x: 0, y: 0 };
          },
          onPanResponderMove: (_, gesture) => {
            const deltaX = gesture.dx - lastGesture.current.x;
            const deltaY = gesture.dy - lastGesture.current.y;
            lastGesture.current = { x: gesture.dx, y: gesture.dy };

            pan.setValue({
              x: offset.current.x + gesture.dx,
              y: offset.current.y + gesture.dy,
            });

            onMapMove?.(deltaX, deltaY);
          },
          onPanResponderRelease: (_, gesture) => {
            offset.current = {
              x: offset.current.x + gesture.dx,
              y: offset.current.y + gesture.dy,
            };
            onMapMoveEnd?.();
            emitViewport();
            lastGesture.current = { x: 0, y: 0 };
          },
          onPanResponderTerminationRequest: () => false,
        }),
      [onMapMove, onMapMoveEnd, pan],
    );

    return (
      <View
        ref={containerRef}
        style={[styles.container, style]}
        {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.mapLayer,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { scale },
              ],
            },
          ]}>
          <LinearGradient
            colors={['#B3DCF2', '#7EC8E8', '#4A9FD4', '#2B7CB5']}
            locations={[0, 0.35, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />

          {markers.map((marker) => {
            const position = toPlaceholderPercent(marker.latitude, marker.longitude);

            return (
              <Pressable
                key={marker.id}
                onPress={() => onMarkerPress?.(marker.id)}
                style={[
                  styles.marker,
                  {
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                  },
                ]}>
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
                <View style={styles.markerLabel}>
                  <AppText variant="caption" style={styles.markerLabelText}>
                    {marker.label}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </Animated.View>

        <View style={[styles.mapBadge, { bottom: bottomInset }]} pointerEvents="none">
          <Ionicons name="map-outline" size={14} color={colors.primaryStrong} />
          <AppText variant="caption" style={styles.mapBadgeText}>
            {message}
          </AppText>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
  },
  mapLayer: {
    position: 'absolute',
    top: '-20%',
    left: '-20%',
    right: '-20%',
    bottom: '-20%',
    width: '140%',
    height: '140%',
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    marginLeft: -22,
    marginTop: -44,
    width: 120,
  },
  markerLabel: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  markerLabelText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  mapBadge: {
    position: 'absolute',
    alignSelf: 'center',
    left: '12%',
    right: '12%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  mapBadgeText: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
});
