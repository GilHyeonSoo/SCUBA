import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { HomeFeedSection } from '@/src/features/home/components/HomeFeedSection';
import type { HomeOnThisDayMemory } from '@/src/features/home/mock-data';

type HomeOnThisDaySectionProps = {
  memory: HomeOnThisDayMemory;
  onPress?: () => void;
};

function MemoryStat({ label, value }: { label: string; value: string }) {
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

export function HomeOnThisDaySection({ memory, onPress }: HomeOnThisDaySectionProps) {
  return (
    <HomeFeedSection title="그날의 바다" rightLabel={`${memory.yearsAgo}년 전 오늘`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${memory.yearsAgo}년 전 ${memory.site} 다이빙 로그 보기`}
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => [styles.memory, pressed && onPress && styles.memoryPressed]}>
        <View style={styles.memoryHeader}>
          <View style={styles.memoryTitleBlock}>
            <AppText variant="sectionTitle" style={styles.site} numberOfLines={1}>
              {memory.site}
            </AppText>
            <AppText variant="bodySmall" style={styles.date}>
              {memory.date}
            </AppText>
          </View>
          {memory.buddy ? (
            <View style={styles.buddyBlock}>
              <AppText variant="caption" style={styles.buddyLabel}>
                BUDDY
              </AppText>
              <AppText variant="label" style={styles.buddyName} numberOfLines={1}>
                {memory.buddy}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <MemoryStat label="다이브 시간" value={`${memory.durationMin}분`} />
          <View style={styles.statDivider} />
          <MemoryStat label="최대 수심" value={`${memory.maxDepthM}m`} />
        </View>
        <AppText variant="bodySmall" style={styles.memoryNote}>
          그날의 로그를 다시 펼쳐보세요.
        </AppText>
      </Pressable>
    </HomeFeedSection>
  );
}

const styles = StyleSheet.create({
  memory: {
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  memoryPressed: {
    opacity: 0.88,
  },
  memoryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  memoryTitleBlock: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  site: {
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  date: {
    color: colors.textSecondary,
  },
  buddyBlock: {
    maxWidth: 112,
    alignItems: 'flex-end',
    gap: 2,
    paddingLeft: spacing.md,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.divider,
  },
  buddyLabel: {
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  buddyName: {
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statCell: {
    flex: 1,
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
  memoryNote: {
    color: colors.primary,
  },
});
