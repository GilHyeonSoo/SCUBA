import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { HomeFeedSection } from '@/src/features/home/components/HomeFeedSection';
import type { HomeBlueTrajectory } from '@/src/features/home/mock-data';

type HomeBlueTrajectorySectionProps = {
  trajectory: HomeBlueTrajectory;
  onPress?: () => void;
};

function TrajectoryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <AppText variant="caption" style={styles.statLabel}>
        {label}
      </AppText>
      <AppText variant="h3" style={styles.statValue} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

export function HomeBlueTrajectorySection({
  trajectory,
  onPress,
}: HomeBlueTrajectorySectionProps) {
  const { seasonStamp } = trajectory;
  const progress = seasonStamp.total > 0 ? seasonStamp.completed / seasonStamp.total : 0;
  const progressWidth = `${Math.min(Math.max(progress, 0), 1) * 100}%` as `${number}%`;

  return (
    <HomeFeedSection title="나의 블루 궤적" rightLabel="올해의 기록">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="나의 블루 궤적 다이빙 로그 보기"
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => [styles.content, pressed && onPress && styles.contentPressed]}>
        <View style={styles.statsRow}>
          <TrajectoryStat label="올해 처음 간 포인트" value={`${trajectory.newSitesThisYear}곳`} />
          <View style={styles.statDivider} />
          <TrajectoryStat label="누적 수중 시간" value={`${trajectory.underwaterHours}시간`} />
        </View>

        <View style={styles.seasonBlock}>
          <View style={styles.seasonTitleRow}>
            <View style={styles.seasonTitleBlock}>
              <AppText variant="label" style={styles.seasonTitle}>
                시즌 스탬프
              </AppText>
              <AppText variant="bodySmall" style={styles.seasonLabel}>
                {seasonStamp.label}
              </AppText>
            </View>
            <AppText variant="label" style={styles.seasonProgress}>
              {`${seasonStamp.completed}/${seasonStamp.total}`}
            </AppText>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>
      </Pressable>
    </HomeFeedSection>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingVertical: spacing.sm,
  },
  contentPressed: {
    opacity: 0.88,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statCell: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
  },
  statLabel: {
    color: colors.textTertiary,
  },
  statValue: {
    color: colors.textPrimary,
  },
  seasonBlock: {
    gap: spacing.sm,
  },
  seasonTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  seasonTitleBlock: {
    flex: 1,
    gap: 2,
  },
  seasonTitle: {
    color: colors.textPrimary,
  },
  seasonLabel: {
    color: colors.textSecondary,
  },
  seasonProgress: {
    color: colors.primary,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
