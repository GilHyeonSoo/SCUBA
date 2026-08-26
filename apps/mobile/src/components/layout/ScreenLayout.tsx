import { useFocusEffect } from 'expo-router';
import { ReactNode, useCallback, useRef, useState } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollapsibleChromeHeader } from '@/src/components/layout/CollapsibleChromeHeader';
import { colors, layout, spacing } from '@/src/constants';
import { useChromeScrollHandler } from '@/src/hooks/useChromeScrollHandler';
import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

type ScreenLayoutProps = {
  header: ReactNode;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Extra space below the header. Use 0 on home for a tighter layout. */
  contentTopSpacing?: number;
  /** Tab bar is hidden on stack screens such as buddy. */
  withTabBarInset?: boolean;
};

const TAB_BAR_ESTIMATE = Platform.OS === 'ios' ? 88 : 72;

export function ScreenLayout({
  header,
  children,
  contentContainerStyle,
  contentTopSpacing = spacing.xs,
  withTabBarInset = true,
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

  const topInset = headerHeight > 0 ? headerHeight : insets.top + 52;
  const bottomInset = withTabBarInset
    ? TAB_BAR_ESTIMATE + insets.bottom
    : insets.bottom + spacing.lg;

  return (
    <View style={styles.container}>
      <CollapsibleChromeHeader headerHeight={headerHeight} onHeightChange={setHeaderHeight}>
        {header}
      </CollapsibleChromeHeader>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topInset + contentTopSpacing,
            paddingBottom: bottomInset + spacing.lg,
          },
          contentContainerStyle,
        ]}>
        {children}
      </Animated.ScrollView>
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
});
