import { StyleSheet, View } from 'react-native';

import { AppCard, AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { formatDepthMeters } from '@/src/features/dive-log/utils/format-dive-log';
import {
  formatTotalDuration,
  type DiveYearStats,
} from '@/src/features/dive/utils/dive-ledger';

type DiveYearStatsRowProps = {
  stats: DiveYearStats;
  year: number;
};

export function DiveYearStatsRow({ stats, year }: DiveYearStatsRowProps) {
  return (
    <View style={styles.container}>
      <AppText variant="caption" style={styles.caption}>
        {year}년 요약
      </AppText>
      <View style={styles.row}>
        <AppCard variant="soft" style={styles.statCard}>
          <AppText variant="caption" style={styles.label}>
            총 다이브
          </AppText>
          <AppText variant="h2" color="primary">
            {stats.diveCount}
          </AppText>
        </AppCard>
        <AppCard variant="soft" style={styles.statCard}>
          <AppText variant="caption" style={styles.label}>
            누적 시간
          </AppText>
          <AppText variant="h3" color="primary" numberOfLines={1}>
            {stats.diveCount > 0 ? formatTotalDuration(stats.totalDurationSec) : '-'}
          </AppText>
        </AppCard>
        <AppCard variant="soft" style={styles.statCard}>
          <AppText variant="caption" style={styles.label}>
            최대 수심
          </AppText>
          <AppText variant="h2" color="primary">
            {formatDepthMeters(stats.deepestDepthM)}
          </AppText>
        </AppCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  caption: {
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  label: {
    color: colors.textSecondary,
  },
});
