import { useFocusEffect } from 'expo-router';
import { ReactNode, useCallback, useRef, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollapsibleChromeHeader } from '@/src/components/layout/CollapsibleChromeHeader';
import { colors, getTabBarChromeHeight, layout, spacing } from '@/src/constants';
import { useChromeScrollHandler } from '@/src/hooks/useChromeScrollHandler';
import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

type ScreenLayoutProps = {
  header?: ReactNode;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Extra space below the header. Use 0 on home for a tighter layout. */
  contentTopSpacing?: number;
  /** Tab bar is hidden on explore tab only. */
  withTabBarInset?: boolean;
  /** Disable outer scroll when the screen manages its own scroll container. */
  scrollable?: boolean;
  /** When scrollable, allow toggling scroll without swapping the container. */
  scrollEnabled?: boolean;
  /** Show drop shadow under the collapsible header. */
  headerShadow?: boolean;
};

export function ScreenLayout({
  header,
  children,
  contentContainerStyle,
  contentTopSpacing = spacing.xs,
  withTabBarInset = true,
  scrollable = true,
  scrollEnabled = true,
  headerShadow = true,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const resetChrome = useScrollChromeStore((s) => s.resetChrome);
  const scrollHandler = useChromeScrollHandler();

  useFocusEffect(
    useCallback(() => {
      resetChrome();
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [resetChrome]),
  );

  const topInset = header
    ? headerHeight > 0
      ? headerHeight
      : insets.top + 52
    : insets.top + spacing.lg;
  const bottomInset = withTabBarInset
    ? getTabBarChromeHeight(insets.bottom)
    : insets.bottom + spacing.lg;

  const contentStyle = [
    scrollable ? styles.content : styles.flexContent,
    {
      paddingTop: topInset + contentTopSpacing,
      paddingBottom: bottomInset + spacing.lg,
    },
    contentContainerStyle,
  ];

  return (
    <View style={styles.container}>
      {header ? (
        <CollapsibleChromeHeader
          headerHeight={headerHeight}
          onHeightChange={setHeaderHeight}
          showShadow={headerShadow}>
          {header}
        </CollapsibleChromeHeader>
      ) : null}
      {scrollable ? (
        <Animated.ScrollView
          ref={scrollRef}
          onScroll={scrollHandler}
          scrollEnabled={scrollEnabled}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={contentStyle}>
          {children}
        </Animated.ScrollView>
      ) : (
        <View style={contentStyle}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  flexContent: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
});
