import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '@/src/components/ui';
import { colors } from '@/src/constants';

type MeetingDetailParticipantsProps = {
  current: number;
  max: number;
  variant?: 'section' | 'hostHeader';
  style?: ViewStyle;
};

export function MeetingDetailParticipants({
  current,
  max,
  variant = 'section',
  style,
}: MeetingDetailParticipantsProps) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withDelay(
      200,
      withSequence(
        withSpring(-10, { damping: 6, stiffness: 380 }),
        withSpring(0, { damping: 10, stiffness: 320 }),
      ),
    );
  }, [bounce, current]);

  const currentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  const countRow = (
    <View style={styles.countRow}>
      <Animated.Text style={[styles.current, currentStyle]}>{current}</Animated.Text>
      <AppText variant="h1" style={styles.slashMax}>
        /{max}
      </AppText>
    </View>
  );

  if (variant === 'hostHeader') {
    return <View style={[styles.hostHeader, style]}>{countRow}</View>;
  }

  return (
    <View style={[styles.section, style]}>
      <AppText variant="caption" color="textTertiary" style={styles.label}>
        참여 인원
      </AppText>
      {countRow}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  label: {
    textAlign: 'center',
  },
  hostHeader: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  current: {
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 44,
    color: colors.primary,
    letterSpacing: -1,
  },
  slashMax: {
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 4,
  },
});
