import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import { MeetingMetaTag } from '@/src/features/tour/components/MeetingMetaTag';
import { meetingEnvironmentLabels, meetingPurposeLabels } from '@/src/features/tour/constants';
import type { DiveMeeting } from '@/src/features/tour/types';
import {
  formatMeetingCost,
  formatMeetingParticipants,
  formatMeetingScheduleLine,
} from '@/src/features/tour/utils';

type BuddyMeetingListItemProps = {
  meeting: DiveMeeting;
  onPress: () => void;
};

export function BuddyMeetingListItem({ meeting, onPress }: BuddyMeetingListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <ProfileAvatar imageUrl={meeting.hostProfileImageUrl} size={56} />

      <View style={styles.content}>
        <AppText variant="label" numberOfLines={1} style={styles.hostName}>
          {meeting.hostName}
        </AppText>
        <AppText variant="bodySmall" color="textSecondary" numberOfLines={2} style={styles.schedule}>
          {formatMeetingScheduleLine(meeting)}
        </AppText>
        <View style={styles.metaRow}>
          <MeetingMetaTag label={meetingEnvironmentLabels[meeting.environment]} />
          <MeetingMetaTag label={meetingPurposeLabels[meeting.purpose]} />
          <AppText variant="caption" style={styles.metaText}>
            {`${formatMeetingParticipants(meeting)}명 · ${formatMeetingCost(meeting.cost)}`}
          </AppText>
        </View>
      </View>

      <View style={styles.action}>
        <AppText variant="caption" style={styles.actionLabel}>
          신청
        </AppText>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowPressed: {
    opacity: 0.72,
  },
  content: {
    flex: 1,
    gap: spacing.sm,
  },
  hostName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
  },
  schedule: {
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metaText: {
    color: colors.textTertiary,
    fontWeight: '600',
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 36,
  },
  actionLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
});
