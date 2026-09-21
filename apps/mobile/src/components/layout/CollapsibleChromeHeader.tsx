import { ReactNode, useEffect } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { animation, colors, shadows } from '@/src/constants';
import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

type CollapsibleChromeHeaderProps = {
  children: ReactNode;
  headerHeight: number;
  onHeightChange: (height: number) => void;
  showShadow?: boolean;
};

export function CollapsibleChromeHeader({
  children,
  headerHeight,
  onHeightChange,
  showShadow = true,
}: CollapsibleChromeHeaderProps) {
  const chromeVisible = useScrollChromeStore((s) => s.chromeVisible);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const hideOffset = headerHeight > 0 ? -headerHeight : -120;
    translateY.value = withTiming(chromeVisible ? 0 : hideOffset, {
      duration: animation.normal,
    });
    opacity.value = withTiming(chromeVisible ? 1 : 0, {
      duration: animation.fast,
    });
  }, [chromeVisible, headerHeight, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    onHeightChange(event.nativeEvent.layout.height);
  };

  return (
    <Animated.View
      onLayout={handleLayout}
      style={[
        styles.container,
        animatedStyle,
        showShadow ? styles.withShadow : styles.flat,
      ]}
      pointerEvents={chromeVisible ? 'auto' : 'none'}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: colors.background,
  },
  withShadow: {
    ...shadows.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  flat: {
    borderBottomWidth: 0,
  },
});
