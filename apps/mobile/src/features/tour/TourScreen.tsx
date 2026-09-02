import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { FadeInView } from '@/src/components/motion';
import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import {
  AppButton,
  AppCard,
  AppChip,
  AppText,
  SectionHeader,
} from '@/src/components/ui';
import { spacing } from '@/src/constants';
import { TourListItem } from '@/src/features/tour/components/TourListItem';
import { meetingCategoryFilters } from '@/src/features/tour/constants';
import { useMeetingStore } from '@/src/features/tour/stores/meeting-store';
import { filterMeetings } from '@/src/features/tour/utils';

export default function TourScreen() {
  const router = useRouter();
  const meetings = useMeetingStore((state) => state.meetings);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  const filteredMeetings = useMemo(
    () => filterMeetings(meetings, selectedCategoryIndex),
    [meetings, selectedCategoryIndex],
  );

  return (
    <ScreenLayout contentContainerStyle={styles.content}>
      <FadeInView index={0}>
        <AppButton
          label="모임 만들기"
          size="lg"
          fullWidth
          onPress={() => router.push('/(tabs)/tour/create')}
        />
      </FadeInView>

      <FadeInView index={1}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}>
          {meetingCategoryFilters.map((label, index) => (
            <AppChip
              key={label}
              label={label}
              selected={selectedCategoryIndex === index}
              onPress={() => setSelectedCategoryIndex(index)}
            />
          ))}
        </ScrollView>
      </FadeInView>

      <FadeInView index={2}>
        <SectionHeader
          title="모임"
          subtitle={`모집 중 ${filteredMeetings.length}개`}
          compact
        />
        {filteredMeetings.length > 0 ? (
          <View style={styles.list}>
            {filteredMeetings.map((meeting) => (
              <TourListItem
                key={meeting.id}
                meeting={meeting}
                onPress={() => router.push(`/(tabs)/tour/${meeting.id}`)}
              />
            ))}
          </View>
        ) : (
          <AppCard variant="soft" style={styles.emptyCard}>
            <AppText variant="h3">모집 중인 모임이 없습니다</AppText>
            <AppText variant="bodySmall" style={styles.emptyText}>
              새 다이빙 모임을 만들거나 필터를 변경해 보세요.
            </AppText>
            <AppButton
              label="모임 만들기"
              variant="secondary"
              onPress={() => router.push('/(tabs)/tour/create')}
            />
          </AppCard>
        )}
      </FadeInView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  list: {
    gap: spacing.lg,
  },
  emptyCard: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  emptyText: {
    marginBottom: spacing.sm,
  },
});
