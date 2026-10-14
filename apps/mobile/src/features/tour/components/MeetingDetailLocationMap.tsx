import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors, layout } from '@/src/constants';
import { DiveMapView } from '@/src/features/map/components/DiveMapView';
import type { MapMarker } from '@/src/features/map/types';

const LOCATION_MAP_ZOOM = 13;

type MeetingDetailLocationMapProps = {
  locationLabel: string;
  latitude: number;
  longitude: number;
  meetingId: string;
  edgeToEdge?: boolean;
};

export function MeetingDetailLocationMap({
  locationLabel,
  latitude,
  longitude,
  meetingId,
  edgeToEdge = false,
}: MeetingDetailLocationMapProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(0);

  const mapSize = edgeToEdge ? windowWidth : contentWidth;

  const markers = useMemo<MapMarker[]>(
    () => [
      {
        id: `${meetingId}-location`,
        label: locationLabel,
        latitude,
        longitude,
        tone: 'tour',
      },
    ],
    [latitude, locationLabel, longitude, meetingId],
  );

  const initialCenter = useMemo(
    () => ({
      latitude,
      longitude,
      zoomLevel: LOCATION_MAP_ZOOM,
    }),
    [latitude, longitude],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    if (edgeToEdge) {
      return;
    }

    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setContentWidth(nextWidth);
    }
  };

  return (
    <View style={styles.section} onLayout={handleLayout}>
      <View
        style={[
          styles.mapFrame,
          edgeToEdge && styles.mapFrameEdgeToEdge,
          mapSize > 0 && {
            width: edgeToEdge ? windowWidth : '100%',
            height: mapSize,
            aspectRatio: undefined,
          },
        ]}>
        <DiveMapView
          markers={markers}
          initialCenter={initialCenter}
          interactionEnabled={false}
          style={styles.map}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
  mapFrame: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
  },
  mapFrameEdgeToEdge: {
    alignSelf: 'center',
    marginHorizontal: -layout.screenPaddingHorizontal,
  },
  map: {
    flex: 1,
  },
});
