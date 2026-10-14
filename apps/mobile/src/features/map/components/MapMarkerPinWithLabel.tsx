import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { MapMarkerPin } from '@/src/features/map/components/MapMarkerPin';
import type { MapMarkerTone } from '@/src/features/map/types';

type MapMarkerPinWithLabelProps = {
  tone: MapMarkerTone;
  label: string;
  selected?: boolean;
};

export function MapMarkerPinWithLabel({ tone, label, selected = false }: MapMarkerPinWithLabelProps) {
  return (
    <View style={styles.wrapper}>
      <MapMarkerPin tone={tone} selected={selected} />
      <View style={styles.label}>
        <AppText variant="caption" style={styles.labelText} numberOfLines={2}>
          {label}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    maxWidth: 160,
  },
  label: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
  labelText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
