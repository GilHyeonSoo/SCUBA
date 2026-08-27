import { ReactNode, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { animation, spacing } from '@/src/constants';
import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

type MapChromeOverlayProps = {
  children: ReactNode;
  headerHeight: number;
};

export function MapChromeOverlay({ children, headerHeight }: MapChromeOverlayProps) {
  const chromeVisible = useScrollChromeStore((s) => s.chromeVisible);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const hideOffset = headerHeight > 0 ? -(headerHeight + spacing.sm) : -100;
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

  return (
    <Animated.View
      pointerEvents={chromeVisible ? 'box-none' : 'none'}
      style={[
        styles.container,
        { top: headerHeight > 0 ? headerHeight + spacing.sm : spacing.sm },
        animatedStyle,
      ]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
  },
});
