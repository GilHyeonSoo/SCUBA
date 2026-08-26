import { ReactNode } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { animation } from '@/src/constants';

type FadeInViewProps = {
  children: ReactNode;
  index?: number;
  delay?: number;
  direction?: 'up' | 'down';
  style?: object;
};

export function FadeInView({
  children,
  index = 0,
  delay = 0,
  direction = 'up',
  style,
}: FadeInViewProps) {
  const offset = delay + index * animation.stagger;
  const entering =
    direction === 'up'
      ? FadeInUp.delay(offset).duration(animation.slow).springify().damping(20)
      : FadeInDown.delay(offset).duration(animation.slow).springify().damping(20);

  return <Animated.View entering={entering} style={style}>{children}</Animated.View>;
}
