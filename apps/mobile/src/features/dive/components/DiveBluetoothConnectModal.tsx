import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppButton, AppText } from '@/src/components/ui';
import { animation, colors, radius, spacing } from '@/src/constants';

const CONNECT_DURATION_MS = 2600;
const RING_SIZE = 72;
const RING_STROKE = 4;

type DiveBluetoothConnectModalProps = {
  visible: boolean;
  onClose: () => void;
  onConnected?: () => void;
};

type ConnectPhase = 'connecting' | 'success';

export function DiveBluetoothConnectModal({
  visible,
  onClose,
  onConnected,
}: DiveBluetoothConnectModalProps) {
  const [phase, setPhase] = useState<ConnectPhase>('connecting');
  const rotation = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setPhase('connecting');
    rotation.value = 0;
    checkScale.value = 0;

    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );

    const timer = setTimeout(() => {
      cancelAnimation(rotation);
      setPhase('success');
      checkScale.value = withSpring(1, animation.spring);
      onConnected?.();
    }, CONNECT_DURATION_MS);

    return () => {
      clearTimeout(timer);
      cancelAnimation(rotation);
    };
  }, [checkScale, rotation, visible]);

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconArea}>
            {phase === 'connecting' ? (
              <Animated.View style={[styles.ring, ringAnimatedStyle]} />
            ) : (
              <Animated.View style={[styles.successCircle, checkAnimatedStyle]}>
                <Ionicons name="checkmark" size={36} color={colors.textOnPrimary} />
              </Animated.View>
            )}
          </View>

          <AppText variant="h3" style={styles.title}>
            {phase === 'connecting' ? '블루투스 연동 중' : '연동 완료'}
          </AppText>
          <AppText variant="bodySmall" style={styles.subtitle}>
            {phase === 'connecting'
              ? '다이브 컴퓨터를 찾고 있습니다...'
              : '다이브 컴퓨터와 연결되었습니다.'}
          </AppText>

          {phase === 'success' ? (
            <AppButton label="확인" fullWidth onPress={onClose} style={styles.confirmButton} />
          ) : (
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelLink}>
              <AppText variant="label" color="primary">
                취소
              </AppText>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconArea: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderColor: 'transparent',
    borderTopColor: colors.primary,
    borderRightColor: colors.primary,
  },
  successCircle: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 19,
    lineHeight: 26,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  confirmButton: {
    marginTop: spacing.sm,
  },
  cancelLink: {
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
});
