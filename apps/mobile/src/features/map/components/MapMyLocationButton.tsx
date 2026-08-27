import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

import { animation, colors, radius, shadows, spacing } from '@/src/constants';
import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

type MapMyLocationButtonProps = {
  onPress: () => void;
  bottom: number;
  /** 버디 화면 — 크롬 숨김에 따라 위치 애니메이션 */
  bottomWhenChromeVisible?: number;
  bottomWhenChromeHidden?: number;
};

export function MapMyLocationButton({
  onPress,
  bottom,
  bottomWhenChromeVisible,
  bottomWhenChromeHidden,
}: MapMyLocationButtonProps) {
  const chromeVisible = useScrollChromeStore((s) => s.chromeVisible);
  const animatedBottom = useSharedValue(bottom);

  const usesChromeAnimation =
    bottomWhenChromeVisible !== undefined && bottomWhenChromeHidden !== undefined;

  useEffect(() => {
    if (!usesChromeAnimation) {
      animatedBottom.value = withTiming(bottom, { duration: animation.normal });
      return;
    }

    animatedBottom.value = withTiming(
      chromeVisible ? bottomWhenChromeVisible : bottomWhenChromeHidden,
      { duration: animation.normal },
    );
  }, [
    animatedBottom,
    bottom,
    bottomWhenChromeHidden,
    bottomWhenChromeVisible,
    chromeVisible,
    usesChromeAnimation,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    bottom: animatedBottom.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="내 위치"
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, shadows.md]}>
        <Ionicons name="locate" size={22} color={colors.primary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 18,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
});
