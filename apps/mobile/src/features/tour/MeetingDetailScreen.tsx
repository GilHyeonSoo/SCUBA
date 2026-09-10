import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppBadge, AppCard, AppHeader, AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import {
  equipmentRentalLabels,
  meetingCategoryLabels,
  meetingEnvironmentLabels,
  meetingPurposeLabels,
} from '@/src/features/tour/constants';
import { MeetingCoverImage } from '@/src/features/tour/components/MeetingCoverImage';
import { useMeetingStore } from '@/src/features/tour/stores/meeting-store';
import { formatMeetingCost, formatMeetingDateRange, formatMeetingParticipants } from '@/src/features/tour/utils';

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.detailContent}>
        <AppText variant="caption" color="textTertiary">
          {label}
        </AppText>
        <AppText variant="body" style={styles.detailValue}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

export default function MeetingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const meeting = useMeetingStore((state) =>
    id ? state.meetings.find((item) => item.id === id) : undefined,
  );

  if (!meeting) {
    return (
      <ScreenLayout
        header={
          <AppHeader
            title="모임 상세"
            onBack={router.canGoBack() ? () => router.back() : undefined}
          />
        }
        contentContainerStyle={styles.content}>
        <AppCard variant="soft">
          <AppText variant="h3">모임을 찾을 수 없습니다</AppText>
          <AppText variant="bodySmall" color="textSecondary">
            삭제되었거나 존재하지 않는 모임입니다.
          </AppText>
        </AppCard>
      </ScreenLayout>
    );
  }

  const spotsLeft = meeting.maxParticipants - meeting.currentParticipants;

  return (
    <ScreenLayout
      header={
        <AppHeader
          title="모임 상세"
          onBack={router.canGoBack() ? () => router.back() : undefined}
        />
      }
      contentContainerStyle={styles.content}>
      <AppCard elevated style={styles.coverCard}>
        <MeetingCoverImage meeting={meeting} edgeToEdge />
      </AppCard>

      <AppCard elevated style={styles.heroCard}>
        <View style={styles.hostRow}>
          <ProfileAvatar imageUrl={meeting.hostProfileImageUrl} size={56} />
          <View style={styles.hostInfo}>
            <AppText variant="caption" color="textSecondary">
              모임 주체
            </AppText>
            <AppText variant="h3">{meeting.hostName}</AppText>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <AppBadge label={meetingCategoryLabels[meeting.category]} tone="primary" />
          {meeting.category === 'buddy' ? (
            <AppBadge label={meetingEnvironmentLabels[meeting.environment]} tone="default" />
          ) : null}
        </View>

        <AppText variant="h2" style={styles.title}>
          {meeting.title}
        </AppText>
      </AppCard>

      <AppCard elevated style={styles.detailCard}>
        <DetailRow icon="calendar-outline" label="날짜" value={formatMeetingDateRange(meeting.date, meeting.endDate)} />
        <DetailRow icon="time-outline" label="시간" value={meeting.time} />
        <DetailRow icon="location-outline" label="장소" value={meeting.location} />
        <DetailRow icon="cash-outline" label="비용" value={formatMeetingCost(meeting.cost)} />
        <DetailRow
          icon="flag-outline"
          label="목적"
          value={meetingPurposeLabels[meeting.purpose]}
        />
        <DetailRow
          icon="construct-outline"
          label="장비렌탈"
          value={equipmentRentalLabels[meeting.equipmentRental]}
        />
        <DetailRow
          icon="people-outline"
          label="참여 인원"
          value={`${formatMeetingParticipants(meeting)} · ${spotsLeft}자리 남음`}
        />
      </AppCard>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  coverCard: {
    padding: 0,
    overflow: 'hidden',
  },
  heroCard: {
    gap: spacing.md,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  hostInfo: {
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    lineHeight: 32,
  },
  detailCard: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
    gap: 2,
  },
  detailValue: {
    fontWeight: '500',
  },
});
