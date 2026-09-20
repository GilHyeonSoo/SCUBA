import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppBadge, AppText } from '@/src/components/ui';
import { colors, gradients, radius, shadows, spacing } from '@/src/constants';
import type { DiveLog } from '@/src/features/dive-log/types';
import {
  formatDepthMeters,
  formatDiveDate,
  formatDiveDuration,
  formatWaterTemperature,
} from '@/src/features/dive-log/utils/format-dive-log';
import { DiveProfileChart } from '@/src/features/dive/components/DiveProfileChart';

type RecentDiveHeroProps = {
  dive: DiveLog;
};

export function RecentDiveHero({ dive }: RecentDiveHeroProps) {
  const title = dive.diveNumber ? `다이브 #${dive.diveNumber}` : '최근 다이빙';
  const deviceLabel = `${dive.source.vendor} ${dive.source.model}`.trim();

  return (
    <View style={[styles.card, shadows.lg]} accessibilityRole="summary">
      <LinearGradient
        colors={[...gradients.hero]}
        start={{ x: 0, y: 0.15 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(4,38,74,0.88)', 'rgba(4,38,74,0.45)', 'transparent']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <AppBadge label="Recent" tone="onDark" />
          <AppText variant="caption" style={styles.dateText}>
            {formatDiveDate(dive.startedAt)}
          </AppText>
        </View>

        <AppText variant="h2" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="bodySmall" style={styles.deviceText}>
          {deviceLabel}
        </AppText>

        <DiveProfileChart profile={dive.profile} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <AppText variant="caption" style={styles.statLabel}>
              최대 수심
            </AppText>
            <AppText variant="h2" style={styles.statValue}>
              {formatDepthMeters(dive.maxDepthM)}
            </AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <AppText variant="caption" style={styles.statLabel}>
              다이빙 시간
            </AppText>
            <AppText variant="h2" style={styles.statValue}>
              {formatDiveDuration(dive.durationSec)}
            </AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <AppText variant="caption" style={styles.statLabel}>
              수온
            </AppText>
            <AppText variant="h2" style={styles.statValue}>
              {formatWaterTemperature(dive.waterTempC)}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 220,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dateText: {
    color: 'rgba(255,255,255,0.82)',
  },
  title: {
    color: colors.textOnPrimary,
    letterSpacing: -0.4,
  },
  deviceText: {
    color: 'rgba(255,255,255,0.78)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.72)',
  },
  statValue: {
    color: colors.textOnPrimary,
    fontSize: 18,
    lineHeight: 24,
  },
});
