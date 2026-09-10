import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { meetingCreateCategoryOptions } from '@/src/features/tour/components/meeting-create/meeting-create-steps';
import type { MeetingCategory } from '@/src/features/tour/types';

const REVEAL_DURATION_MS = 340;
const OPTION_STAGGER_MS = 220;
const TITLE_DELAY_MS = 80;
const OPTION_START_DELAY_MS = 420;
const CATEGORY_TITLE = '어떤 목적이실까요?';

type MeetingCreateCategoryPhaseProps = {
  onSelect: (category: MeetingCategory) => void;
};

type RevealProps = {
  visible: boolean;
  children: ReactNode;
  style?: object;
};

function Reveal({ visible, children, style }: RevealProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    if (!visible) {
      return;
    }

    opacity.value = withTiming(1, {
      duration: REVEAL_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(0, {
      duration: REVEAL_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [opacity, translateY, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) {
    return null;
  }

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

export function MeetingCreateCategoryPhase({ onSelect }: MeetingCreateCategoryPhaseProps) {
  const [showTitle, setShowTitle] = useState(false);
  const [visibleOptionCount, setVisibleOptionCount] = useState(0);

  useEffect(() => {
    const titleTimer = setTimeout(() => setShowTitle(true), TITLE_DELAY_MS);
    const optionTimers = meetingCreateCategoryOptions.map((_, index) =>
      setTimeout(
        () => setVisibleOptionCount((count) => Math.max(count, index + 1)),
        OPTION_START_DELAY_MS + index * OPTION_STAGGER_MS,
      ),
    );

    return () => {
      clearTimeout(titleTimer);
      optionTimers.forEach(clearTimeout);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Reveal visible={showTitle} style={styles.titleWrap}>
        <AppText variant="h2" style={styles.title}>{CATEGORY_TITLE}</AppText>
      </Reveal>
      {!showTitle ? <View style={styles.titlePlaceholder} /> : null}

      <View style={styles.options}>
        {meetingCreateCategoryOptions.map((option, index) => (
          <Reveal key={option.value} visible={visibleOptionCount > index} style={styles.optionWrap}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelect(option.value)}
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
              <AppText variant="label" style={styles.optionLabel}>
                {option.label}
              </AppText>
            </Pressable>
          </Reveal>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing['2xl'],
    paddingTop: spacing['3xl'],
  },
  titleWrap: {
    width: '100%',
  },
  titlePlaceholder: {
    height: 32,
  },
  title: {
    lineHeight: 32,
  },
  options: {
    gap: spacing.md,
    width: '100%',
  },
  optionWrap: {
    width: '100%',
  },
  option: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionPressed: {
    opacity: 0.86,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
