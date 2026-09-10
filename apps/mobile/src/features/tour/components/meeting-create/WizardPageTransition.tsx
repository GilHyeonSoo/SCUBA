import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { spacing } from '@/src/constants';
import Animated, {
  Easing,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from 'react-native-reanimated';

type WizardTransitionDirection = 'forward' | 'back';

type WizardPageTransitionProps = {
  children: ReactNode;
  direction: WizardTransitionDirection;
};

const ENTER_FORWARD = SlideInRight.duration(300).easing(Easing.out(Easing.cubic));
const EXIT_FORWARD = SlideOutLeft.duration(240).easing(Easing.in(Easing.cubic));
const ENTER_BACK = SlideInLeft.duration(300).easing(Easing.out(Easing.cubic));
const EXIT_BACK = SlideOutRight.duration(240).easing(Easing.in(Easing.cubic));
export function WizardPageTransition({
  children,
  direction,
}: WizardPageTransitionProps) {
  const entering =
    direction === 'forward' ? ENTER_FORWARD : ENTER_BACK;
  const exiting =
    direction === 'forward' ? EXIT_FORWARD : EXIT_BACK;

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={styles.page}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    paddingTop: spacing['3xl'],
    overflow: 'visible',
  },
});
