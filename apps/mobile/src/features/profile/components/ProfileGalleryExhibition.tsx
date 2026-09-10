import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  type ViewToken,
} from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { useProfileGalleryStore } from '@/src/features/profile/stores/profile-gallery-store';
import type { ProfileGalleryImage } from '@/src/features/profile/types';
import type { ExhibitionLayout } from '@/src/features/profile/utils/exhibition-layout';

const STORY_LOCATIONS = [
  '제주 서귀포',
  '속초 정동진',
  '부산 해운대',
  '거제 외도',
  '여수 돌산',
  '포항 구룡포',
  '태안 안면도',
  '인천 무의도',
  '강릉 경포대',
  '완도 청산도',
  '통영 한려수도',
  '고흥 녹동',
] as const;

const STORY_CAPTIONS = [
  '맑은 바다에서의 첫 다이브',
  '아침 해변에서 만난 푸른 수면',
  '산호초 사이로 스며드는 햇살',
  '조용한 수중에서의 한숨',
  '버디와 함께한 완벽한 하강',
  '수중에서 만난 작은 물고기들',
  '깊이 내려가며 펼쳐진 푸른 세계',
  '파도 위로 돌아온 오후',
  '장비 체크 후 첫 입수 순간',
  '수중 촬영으로 남긴 오늘의 기록',
  '잔잔한 물결 아래 또 다른 하늘',
  '다음 다이브를 기다리며',
] as const;

type StoryMeta = {
  dateLabel: string;
  location: string;
  caption: string;
};

function formatStoryDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function getStoryMeta(image: ProfileGalleryImage, index: number): StoryMeta {
  return {
    dateLabel: formatStoryDate(image.createdAt),
    location: STORY_LOCATIONS[index % STORY_LOCATIONS.length],
    caption: STORY_CAPTIONS[index % STORY_CAPTIONS.length],
  };
}

type StorySlideProps = {
  image: ProfileGalleryImage;
  index: number;
  slideWidth: number;
  slideHeight: number;
  cardHeight: number;
  cardSideInset: number;
  onPress: (image: ProfileGalleryImage) => void;
};

function StorySlide({
  image,
  index,
  slideWidth,
  slideHeight,
  cardHeight,
  cardSideInset,
  onPress,
}: StorySlideProps) {
  const meta = getStoryMeta(image, index);
  const cardWidth = slideWidth - cardSideInset * 2;

  return (
    <View style={[styles.slide, { width: slideWidth, height: slideHeight }]}>
      <View style={[styles.foregroundWrap, { paddingHorizontal: cardSideInset }]}>
        <Pressable
          accessibilityRole="imagebutton"
          accessibilityLabel="사진 크게 보기"
          onPress={() => onPress(image)}
          style={[
            styles.foregroundCard,
            {
              width: cardWidth,
              height: cardHeight,
            },
          ]}>
          <Image source={{ uri: image.uri }} style={styles.foregroundImage} resizeMode="cover" />
        </Pressable>
      </View>

      <View style={[styles.metaBlock, { left: cardSideInset, right: cardSideInset }]}>
        <AppText variant="caption" style={styles.dateLabel}>
          {meta.dateLabel}
        </AppText>
        <AppText variant="h3" style={styles.locationLabel}>
          {meta.location}
        </AppText>
        <AppText variant="bodySmall" style={styles.captionLabel}>
          {meta.caption}
        </AppText>
      </View>
    </View>
  );
}

type ProfileGalleryExhibitionProps = {
  layout: ExhibitionLayout;
  onImagePress: (image: ProfileGalleryImage) => void;
  onActiveImageChange?: (image: ProfileGalleryImage, index: number) => void;
};

export function ProfileGalleryExhibition({
  layout: exhibitionLayout,
  onImagePress,
  onActiveImageChange,
}: ProfileGalleryExhibitionProps) {
  const images = useProfileGalleryStore((state) => state.images);
  const [activeIndex, setActiveIndex] = useState(0);
  const [listWidth, setListWidth] = useState(0);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 51 }).current;

  useEffect(() => {
    const image = images[activeIndex];
    if (image) {
      onActiveImageChange?.(image, activeIndex);
    }
  }, [activeIndex, images, onActiveImageChange]);

  const handleListLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setListWidth((current) => (current === nextWidth ? current : nextWidth));
    }
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<ProfileGalleryImage>[] }) => {
      const nextIndex = viewableItems[0]?.index;
      if (nextIndex != null) {
        setActiveIndex(nextIndex);
      }
    },
    [],
  );

  if (images.length === 0) {
    return (
      <View style={styles.emptyState}>
        <AppText variant="body" style={styles.emptyText}>
          아직 전시할 사진이 없습니다.
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: exhibitionLayout.stageHeight }]}>
      <View
        style={[styles.listViewport, { height: exhibitionLayout.slideHeight }]}
        onLayout={handleListLayout}>
        {listWidth > 0 ? (
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            bounces={false}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            style={{ width: listWidth }}
            keyExtractor={(item) => item.id}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_, index) => ({
              length: listWidth,
              offset: listWidth * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <StorySlide
                image={item}
                index={index}
                slideWidth={listWidth}
                slideHeight={exhibitionLayout.slideHeight}
                cardHeight={exhibitionLayout.cardHeight}
                cardSideInset={exhibitionLayout.cardSideInset}
                onPress={onImagePress}
              />
            )}
          />
        ) : null}
      </View>

      <View style={styles.pagination}>
        {images.map((image, index) => (
          <View
            key={image.id}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'visible',
  },
  listViewport: {
    width: '100%',
  },
  slide: {
    justifyContent: 'center',
  },
  foregroundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.xs,
  },
  foregroundCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  foregroundImage: {
    width: '100%',
    height: '100%',
  },
  metaBlock: {
    position: 'absolute',
    bottom: spacing.md,
    gap: spacing.xs,
  },
  dateLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.3,
  },
  locationLabel: {
    color: colors.white,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  captionLabel: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 15,
    lineHeight: 21,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.white,
  },
  emptyState: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
