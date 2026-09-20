import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/ui/AppText';
import { animation, colors, getTabBarChromeHeight, layout, shadows, spacing } from '@/src/constants';
import { useScrollChromeStore } from '@/src/stores/scroll-chrome-store';

export const COLLAPSIBLE_ACTION_FAB_SIZE = 52;

const FAB_ICON_SIZE = 24;
const FAB_PADDING_H = 14;
const FAB_LABEL_GAP = 5;
const FAB_BACKGROUND = 'rgba(83, 131, 230, 0.82)';
const FAB_BORDER = 'rgba(255, 255, 255, 0.38)';

type CollapsibleActionFabProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  labelWidth?: number;
};

export function CollapsibleActionFab({
  label,
  accessibilityLabel,
  onPress,
  labelWidth = 58,
}: CollapsibleActionFabProps) {
  const insets = useSafeAreaInsets();
  const chromeVisible = useScrollChromeStore((s) => s.chromeVisible);
  const collapseProgress = useSharedValue(chromeVisible ? 0 : 1);

  const bottom = getTabBarChromeHeight(insets.bottom) + spacing.md;
  const expandedWidth = FAB_PADDING_H * 2 + FAB_ICON_SIZE + FAB_LABEL_GAP + labelWidth;

  useEffect(() => {
    collapseProgress.value = withTiming(chromeVisible ? 0 : 1, {
      duration: animation.normal,
    });
  }, [chromeVisible, collapseProgress]);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      collapseProgress.value,
      [0, 1],
      [expandedWidth, COLLAPSIBLE_ACTION_FAB_SIZE],
      Extrapolation.CLAMP,
    );
    const horizontalPadding = interpolate(
      collapseProgress.value,
      [0, 1],
      [FAB_PADDING_H, (COLLAPSIBLE_ACTION_FAB_SIZE - FAB_ICON_SIZE) / 2],
      Extrapolation.CLAMP,
    );

    return {
      width,
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 0.45], [1, 0], Extrapolation.CLAMP),
    width: interpolate(collapseProgress.value, [0, 1], [labelWidth, 0], Extrapolation.CLAMP),
    marginLeft: interpolate(collapseProgress.value, [0, 1], [FAB_LABEL_GAP, 0], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[styles.container, { bottom }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.buttonPressed]}>
        <Animated.View style={[styles.button, buttonAnimatedStyle, shadows.md]}>
          <Ionicons name="add" size={FAB_ICON_SIZE} color={colors.textOnPrimary} />
          <Animated.View style={[styles.labelWrap, labelAnimatedStyle]}>
            <AppText variant="label" style={styles.label} numberOfLines={1}>
              {label}
            </AppText>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: layout.screenPaddingHorizontal,
    zIndex: 40,
  },
  button: {
    height: COLLAPSIBLE_ACTION_FAB_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: COLLAPSIBLE_ACTION_FAB_SIZE / 2,
    backgroundColor: FAB_BACKGROUND,
    borderWidth: 1,
    borderColor: FAB_BORDER,
    overflow: 'hidden',
  },
  labelWrap: {
    overflow: 'hidden',
  },
  label: {
    color: colors.textOnPrimary,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
