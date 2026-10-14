import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppBadge, AppButton, AppCard, AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import {
  equipmentRentalLabels,
  meetingCategoryLabels,
  meetingEnvironmentLabels,
  meetingPurposeLabels,
} from '@/src/features/tour/constants';
import { MeetingDetailCalendar } from '@/src/features/tour/components/MeetingDetailCalendar';
import { MeetingDetailLocationMap } from '@/src/features/tour/components/MeetingDetailLocationMap';
import { MeetingDetailMetaGrid } from '@/src/features/tour/components/MeetingDetailMetaGrid';
import { MeetingDetailParticipants } from '@/src/features/tour/components/MeetingDetailParticipants';
import { useMeetingStore } from '@/src/features/tour/stores/meeting-store';
import { formatMeetingCost } from '@/src/features/tour/utils';

export default function MeetingDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const meeting = useMeetingStore((state) =>
    id ? state.meetings.find((item) => item.id === id) : undefined,
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/tour');
  };

  const handleJoinPress = () => {
    Alert.alert('준비 중', '모임 참가 기능은 곧 제공됩니다.');
  };

  const backButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="뒤로 가기"
      hitSlop={8}
      onPress={handleBack}
      style={({ pressed }) => [
        styles.backButton,
        { top: insets.top + spacing.sm },
        pressed && styles.backButtonPressed,
      ]}>
      <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
    </Pressable>
  );

  if (!meeting) {
    return (
      <View style={styles.screen}>
        {backButton}
        <ScreenLayout contentTopSpacing={spacing.lg} contentContainerStyle={styles.content}>
          <AppCard variant="soft">
            <AppText variant="h3">모임을 찾을 수 없습니다</AppText>
            <AppText variant="bodySmall" color="textSecondary">
              삭제되었거나 존재하지 않는 모임입니다.
            </AppText>
          </AppCard>
        </ScreenLayout>
      </View>
    );
  }

  const metaCells = [
    { label: '시간', value: meeting.time },
    { label: '비용', value: formatMeetingCost(meeting.cost) },
    { label: '장비렌탈', value: equipmentRentalLabels[meeting.equipmentRental] },
    { label: '목적', value: meetingPurposeLabels[meeting.purpose] },
  ];

  return (
    <View style={styles.screen}>
      {backButton}
      <ScreenLayout contentTopSpacing={spacing.lg} contentContainerStyle={styles.content}>
        <AppCard variant="ghost" style={styles.heroCard}>
          <View style={styles.hostRow}>
            <ProfileAvatar imageUrl={meeting.hostProfileImageUrl} size={56} />
            <View style={styles.hostInfo}>
              <AppText variant="caption" color="textSecondary">
                모임 주체
              </AppText>
              <AppText variant="h3">{meeting.hostName}</AppText>
            </View>
            <MeetingDetailParticipants
              variant="hostHeader"
              current={meeting.currentParticipants}
              max={meeting.maxParticipants}
            />
          </View>

          <View style={styles.badgeRow}>
            <AppBadge label={meetingCategoryLabels[meeting.category]} tone="primary" />
            {meeting.category === 'buddy' ? (
              <AppBadge label={meetingEnvironmentLabels[meeting.environment]} tone="default" />
            ) : null}
          </View>

          <AppText variant="h1" style={styles.title}>
            {meeting.title}
          </AppText>
        </AppCard>

        <View style={styles.calendarSection}>
          <MeetingDetailCalendar startDateIso={meeting.date} endDateIso={meeting.endDate} />
        </View>

        <MeetingDetailMetaGrid cells={metaCells} />

        <View style={styles.mapSection}>
          <MeetingDetailLocationMap
            meetingId={meeting.id}
            locationLabel={meeting.location}
            latitude={meeting.latitude}
            longitude={meeting.longitude}
            edgeToEdge
          />
        </View>

        <AppButton label="참가하기" fullWidth size="lg" onPress={handleJoinPress} />
      </ScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  content: {
    gap: spacing.lg,
  },
  heroCard: {
    gap: spacing.md,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  hostInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  calendarSection: {
    marginTop: -spacing.md,
  },
  mapSection: {
    marginTop: spacing.xl,
  },
});
