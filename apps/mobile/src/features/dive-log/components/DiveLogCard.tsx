import { StyleSheet, View } from 'react-native';

import { AppBadge, AppCard, AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import type { DiveLog } from '@/src/features/dive-log/types';
import {
  formatDepthMeters,
  formatDiveDate,
  formatDiveDuration,
  formatWaterTemperature,
} from '@/src/features/dive-log/utils/format-dive-log';

type DiveLogCardProps = {
  dive: DiveLog;
  style?: object;
};

export function DiveLogCard({ dive, style }: DiveLogCardProps) {
  const title = dive.diveNumber ? `다이브 #${dive.diveNumber}` : '다이브 로그';
  const deviceLabel = `${dive.source.vendor} ${dive.source.model}`.trim();

  return (
    <AppCard elevated style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <AppText variant="h3">{title}</AppText>
          <AppText variant="bodySmall">{formatDiveDate(dive.startedAt)}</AppText>
        </View>
        <AppBadge label="Import" tone="primary" />
      </View>

      <AppText variant="caption" style={styles.deviceText}>
        {deviceLabel}
      </AppText>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <AppText variant="caption">최대 수심</AppText>
          <AppText variant="h2" color="primary">
            {formatDepthMeters(dive.maxDepthM)}
          </AppText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <AppText variant="caption">다이빙 시간</AppText>
          <AppText variant="h2" color="primary">
            {formatDiveDuration(dive.durationSec)}
          </AppText>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <AppText variant="caption">수온</AppText>
          <AppText variant="h2" color="primary">
            {formatWaterTemperature(dive.waterTempC)}
          </AppText>
        </View>
      </View>

      {dive.profileSampleCount > 0 ? (
        <AppText variant="caption" style={styles.metaText}>
          프로파일 샘플 {dive.profileSampleCount}개
        </AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  deviceText: {
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  statBox: {
    flex: 1,
    gap: spacing.xs,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
  metaText: {
    color: colors.textTertiary,
  },
});
