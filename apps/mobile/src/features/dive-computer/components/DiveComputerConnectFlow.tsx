import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBadge, AppButton, AppText } from '@/src/components/ui';
import { animation, colors, radius, spacing } from '@/src/constants';
import { DiveComputerBrandStep } from '@/src/features/dive-computer/components/DiveComputerBrandStep';
import { DiveComputerDeviceStep } from '@/src/features/dive-computer/components/DiveComputerDeviceStep';
import { DiveComputerSyncStep } from '@/src/features/dive-computer/components/DiveComputerSyncStep';
import { useDiveComputerConnect } from '@/src/features/dive-computer/hooks/useDiveComputerConnect';
import { mockDiveComputerService } from '@/src/features/dive-computer/services/mock-dive-computer.service';
import type { ConnectStep, MockDiveImportResult } from '@/src/features/dive-computer/types';
import { SUPPORTED_DIVE_BRANDS } from '@/src/features/dive-log/import/supported-brands';

const RING_SIZE = 76;
const RING_STROKE = 4;

const STEP_TITLES: Record<ConnectStep, string> = {
  brand: '브랜드 선택',
  device: '기기 선택',
  connecting: '기기 연결',
  sync: '로그 동기화',
};

type DiveComputerConnectFlowProps = {
  visible: boolean;
  onClose: () => void;
  onImportComplete?: (result: MockDiveImportResult) => void;
};

function ConnectingStep({
  deviceLabel,
  connectionComplete,
  errorMessage,
  onRetry,
  onCancel,
}: {
  deviceLabel: string;
  connectionComplete: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onCancel: () => void;
}) {
  const rotation = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    rotation.value = 0;
    checkScale.value = 0;
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, [checkScale, rotation]);

  useEffect(() => {
    if (!connectionComplete) {
      return;
    }

    cancelAnimation(rotation);
    checkScale.value = withSpring(1, animation.spring);
  }, [checkScale, connectionComplete, rotation]);

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const checkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: checkScale.value,
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <View style={styles.connectingContent}>
      <View style={styles.animationArea}>
        {connectionComplete ? (
          <Animated.View style={[styles.successCircle, checkAnimatedStyle]}>
            <Ionicons name="checkmark" size={38} color={colors.textOnPrimary} />
          </Animated.View>
        ) : (
          <Animated.View style={[styles.ring, ringAnimatedStyle]} />
        )}
      </View>

      <AppText variant="h2" style={styles.connectingTitle}>
        {connectionComplete ? '연결 완료' : '블루투스 연동 중'}
      </AppText>
      <AppText variant="bodySmall" style={styles.connectingSubtitle}>
        {connectionComplete
          ? `${deviceLabel}에서 로그를 확인하고 있습니다.`
          : `${deviceLabel}와 모의 연결을 진행하고 있습니다.`}
      </AppText>

      {errorMessage ? (
        <View style={styles.connectingError} accessibilityRole="alert">
          <AppText variant="bodySmall" style={styles.connectingErrorText}>
            {errorMessage}
          </AppText>
          <AppButton label="다시 시도" variant="secondary" onPress={onRetry} />
        </View>
      ) : null}

      {!connectionComplete ? (
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancelButton}>
          <AppText variant="label" color="primary">
            취소
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function DiveComputerConnectFlow({
  visible,
  onClose,
  onImportComplete,
}: DiveComputerConnectFlowProps) {
  const insets = useSafeAreaInsets();
  const connect = useDiveComputerConnect();
  const selectedBrand = SUPPORTED_DIVE_BRANDS.find(
    (brand) => brand.id === connect.selectedBrandId,
  );
  const devices = connect.selectedBrandId
    ? mockDiveComputerService.listDevices(connect.selectedBrandId)
    : [];

  useEffect(() => {
    if (visible) {
      connect.reset();
    }
  }, [visible, connect.reset]);

  const handleClose = () => {
    if (connect.isImporting) {
      return;
    }

    connect.reset();
    onClose();
  };

  const handleImport = async () => {
    const result = await connect.importSelectedDives();
    if (!result) {
      return;
    }

    onImportComplete?.(result);
    handleClose();
    Alert.alert(
      '동기화 완료',
      `${result.device.nickname}에서 ${result.summary.diveCount}개 다이빙 로그를 가져왔습니다.`,
    );
  };

  const canGoBack = connect.step !== 'brand' && connect.step !== 'connecting';
  const deviceLabel = connect.selectedDevice
    ? `${connect.selectedDevice.model} · ${connect.selectedDevice.serialSuffix}`
    : '다이브 컴퓨터';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerSide}>
            {canGoBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="이전 단계로 돌아가기"
                onPress={connect.goBack}
                style={styles.headerButton}>
                <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
              </Pressable>
            ) : null}
          </View>
          <View style={styles.headerCenter}>
            <AppText variant="h3" numberOfLines={1}>
              {STEP_TITLES[connect.step]}
            </AppText>
            <AppBadge label="시뮬레이션" tone="primary" />
          </View>
          <View style={[styles.headerSide, styles.headerRight]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="연동 흐름 닫기"
              disabled={connect.isImporting}
              onPress={handleClose}
              style={styles.headerButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.body, { paddingBottom: insets.bottom }]}>
          {connect.step === 'brand' ? (
            <DiveComputerBrandStep onSelectBrand={connect.selectBrand} />
          ) : null}

          {connect.step === 'device' ? (
            <DiveComputerDeviceStep
              brandName={selectedBrand?.name ?? '다이브 컴퓨터'}
              devices={devices}
              onSelectDevice={(device) => void connect.connectDevice(device)}
            />
          ) : null}

          {connect.step === 'connecting' && connect.selectedDevice ? (
            <ConnectingStep
              deviceLabel={deviceLabel}
              connectionComplete={connect.connectionComplete}
              errorMessage={connect.errorMessage}
              onRetry={() => {
                if (connect.selectedDevice) {
                  void connect.connectDevice(connect.selectedDevice);
                }
              }}
              onCancel={connect.goBack}
            />
          ) : null}

          {connect.step === 'sync' && connect.selectedDevice ? (
            <DiveComputerSyncStep
              device={connect.selectedDevice}
              dives={connect.pendingDives}
              selectedDiveIds={connect.selectedDiveIds}
              isImporting={connect.isImporting}
              errorMessage={connect.errorMessage}
              onToggleDive={connect.toggleDive}
              onToggleAll={connect.toggleAllDives}
              onImport={() => void handleImport()}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingHorizontal: spacing.sm,
  },
  headerSide: {
    width: 52,
    alignItems: 'flex-start',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  body: {
    flex: 1,
  },
  connectingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  animationArea: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RING_SIZE / 2,
    backgroundColor: colors.primary,
  },
  connectingTitle: {
    textAlign: 'center',
  },
  connectingSubtitle: {
    maxWidth: 300,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  connectingError: {
    width: '100%',
    gap: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.errorSoft,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  connectingErrorText: {
    color: colors.error,
    textAlign: 'center',
  },
  cancelButton: {
    minWidth: 88,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
