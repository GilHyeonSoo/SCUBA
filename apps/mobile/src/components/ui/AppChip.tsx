import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { animation, colors, radius, spacing } from '@/src/constants';
import { AppText } from './AppText';

type AppChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AppChip({ label, selected = false, onPress }: AppChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.96, animation.spring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, animation.spring);
      }}
      style={[
        animatedStyle,
        styles.chip,
        selected && styles.chipSelected,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <AppText
        variant="label"
        style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </AppText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.white,
  },
});
