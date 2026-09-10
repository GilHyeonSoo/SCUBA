import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';

import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppCard, AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { MeetingCategoryTabs } from '@/src/features/tour/components/MeetingCategoryTabs';
import { MeetingListItem } from '@/src/features/tour/components/MeetingListItem';
import { MeetingRecruitFab } from '@/src/features/tour/components/MeetingRecruitFab';
import { meetingCategoryLabels, meetingCategoryTabs } from '@/src/features/tour/constants';
import { useMeetingStore } from '@/src/features/tour/stores/meeting-store';
import type { MeetingCategory } from '@/src/features/tour/types';
import { filterMeetings } from '@/src/features/tour/utils';

type CategoryTab = (typeof meetingCategoryTabs)[number];

export default function TourScreen() {
  const router = useRouter();
  const meetings = useMeetingStore((state) => state.meetings);
  const pagerRef = useRef<FlatList<CategoryTab>>(null);
  const [selectedCategory, setSelectedCategory] = useState<MeetingCategory>('buddy');
  const [pagerWidth, setPagerWidth] = useState(0);

  const selectedIndex = meetingCategoryTabs.findIndex((tab) => tab.value === selectedCategory);

  const handlePagerLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setPagerWidth((current) => (current === nextWidth ? current : nextWidth));
    }
  }, []);

  useEffect(() => {
    if (pagerWidth <= 0 || selectedIndex < 0) {
      return;
    }

    pagerRef.current?.scrollToOffset({
      offset: selectedIndex * pagerWidth,
      animated: false,
    });
  }, [pagerWidth]);

  const handleCategoryChange = useCallback(
    (category: MeetingCategory) => {
      const index = meetingCategoryTabs.findIndex((tab) => tab.value === category);
      if (index < 0) {
        return;
      }

      setSelectedCategory(category);

      if (pagerWidth > 0) {
        pagerRef.current?.scrollToOffset({
          offset: index * pagerWidth,
          animated: true,
        });
      }
    },
    [pagerWidth],
  );

  const handlePagerMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pagerWidth <= 0) {
        return;
      }

      const index = Math.round(event.nativeEvent.contentOffset.x / pagerWidth);
      const category = meetingCategoryTabs[index]?.value;
      if (category) {
        setSelectedCategory(category);
      }
    },
    [pagerWidth],
  );

  const renderCategoryPage: ListRenderItem<CategoryTab> = useCallback(
    ({ item }) => {
      const filteredMeetings = filterMeetings(meetings, item.value);
      const categoryLabel = meetingCategoryLabels[item.value];

      const listStyle =
        item.value === 'buddy'
          ? styles.buddyList
          : item.value === 'tour'
            ? styles.tourList
            : styles.educationList;

      return (
        <View style={[styles.page, pagerWidth > 0 && { width: pagerWidth }]}>
          {filteredMeetings.length > 0 ? (
            <View style={listStyle}>
              {filteredMeetings.map((meeting) => (
                <MeetingListItem
                  key={meeting.id}
                  category={item.value}
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
        </View>
      );
    },
    [meetings, pagerWidth, router],
  );

  return (
    <View style={styles.screen}>
      <ScreenLayout contentContainerStyle={styles.content}>
        <MeetingCategoryTabs value={selectedCategory} onChange={handleCategoryChange} />

        <View onLayout={handlePagerLayout} style={styles.pagerViewport}>
          {pagerWidth > 0 ? (
            <FlatList
              ref={pagerRef}
              data={meetingCategoryTabs}
              horizontal
              pagingEnabled
              scrollEnabled={selectedCategory !== 'tour'}
              bounces={false}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.value}
              renderItem={renderCategoryPage}
              onMomentumScrollEnd={handlePagerMomentumEnd}
              getItemLayout={(_, index) => ({
                length: pagerWidth,
                offset: pagerWidth * index,
                index,
              })}
              style={styles.pager}
              contentContainerStyle={styles.pagerContent}
            />
          ) : null}
        </View>
      </ScreenLayout>

      <MeetingRecruitFab onPress={() => router.push('/(tabs)/tour/create')} />
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
  pagerViewport: {
    width: '100%',
  },
  pager: {
    flexGrow: 0,
  },
  pagerContent: {
    flexGrow: 1,
  },
  page: {
    flexGrow: 1,
  },
  buddyList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  tourList: {
    gap: spacing.xl,
  },
  educationList: {
    gap: spacing.lg,
  },
  emptyCard: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
});
