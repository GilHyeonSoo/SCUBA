import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { HomeFeedSection } from '@/src/features/home/components/HomeFeedSection';
import type { HomeSeaPulse } from '@/src/features/home/mock-data';

type HomeSeaPulseSectionProps = {
  pulse: HomeSeaPulse;
};

function StatCell({ label, value }: { label: string; value: string }) {
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

export function HomeSeaPulseSection({ pulse }: HomeSeaPulseSectionProps) {
  return (
    <HomeFeedSection
      title="바다의 지금"
      rightLabel={`${pulse.region} · ${pulse.periodLabel}`}>
      <View style={styles.statsRow}>
        <StatCell label="공유 로그" value={`${pulse.logCount7d}건`} />
        <View style={styles.statDivider} />
        <StatCell label="평균 시야 체감" value={pulse.visibilityLabel} />
        <View style={styles.statDivider} />
        <StatCell label="평균 수온" value={`${pulse.avgTempC}°C`} />
      </View>
      <AppText variant="bodySmall" style={styles.communityNote}>
        최근 다이버들이 남긴 로그로 본 지역 바다예요.
      </AppText>
    </HomeFeedSection>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: spacing.sm,
  },
  statCell: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.sm,
  },
  statLabel: {
    color: colors.textTertiary,
    letterSpacing: 0.2,
  },
  statValue: {
    color: colors.textPrimary,
  },
  communityNote: {
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
