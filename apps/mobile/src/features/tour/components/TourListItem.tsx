import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, shadows, spacing } from '@/src/constants';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import { DashedDivider } from '@/src/features/tour/components/DashedDivider';
import { MeetingCoverImage } from '@/src/features/tour/components/MeetingCoverImage';
import type { DiveMeeting } from '@/src/features/tour/types';
import {
  formatMeetingCost,
  formatMeetingDate,
  formatMeetingParticipants,
} from '@/src/features/tour/utils';

type TourListItemProps = {
  meeting: DiveMeeting;
  onPress: () => void;
};

export function TourListItem({ meeting, onPress }: TourListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, shadows.md, pressed && styles.cardPressed]}>
      <View style={styles.topSection}>
        <View style={styles.scheduleArea}>
          <AppText variant="caption" style={styles.date}>
            {formatMeetingDate(meeting.date)}
          </AppText>
          <AppText variant="body" style={styles.time}>
            {meeting.time}
          </AppText>
        </View>

        <DashedDivider direction="vertical" />

        <View style={styles.stubArea}>
          <AppText variant="h2" style={styles.participants}>
            {formatMeetingParticipants(meeting)}
          </AppText>
          <AppText variant="caption" style={styles.stubLabel}>
            인원
          </AppText>
        </View>
      </View>

      <DashedDivider />

      <View style={styles.coverArea}>
        <MeetingCoverImage meeting={meeting} />
      </View>

      <DashedDivider />

      <View style={styles.bottomSection}>
        <AppText variant="h3" numberOfLines={2} style={styles.title}>
          {meeting.title}
        </AppText>

        <View style={styles.hostRow}>
          <ProfileAvatar imageUrl={meeting.hostProfileImageUrl} size={28} />
          <AppText variant="bodySmall" color="textSecondary" numberOfLines={1} style={styles.hostMeta}>
            {`${meeting.hostName} · ${meeting.location}`}
          </AppText>
        </View>

        <View style={styles.footerRow}>
          <AppText variant="label" style={styles.cost}>
            {formatMeetingCost(meeting.cost)}
          </AppText>
          <View style={styles.detailLink}>
            <AppText variant="label" style={styles.detailLabel}>
              상세 보기
            </AppText>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </View>
        </View>
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
    transform: [{ scale: 0.996 }],
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  scheduleArea: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
    paddingRight: spacing.md,
  },
  date: {
    color: colors.primary,
    fontWeight: '700',
  },
  time: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  stubArea: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: spacing.md,
    gap: 2,
  },
  participants: {
    color: colors.primaryStrong,
    fontWeight: '700',
    lineHeight: 32,
  },
  stubLabel: {
    color: colors.textTertiary,
    fontWeight: '600',
  },
  coverArea: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bottomSection: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    lineHeight: 28,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hostMeta: {
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cost: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});
