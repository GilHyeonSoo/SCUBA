import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors, shadows } from '@/src/constants';
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
  selected?: boolean;
};

export function MapMarkerPin({ tone, selected = false }: MapMarkerPinProps) {
  const pinSize = selected ? 44 : 34;
  const iconSize = selected ? 18 : 14;
  const haloSize = 52;
  const wrapperSize = selected ? 60 : 48;

  return (
    <View style={[styles.wrapper, { width: wrapperSize, height: wrapperSize }]}>
      {selected ? (
        <View
          style={[
            styles.halo,
            {
              width: haloSize,
              height: haloSize,
              borderRadius: haloSize / 2,
              borderColor: markerToneColors[tone],
            },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.pin,
          {
            width: pinSize,
            height: pinSize,
            borderRadius: pinSize / 2,
            backgroundColor: markerToneColors[tone],
            borderWidth: selected ? 3 : 2.5,
          },
          selected && shadows.md,
        ]}>
        <Ionicons
          name={markerIcons[tone]}
          size={iconSize}
          color={colors.textOnPrimary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    borderWidth: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.white,
  },
});
