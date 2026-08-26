import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { animation } from '@/src/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = PressableProps & {
  children: ReactNode;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
};

export function PressableScale({
  children,
  scaleTo = animation.pressScale,
  style,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) {
          scale.value = withSpring(scaleTo, animation.spring);
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, animation.spring);
        onPressOut?.(event);
      }}
      style={[animatedStyle, style]}
      {...props}>
      {children}
    </AnimatedPressable>
  );
}
