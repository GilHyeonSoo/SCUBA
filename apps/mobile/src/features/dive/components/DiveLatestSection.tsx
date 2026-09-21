import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import type { DiveLog } from '@/src/features/dive-log/types';
import {
  formatDepthMeters,
  formatDiveDate,
  formatDiveLocationLabel,
  formatDiveMetadataLine,
} from '@/src/features/dive-log/utils/format-dive-log';
import { DiveProfileChart } from '@/src/features/dive/components/DiveProfileChart';
import { canRenderProfile } from '@/src/features/dive/utils/dive-ledger';

type DiveLatestSectionProps = {
  dive: DiveLog;
  onDetailPress?: (diveId: string) => void;
};

export function DiveLatestSection({ dive, onDetailPress }: DiveLatestSectionProps) {
  const locationLabel = formatDiveLocationLabel(dive.source.vendor, dive.source.model);
  const metadataLine = formatDiveMetadataLine({
    durationSec: dive.durationSec,
    avgDepthM: dive.avgDepthM,
    waterTempC: dive.waterTempC,
  });
  const hasProfile = canRenderProfile(dive.profile);

  return (
    <View style={styles.section} accessibilityRole="summary">
      <AppText variant="bodySmall" style={styles.sectionLabel}>
        최근 다이빙
      </AppText>

      <AppText variant="h2" style={styles.dateLocation}>
        {formatDiveDate(dive.startedAt)}
        {locationLabel ? ` · ${locationLabel}` : ''}
      </AppText>

      <View style={styles.depthBlock}>
        <AppText variant="label" style={styles.depthLabel}>
          최대 수심
        </AppText>
        <AppText variant="numericHero" style={styles.depthValue}>
          {formatDepthMeters(dive.maxDepthM)}
        </AppText>
      </View>

      {hasProfile ? <DiveProfileChart profile={dive.profile} variant="featured" /> : null}

      {!hasProfile ? (
        <AppText variant="label" style={styles.noProfile}>
          프로파일 데이터 없음
        </AppText>
      ) : null}

      {metadataLine ? (
        <AppText variant="bodySmall" style={styles.metadata}>
          {metadataLine}
        </AppText>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="로그 상세 보기"
        onPress={() => onDetailPress?.(dive.id)}
        style={({ pressed }) => [styles.detailLink, pressed && styles.detailLinkPressed]}>
        <AppText variant="label" color="primary">
          로그 상세 보기
        </AppText>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sectionLabel: {
    color: colors.textSecondary,
    textTransform: 'none',
  },
  dateLocation: {
    letterSpacing: -0.2,
  },
  depthBlock: {
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  depthLabel: {
    color: colors.textSecondary,
  },
  depthValue: {
    letterSpacing: -1,
    color: colors.primaryStrong,
  },
  noProfile: {
    color: colors.textTertiary,
  },
  metadata: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  detailLinkPressed: {
    opacity: 0.7,
  },
});
