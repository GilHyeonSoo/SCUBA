import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  ImageBackground,
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
const SLIDE_HEIGHT = 184;

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
            accessibilityLabel={`${item.sponsor} 광고, ${item.title}`}
            style={{ width: slideWidth }}
            onPress={() => {
              // Placeholder until ad destinations are wired.
            }}>
            <ImageBackground
              source={{ uri: item.imageUri }}
              style={[styles.slide, shadows.md]}
              imageStyle={styles.slideImage}
              resizeMode="cover"
              accessibilityIgnoresInvertColors>
              <LinearGradient
                colors={[...item.gradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.45)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.55 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={['transparent', 'rgba(4,18,36,0.92)']}
                locations={[0.35, 1]}
                style={StyleSheet.absoluteFill}
              />

              <View style={styles.topRow}>
                <View style={styles.adLabel}>
                  <AppText variant="caption" style={styles.adLabelText}>
                    광고
                  </AppText>
                </View>
                <AppText variant="caption" style={styles.sponsorText} numberOfLines={1}>
                  {item.sponsor}
                </AppText>
              </View>

              <View style={styles.content}>
                {item.badge ? (
                  <View style={styles.badge}>
                    <AppText variant="caption" style={styles.badgeText}>
                      {item.badge}
                    </AppText>
                  </View>
                ) : null}
                <AppText variant="h3" style={styles.title} numberOfLines={2}>
                  {item.title}
                </AppText>
                <AppText variant="bodySmall" style={styles.subtitle} numberOfLines={2}>
                  {item.subtitle}
                </AppText>
                {item.cta ? (
                  <View style={styles.ctaPill}>
                    <AppText variant="label" style={styles.ctaText}>
                      {item.cta}
                    </AppText>
                  </View>
                ) : null}
              </View>
            </ImageBackground>
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
    overflow: 'hidden',
    height: SLIDE_HEIGHT,
    justifyContent: 'space-between',
  },
  slideImage: {
    borderRadius: radius.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
    zIndex: 1,
  },
  adLabel: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  adLabelText: {
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  sponsorText: {
    flex: 1,
    textAlign: 'right',
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
    zIndex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
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
    marginTop: spacing.sm,
    backgroundColor: colors.textOnPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  ctaText: {
    color: colors.primaryStrong,
    fontWeight: '700',
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
