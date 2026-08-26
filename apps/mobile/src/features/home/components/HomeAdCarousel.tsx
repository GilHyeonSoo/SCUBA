import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
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
import { colors, layout, radius, shadows, spacing } from '@/src/constants';
import type { HomeAdBanner } from '@/src/features/home/mock-data';

const AUTO_SLIDE_MS = 4500;

type HomeAdCarouselProps = {
  banners: HomeAdBanner[];
  style?: StyleProp<ViewStyle>;
};

export function HomeAdCarousel({ banners, style }: HomeAdCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth, layout.mobileWebMaxWidth);
  const slideWidth = contentWidth - layout.screenPaddingHorizontal * 2;

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
            style={{ width: slideWidth }}
            onPress={() => {
              // Placeholder until ad destinations are wired.
            }}>
            <LinearGradient
              colors={[...item.gradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.slide, shadows.md]}>
              {item.badge ? (
                <View style={styles.badge}>
                  <AppText variant="caption" style={styles.badgeText}>
                    {item.badge}
                  </AppText>
                </View>
              ) : null}
              <AppText variant="h3" style={styles.title}>
                {item.title}
              </AppText>
              <AppText variant="bodySmall" style={styles.subtitle}>
                {item.subtitle}
              </AppText>
              {item.cta ? (
                <View style={styles.ctaPill}>
                  <AppText variant="label" style={styles.ctaText}>
                    {item.cta}
                  </AppText>
                </View>
              ) : null}
            </LinearGradient>
          </Pressable>
        )}
      />

      {banners.length > 1 ? (
        <View style={styles.dots}>
          {banners.map((banner, index) => (
            <View
              key={banner.id}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  slide: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    minHeight: 148,
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  badgeText: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  title: {
    color: colors.textOnPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
  },
  ctaPill: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  ctaText: {
    color: colors.textOnPrimary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.divider,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
});
