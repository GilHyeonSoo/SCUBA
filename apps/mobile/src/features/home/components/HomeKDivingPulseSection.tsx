import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { HomeFeedSection } from '@/src/features/home/components/HomeFeedSection';
import type { HomeKDivingPulseSpot } from '@/src/features/home/mock-data';

type HomeKDivingPulseSectionProps = {
  spots: HomeKDivingPulseSpot[];
  onPressSpot?: (spot: HomeKDivingPulseSpot) => void;
};

function PulseMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBlock}>
      <AppText variant="caption" style={styles.metricLabel}>
        {label}
      </AppText>
      <AppText variant="h3" style={styles.metricValue} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

export function HomeKDivingPulseSection({
  spots,
  onPressSpot,
}: HomeKDivingPulseSectionProps) {
  return (
    <HomeFeedSection title="K-다이빙 펄스" rightLabel="지금 어디로 입수할까?">
      <View>
        {spots.map((spot, index) => (
          <Pressable
            key={spot.id}
            accessibilityRole="button"
            accessibilityLabel={`${spot.name} 다이빙 정보 보기`}
            disabled={!onPressSpot}
            onPress={() => onPressSpot?.(spot)}
            style={({ pressed }) => [
              styles.spotRow,
              index < spots.length - 1 && styles.spotRowDivider,
              pressed && onPressSpot && styles.spotRowPressed,
            ]}>
            <View style={styles.spotColumn}>
              <AppText variant="h3" style={styles.spotTitle} numberOfLines={1}>
                {spot.name}
              </AppText>
              <AppText variant="bodySmall" style={styles.spotRegion} numberOfLines={1}>
                {spot.region}
              </AppText>
              <AppText variant="bodySmall" style={styles.spotNote} numberOfLines={2}>
                {spot.note}
              </AppText>
            </View>

            <View style={styles.metricsColumn}>
              <PulseMetric label="시야" value={spot.visibilityLabel} />
              <View style={styles.metricDivider} />
              <PulseMetric label="수온" value={`${spot.waterTempC}°C`} />
            </View>
          </Pressable>
        ))}
      </View>
    </HomeFeedSection>
  );
}

const styles = StyleSheet.create({
  spotRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  spotRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  spotRowPressed: {
    opacity: 0.88,
  },
  spotColumn: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  spotTitle: {
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  spotRegion: {
    color: colors.textSecondary,
  },
  spotNote: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  metricsColumn: {
    width: 140,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.divider,
    paddingLeft: spacing.md,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  metricBlock: {
    gap: 2,
  },
  metricLabel: {
    color: colors.textTertiary,
    letterSpacing: 0.3,
  },
  metricValue: {
    color: colors.primary,
  },
  metricDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
});
