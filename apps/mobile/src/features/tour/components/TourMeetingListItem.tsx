import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { MeetingCoverImage } from '@/src/features/tour/components/MeetingCoverImage';
import {
  equipmentRentalLabels,
  meetingEnvironmentLabels,
} from '@/src/features/tour/constants';
import type { DiveMeeting, TourMeetingListing } from '@/src/features/tour/types';
import { formatTourListingPrice } from '@/src/features/tour/utils';

type TourMeetingListItemProps = {
  meeting: DiveMeeting;
  onPress: () => void;
};

function resolveTourListing(meeting: DiveMeeting): TourMeetingListing {
  if (meeting.tourListing) {
    return meeting.tourListing;
  }

  const rentalLabel = equipmentRentalLabels[meeting.equipmentRental];
  return {
    badges: [{ label: meetingEnvironmentLabels[meeting.environment] }],
    hashtags: [`#${meeting.location.split(' ').pop() ?? '다이빙'}`],
    durationPackageLine: `당일 · ${rentalLabel}`,
    transportLine: null,
    priceFrom: true,
  };
}

export function TourMeetingListItem({ meeting, onPress }: TourMeetingListItemProps) {
  const listing = resolveTourListing(meeting);
  const hashtagLine = listing.hashtags.join(' ');
  const priceLabel = formatTourListingPrice(meeting.cost, listing.priceFrom ?? true);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          {listing.badges.map((badge) => (
            <View key={badge.label} style={styles.badge}>
              <AppText variant="caption" style={styles.badgeLabel} numberOfLines={1}>
                {badge.label}
              </AppText>
              {badge.showInfoIcon ? (
                <Ionicons name="help-circle-outline" size={12} color={colors.textTertiary} />
              ) : null}
            </View>
          ))}
        </View>

        <AppText variant="h3" numberOfLines={2} style={styles.title}>
          {meeting.title}
        </AppText>

        <AppText variant="bodySmall" numberOfLines={1} style={styles.hashtags}>
          {hashtagLine}
        </AppText>

        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
            <AppText variant="caption" color="textSecondary" numberOfLines={2} style={styles.metaText}>
              {listing.durationPackageLine}
            </AppText>
          </View>
          {listing.transportLine ? (
            <View style={styles.metaRow}>
              <Ionicons name="airplane-outline" size={14} color={colors.textTertiary} />
              <AppText variant="caption" color="textSecondary" numberOfLines={1} style={styles.metaText}>
                {listing.transportLine}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.mediaColumn}>
        <MeetingCoverImage meeting={meeting} variant="listPortrait" />
        <AppText variant="label" numberOfLines={1} style={styles.price}>
          {priceLabel}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
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
    minWidth: 0,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    maxWidth: '100%',
  },
  badgeLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 25,
  },
  hashtags: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 22,
  },
  metaBlock: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  metaText: {
    flex: 1,
    lineHeight: 18,
  },
  mediaColumn: {
    width: 96,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  price: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'right',
    width: '100%',
  },
});
