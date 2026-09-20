import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import type { DiveLog } from '@/src/features/dive-log/types';
import {
  formatDepthMeters,
  formatDiveDuration,
} from '@/src/features/dive-log/utils/format-dive-log';
import { formatTimelineDate } from '@/src/features/dive/utils/dive-ledger';

type DiveTimelineItemProps = {
  dive: DiveLog;
  isLast: boolean;
};

export function DiveTimelineItem({ dive, isLast }: DiveTimelineItemProps) {
  const title = dive.diveNumber ? `#${dive.diveNumber}` : '로그';

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={styles.dot} />
        {!isLast ? <View style={styles.line} /> : null}
      </View>

      <View style={[styles.card, isLast && styles.cardLast]}>
        <View style={styles.main}>
          <AppText variant="label" color="primary">
            {title}
          </AppText>
          <AppText variant="bodySmall">{formatTimelineDate(dive.startedAt)}</AppText>
        </View>
        <View style={styles.meta}>
          <AppText variant="caption" style={styles.metaText}>
            {formatDepthMeters(dive.maxDepthM)}
          </AppText>
          <AppText variant="caption" style={styles.metaDivider}>
            ·
          </AppText>
          <AppText variant="caption" style={styles.metaText}>
            {formatDiveDuration(dive.durationSec)}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rail: {
    width: 12,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 18,
  },
  line: {
    flex: 1,
    width: 1,
    backgroundColor: colors.divider,
    marginTop: spacing.xs,
    marginBottom: -spacing.sm,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  cardLast: {
    borderBottomWidth: 0,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.textSecondary,
  },
  metaDivider: {
    color: colors.textTertiary,
  },
});
