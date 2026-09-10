import { Pressable, StyleSheet, View } from 'react-native';

import { AppBadge, AppText } from '@/src/components/ui';
import { colors, radius, shadows, spacing } from '@/src/constants';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import { equipmentRentalLabels, meetingPurposeLabels } from '@/src/features/tour/constants';
import type { DiveMeeting } from '@/src/features/tour/types';
import {
  formatMeetingCost,
  formatMeetingDateCompact,
  formatMeetingParticipants,
} from '@/src/features/tour/utils';

type EducationMeetingListItemProps = {
  meeting: DiveMeeting;
  onPress: () => void;
};

export function EducationMeetingListItem({ meeting, onPress }: EducationMeetingListItemProps) {
  const purposeLabel = meetingPurposeLabels[meeting.purpose];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, shadows.md, pressed && styles.cardPressed]}>
      <View style={styles.instructorSection}>
        <ProfileAvatar imageUrl={meeting.hostProfileImageUrl} size={56} />
        <View style={styles.instructorMeta}>
          <AppText variant="label" numberOfLines={1} style={styles.instructorName}>
            {meeting.hostName}
          </AppText>
          <View style={styles.instructorBadges}>
            <AppBadge label="강사" tone="primary" />
            <AppBadge label={purposeLabel} tone="default" />
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.courseSection}>
        <AppText variant="h3" numberOfLines={2} style={styles.title}>
          {meeting.title}
        </AppText>

        <AppText variant="bodySmall" color="textSecondary">
          {`${formatMeetingDateCompact(meeting.date)} ${meeting.time} · ${meeting.location}`}
        </AppText>

        <View style={styles.detailRow}>
          <AppText variant="label" style={styles.cost}>
            {formatMeetingCost(meeting.cost)}
          </AppText>
          <AppText variant="caption" style={styles.detailText}>
            {`장비 ${equipmentRentalLabels[meeting.equipmentRental]}`}
          </AppText>
        </View>

        <AppText variant="caption" style={styles.participants}>
          {`${formatMeetingParticipants(meeting)}명 모집 중`}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.98,
  },
  instructorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  instructorMeta: {
    flex: 1,
    gap: spacing.sm,
  },
  instructorName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
  },
  instructorBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
  },
  courseSection: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    lineHeight: 26,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  cost: {
    color: colors.primaryStrong,
    fontWeight: '700',
  },
  detailText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  participants: {
    color: colors.textTertiary,
    fontWeight: '600',
  },
});
