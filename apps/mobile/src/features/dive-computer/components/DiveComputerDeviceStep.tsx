import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import type { MockDiveComputerDevice } from '@/src/features/dive-computer/types';

type DiveComputerDeviceStepProps = {
  brandName: string;
  devices: MockDiveComputerDevice[];
  onSelectDevice: (device: MockDiveComputerDevice) => void;
};

export function DiveComputerDeviceStep({
  brandName,
  devices,
  onSelectDevice,
}: DiveComputerDeviceStepProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.scanStatus}>
        <View style={styles.scanIcon}>
          <Ionicons name="bluetooth" size={22} color={colors.primary} />
        </View>
        <View style={styles.scanText}>
          <AppText variant="h3">{brandName} 기기 검색 완료</AppText>
          <AppText variant="bodySmall" style={styles.scanDescription}>
            주변에서 발견한 모의 BLE 기기입니다.
          </AppText>
        </View>
      </View>

      <View style={styles.list}>
        {devices.map((device) => (
          <Pressable
            key={device.id}
            accessibilityRole="button"
            accessibilityLabel={`${device.model} ${device.serialSuffix} 연결`}
            onPress={() => onSelectDevice(device)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
            <View style={styles.deviceIcon}>
              <Ionicons name="hardware-chip-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.rowText}>
              <AppText variant="h3">{device.model}</AppText>
              <AppText variant="bodySmall" style={styles.bleName}>
                {device.model} · {device.serialSuffix}
              </AppText>
              <AppText variant="caption" style={styles.signal}>
                신호 양호 · BLE
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>

      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
        <AppText variant="caption" style={styles.noticeText}>
          실제 블루투스 스캔이나 기기 연결은 발생하지 않습니다.
        </AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.xl,
  },
  scanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scanIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
  },
  scanText: {
    flex: 1,
    gap: 2,
  },
  scanDescription: {
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  rowPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  bleName: {
    color: colors.textSecondary,
  },
  signal: {
    color: colors.success,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
    color: colors.textSecondary,
  },
});
