import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
  ViewToken,
} from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, layout, spacing } from '@/src/constants';
import type { HomeAdBanner } from '@/src/features/home/mock-data';

const AUTO_SLIDE_MS = 4500;
const SEGMENT_TRACK_WIDTH = 40;
const SEGMENT_HEIGHT = 4;

type HomeAdCarouselProps = {
  banners: HomeAdBanner[];
  style?: StyleProp<ViewStyle>;
  edgeToEdge?: boolean;
};

export function HomeAdCarousel({ banners, style, edgeToEdge = false }: HomeAdCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth, layout.mobileWebMaxWidth);
  const slideWidth = edgeToEdge ? contentWidth : contentWidth - layout.screenPaddingHorizontal * 2;

  const listRef = useRef<FlatList<HomeAdBanner>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const isUserInteractingRef = useRef(false);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (banners.length === 0) {
        return;
      }

      const nextIndex = ((index % banners.length) + banners.length) % banners.length;
      listRef.current?.scrollToOffset({ offset: nextIndex * slideWidth, animated: true });
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    },
    [banners.length, slideWidth],
  );

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      if (isUserInteractingRef.current) {
        return;
      }
      scrollToIndex(activeIndexRef.current + 1);
    }, AUTO_SLIDE_MS);

    return () => clearInterval(timer);
  }, [banners.length, scrollToIndex]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const nextIndex = viewableItems[0]?.index;
      if (typeof nextIndex === 'number') {
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      }
    },
  ).current;

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    isUserInteractingRef.current = false;
  };

  if (banners.length === 0) {
    return null;
  }

  const segmentWidth = banners.length > 0 ? SEGMENT_TRACK_WIDTH / banners.length : 0;

  return (
    <View style={[styles.container, style]}>
      <FlatList
        ref={listRef}
        data={banners}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        snapToInterval={slideWidth}
        decelerationRate="fast"
        bounces={false}
        onScrollBeginDrag={() => {
          isUserInteractingRef.current = true;
        }}
        onMomentumScrollEnd={handleMomentumEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        getItemLayout={(_, index) => ({
          length: slideWidth,
          offset: slideWidth * index,
          index,
        })}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.sponsor} 광고, ${item.title}`}
            style={{ width: slideWidth }}
            onPress={() => {
              // Placeholder until ad destinations are wired.
            }}>
            <View style={styles.slide}>
              <Image
                source={{ uri: item.imageUri }}
                style={styles.image}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />

              <View style={styles.adLabel}>
                <AppText variant="caption" style={styles.adLabelText}>
                  광고
                </AppText>
              </View>

              <View style={styles.overlay}>
                <View style={styles.overlayContent}>
                  {item.badge ? (
                    <AppText variant="caption" style={styles.badge}>
                      {item.badge}
                    </AppText>
                  ) : null}
                  <AppText variant="h3" style={styles.title} numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText variant="bodySmall" style={styles.subtitle} numberOfLines={1}>
                    {item.subtitle}
                  </AppText>
                  <View style={styles.overlayFooter}>
                    <AppText variant="caption" style={styles.sponsor} numberOfLines={1}>
                      {item.sponsor}
                    </AppText>
                    {item.cta ? (
                      <AppText variant="label" style={styles.cta}>
                        {item.cta}
                      </AppText>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />

      {banners.length > 1 ? (
        <View style={styles.segmentWrap}>
          <View style={styles.segmentTrack}>
            <View
              style={[
                styles.segmentFill,
                {
                  width: segmentWidth,
                  transform: [{ translateX: activeIndex * segmentWidth }],
                },
              ]}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  slide: {
    width: '100%',
    aspectRatio: 1.618,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  adLabel: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(16, 24, 40, 0.72)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 2,
  },
  adLabelText: {
    color: colors.white,
    letterSpacing: 0.4,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: 96,
    backgroundColor: 'rgba(4, 18, 36, 0.72)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  overlayContent: {
    gap: 0,
  },
  badge: {
    color: 'rgba(255, 255, 255, 0.88)',
  },
  title: {
    color: colors.textOnPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  overlayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  sponsor: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.72)',
  },
  cta: {
    color: colors.textOnPrimary,
  },
  segmentWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.sm,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  segmentTrack: {
    width: SEGMENT_TRACK_WIDTH,
    height: SEGMENT_HEIGHT,
    borderRadius: SEGMENT_HEIGHT / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
  },
  segmentFill: {
    height: SEGMENT_HEIGHT,
    borderRadius: SEGMENT_HEIGHT / 2,
    backgroundColor: colors.white,
  },
});
