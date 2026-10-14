import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppCard, AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import MeetingDetailScreen from '@/src/features/tour/MeetingDetailScreen';
import { TourMeetingDetailScreen } from '@/src/features/tour/TourMeetingDetailScreen';
import { useMeetingStore } from '@/src/features/tour/stores/meeting-store';

export default function MeetingDetailRoute() {
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

  if (!meeting) {
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

  if (meeting.category === 'tour') {
    return <TourMeetingDetailScreen meeting={meeting} />;
  }

  return <MeetingDetailScreen />;
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
});
