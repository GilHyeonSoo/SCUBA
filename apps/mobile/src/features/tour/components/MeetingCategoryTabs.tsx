import { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '@/src/components/ui';
import { animation, colors, radius, spacing } from '@/src/constants';
import { meetingCategoryTabs } from '@/src/features/tour/constants';
import type { MeetingCategory } from '@/src/features/tour/types';

type TabLayout = {
  x: number;
  width: number;
};

type MeetingCategoryTabsProps = {
  value: MeetingCategory;
  onChange: (category: MeetingCategory) => void;
};

export function MeetingCategoryTabs({ value, onChange }: MeetingCategoryTabsProps) {
  const [tabLayouts, setTabLayouts] = useState<Partial<Record<MeetingCategory, TabLayout>>>({});
  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);

  const movePill = useCallback(
    (layout: TabLayout) => {
      pillX.value = withSpring(layout.x, animation.spring);
      pillWidth.value = withSpring(layout.width, animation.spring);
    },
    [pillWidth, pillX],
  );

  useEffect(() => {
    const layout = tabLayouts[value];
    if (layout) {
      movePill(layout);
    }
  }, [movePill, tabLayouts, value]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillWidth.value,
    opacity: pillWidth.value > 0 ? 1 : 0,
  }));

  const handleTabLayout = useCallback(
    (category: MeetingCategory) => (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      setTabLayouts((previous) => ({ ...previous, [category]: { x, width } }));

      if (category === value) {
        movePill({ x, width });
      }
    },
    [movePill, value],
  );

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View pointerEvents="none" style={[styles.pill, pillStyle]} />
        {meetingCategoryTabs.map((tab) => {
          const selected = tab.value === value;

          return (
            <Pressable
              key={tab.value}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onLayout={handleTabLayout(tab.value)}
              onPress={() => onChange(tab.value)}
              style={styles.tab}>
              <AppText
                variant="label"
                numberOfLines={1}
                style={[styles.label, selected && styles.labelSelected]}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
    minHeight: 48,
  },
  pill: {
    position: 'absolute',
    top: spacing.xs,
    bottom: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    zIndex: 1,
  },
  label: {
    color: colors.textTertiary,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.primaryStrong,
    fontWeight: '600',
  },
});
