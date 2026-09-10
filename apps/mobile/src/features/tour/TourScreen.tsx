import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '@/src/components/motion';
import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppCard, AppText } from '@/src/components/ui';
import { spacing } from '@/src/constants';
import { MeetingCategoryContent } from '@/src/features/tour/components/MeetingCategoryContent';
import { MeetingCategoryTabs } from '@/src/features/tour/components/MeetingCategoryTabs';
import { MeetingRecruitFab } from '@/src/features/tour/components/MeetingRecruitFab';
import { TourListItem } from '@/src/features/tour/components/TourListItem';
import { meetingCategoryLabels } from '@/src/features/tour/constants';
import { useMeetingStore } from '@/src/features/tour/stores/meeting-store';
import type { MeetingCategory } from '@/src/features/tour/types';
import { filterMeetings } from '@/src/features/tour/utils';

export default function TourScreen() {
  const router = useRouter();
  const meetings = useMeetingStore((state) => state.meetings);
  const [selectedCategory, setSelectedCategory] = useState<MeetingCategory>('buddy');

  const filteredMeetings = useMemo(
    () => filterMeetings(meetings, selectedCategory),
    [meetings, selectedCategory],
  );

  const categoryLabel = meetingCategoryLabels[selectedCategory];

  const openCreateMeeting = () => {
    router.push('/(tabs)/tour/create');
  };

  return (
    <View style={styles.screen}>
      <ScreenLayout contentContainerStyle={styles.content}>
        <FadeInView index={0}>
          <MeetingCategoryTabs value={selectedCategory} onChange={setSelectedCategory} />
        </FadeInView>

        <MeetingCategoryContent category={selectedCategory}>
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
              <AppText variant="h3">{`${categoryLabel} 모집 중인 모임이 없습니다`}</AppText>
              <AppText variant="bodySmall" color="textSecondary">
                {`${categoryLabel} 모임을 새로 만들어 보세요.`}
              </AppText>
            </AppCard>
          )}
        </MeetingCategoryContent>
      </ScreenLayout>

      <MeetingRecruitFab onPress={openCreateMeeting} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
  },
  list: {
    gap: spacing.lg,
  },
  emptyCard: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
});
