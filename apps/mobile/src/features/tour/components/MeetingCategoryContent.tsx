import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

import { animation } from '@/src/constants';
import type { MeetingCategory } from '@/src/features/tour/types';

type MeetingCategoryContentProps = {
  category: MeetingCategory;
  children: ReactNode;
};

export function MeetingCategoryContent({ category, children }: MeetingCategoryContentProps) {
  return (
    <Animated.View
      key={category}
      entering={FadeInUp.duration(animation.normal).springify().damping(20)}
      exiting={FadeOut.duration(animation.fast)}
      style={styles.content}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
});
