import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText } from '@/src/components/ui';
import { colors, getTabBarChromeHeight, radius, shadows, spacing } from '@/src/constants';

const BAR_HEIGHT = 64;

type DiveActionBarProps = {
  isImporting: boolean;
  onRecordPress: () => void;
  onImportPress: () => void;
  onSyncPress: () => void;
};

export function DiveActionBar({
  isImporting,
  onRecordPress,
  onImportPress,
  onSyncPress,
}: DiveActionBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = getTabBarChromeHeight(insets.bottom) + spacing.sm;

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: bottomOffset }]}>
      <View style={[styles.bar, shadows.lg]}>
        <AppButton label="다이빙 기록" size="lg" onPress={onRecordPress} style={styles.primaryButton} />
        <View style={styles.secondaryActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="로그 파일 가져오기"
            disabled={isImporting}
            onPress={onImportPress}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}>
            {isImporting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="download-outline" size={18} color={colors.primary} />
                <AppText variant="caption" style={styles.secondaryLabel}>
                  가져오기
                </AppText>
              </>
            )}
          </Pressable>
          <View style={styles.secondaryDivider} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="다이빙 컴퓨터 동기화"
            accessibilityState={{ disabled: true }}
            disabled
            onPress={onSyncPress}
            style={[styles.secondaryButton, styles.secondaryDisabled]}>
            <Ionicons name="watch-outline" size={18} color={colors.textTertiary} />
            <AppText variant="caption" style={styles.secondaryLabelDisabled}>
              동기화
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export const DIVE_ACTION_BAR_CHROME_HEIGHT = BAR_HEIGHT + spacing.lg;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
  bar: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  secondaryPressed: {
    opacity: 0.7,
  },
  secondaryDisabled: {
    opacity: 0.55,
  },
  secondaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.divider,
  },
  secondaryLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
  secondaryLabelDisabled: {
    color: colors.textTertiary,
    fontWeight: '600',
  },
});
