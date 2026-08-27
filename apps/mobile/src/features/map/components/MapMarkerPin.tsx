import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/src/constants';
import type { MapMarkerTone } from '@/src/features/map/types';

const markerToneColors: Record<MapMarkerTone, string> = {
  buddy: colors.primary,
  pool: colors.primaryMid,
  site: colors.primaryStrong,
  shop: colors.ocean,
  tour: colors.warning,
};

const markerIcons: Record<MapMarkerTone, keyof typeof Ionicons.glyphMap> = {
  buddy: 'person',
  pool: 'water',
  site: 'location',
  shop: 'storefront',
  tour: 'boat',
};

type MapMarkerPinProps = {
  tone: MapMarkerTone;
};

export function MapMarkerPin({ tone }: MapMarkerPinProps) {
  return (
    <View style={[styles.pin, { backgroundColor: markerToneColors[tone] }]}>
      <Ionicons name={markerIcons[tone]} size={14} color={colors.textOnPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
});
