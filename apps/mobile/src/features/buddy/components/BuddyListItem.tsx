import { StyleSheet, View } from 'react-native';

import { AppBadge, AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import type { BuddyProfile } from '@/src/features/buddy/mock-data';

type BuddyListItemProps = {
  buddy: BuddyProfile;
};

const diveTypeLabel = {
  scuba: '스킨스쿠버',
  freediving: '프리다이빙',
  both: '스쿠버 · 프리',
} as const;

export function BuddyListItem({ buddy }: BuddyListItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <AppText variant="label" color="primary">
          {buddy.nickname.charAt(0)}
        </AppText>
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText variant="body" style={styles.name}>
            {buddy.nickname}
          </AppText>
          <AppBadge label={buddy.certification} tone="primary" />
        </View>
        <AppText variant="caption" style={styles.meta}>
          {`${diveTypeLabel[buddy.diveType]} · ${buddy.distanceKm.toFixed(1)}km · ${buddy.region}`}
        </AppText>
        <AppText variant="caption" style={styles.status}>
          {buddy.status}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  meta: {
    color: colors.textSecondary,
  },
  status: {
    color: colors.textTertiary,
  },
});
