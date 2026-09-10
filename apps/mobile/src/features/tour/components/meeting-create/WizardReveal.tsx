import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';

type WizardRevealProps = {
  children: ReactNode;
  delay?: number;
  variant?: 'field' | 'soft';
};

const FIELD_ENTERING = FadeIn.duration(340).easing(Easing.out(Easing.cubic));
const SOFT_ENTERING = FadeIn.duration(280).easing(Easing.out(Easing.cubic));

export function WizardReveal({ children, delay = 0, variant = 'field' }: WizardRevealProps) {
  const entering = (variant === 'field' ? FIELD_ENTERING : SOFT_ENTERING).delay(delay);

  return (
    <Animated.View entering={entering} style={styles.wrap}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
});
