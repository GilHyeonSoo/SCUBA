import { useCallback, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppButton, AppText } from '@/src/components/ui';
import { colors, radius, shadows, spacing } from '@/src/constants';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import { MeetingCoverImage } from '@/src/features/tour/components/MeetingCoverImage';
import {
  equipmentRentalLabels,
  meetingEnvironmentLabels,
  meetingPurposeLabels,
} from '@/src/features/tour/constants';
import type { DiveMeeting } from '@/src/features/tour/types';
import {
  formatMeetingCost,
  formatMeetingDateRangeCompact,
  formatMeetingParticipants,
} from '@/src/features/tour/utils';

const HERO_IMAGE_HEIGHT = 224;
const PAGER_HEIGHT = 332;

type TourMeetingListItemProps = {
  meeting: DiveMeeting;
  onPress: () => void;
};

export function TourMeetingListItem({ meeting, onPress }: TourMeetingListItemProps) {
  const [pageWidth, setPageWidth] = useState(0);
  const [activePage, setActivePage] = useState(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setPageWidth((current) => (current === nextWidth ? current : nextWidth));
    }
  }, []);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageWidth <= 0) {
        return;
      }

      const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
      setActivePage(index);
    },
    [pageWidth],
  );

  return (
    <View style={[styles.card, shadows.sm]}>
      <View onLayout={handleLayout} style={styles.pagerViewport}>
        {pageWidth > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            bounces={false}
            nestedScrollEnabled
            directionalLockEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            style={[styles.pager, { width: pageWidth, height: PAGER_HEIGHT }]}
            contentContainerStyle={{ height: PAGER_HEIGHT }}>
            <View style={[styles.page, { width: pageWidth, height: PAGER_HEIGHT }]}>
              <MeetingCoverImage meeting={meeting} variant="hero" />
              <View style={styles.heroTitleSection}>
                <AppText variant="h3" numberOfLines={2} style={styles.heroTitle}>
                  {meeting.title}
                </AppText>
                <AppText variant="caption" style={styles.swipeHint}>
                  옆으로 밀어 정보 보기
                </AppText>
              </View>
            </View>

            <View style={[styles.page, styles.infoPage, { width: pageWidth, height: PAGER_HEIGHT }]}>
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.infoScrollContent}
                style={styles.infoScroll}>
                <AppText variant="h3" numberOfLines={2} style={styles.infoTitle}>
                  {meeting.title}
                </AppText>

                <View style={styles.infoRows}>
                  <InfoRow
                    label="일정"
                    value={`${formatMeetingDateRangeCompact(meeting.date, meeting.endDate)} ${meeting.time}`}
                  />
                  <InfoRow label="장소" value={meeting.location} />
                  <InfoRow label="환경" value={meetingEnvironmentLabels[meeting.environment]} />
                  <InfoRow label="목적" value={meetingPurposeLabels[meeting.purpose]} />
                  <InfoRow label="비용" value={formatMeetingCost(meeting.cost)} emphasis />
                  <InfoRow
                    label="모집"
                    value={`${formatMeetingParticipants(meeting)}명 · 장비 ${equipmentRentalLabels[meeting.equipmentRental]}`}
                  />
                </View>

                <View style={styles.hostRow}>
                  <ProfileAvatar imageUrl={meeting.hostProfileImageUrl} size={32} />
                  <AppText
                    variant="bodySmall"
                    color="textSecondary"
                    numberOfLines={1}
                    style={styles.hostName}>
                    {meeting.hostName}
                  </AppText>
                </View>
              </ScrollView>

              <AppButton label="더 보기" onPress={onPress} fullWidth />
            </View>
          </ScrollView>
        ) : null}
      </View>

      <View style={styles.pageIndicator}>
        <View style={[styles.pageDot, activePage === 0 && styles.pageDotActive]} />
        <View style={[styles.pageDot, activePage === 1 && styles.pageDotActive]} />
      </View>
    </View>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  emphasis?: boolean;
};

function InfoRow({ label, value, emphasis = false }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="caption" style={styles.infoLabel}>
        {label}
      </AppText>
      <AppText
        variant="bodySmall"
        numberOfLines={2}
        style={[styles.infoValue, emphasis && styles.infoValueEmphasis]}>
        {value}
      </AppText>
    </View>
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
  pagerViewport: {
    width: '100%',
    overflow: 'hidden',
  },
  pager: {
    flexGrow: 0,
  },
  page: {
    overflow: 'hidden',
  },
  heroTitleSection: {
    flex: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    minHeight: PAGER_HEIGHT - HERO_IMAGE_HEIGHT,
  },
  heroTitle: {
    color: colors.textPrimary,
    lineHeight: 28,
  },
  swipeHint: {
    color: colors.textTertiary,
    fontWeight: '600',
  },
  infoPage: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  infoScroll: {
    flex: 1,
  },
  infoScrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  infoTitle: {
    color: colors.textPrimary,
    lineHeight: 26,
  },
  infoRows: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoLabel: {
    width: 40,
    color: colors.textTertiary,
    fontWeight: '700',
    lineHeight: 20,
  },
  infoValue: {
    flex: 1,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  infoValueEmphasis: {
    color: colors.primaryStrong,
    fontWeight: '700',
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hostName: {
    flex: 1,
    fontWeight: '600',
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  pageDotActive: {
    width: 16,
    backgroundColor: colors.primary,
  },
});
