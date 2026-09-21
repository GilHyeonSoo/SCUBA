import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';

type DiveAddSourceOptionsProps = {
  isImporting?: boolean;
  onBluetoothPress: () => void;
  onImportPress: () => void;
};

export function DiveAddSourceOptions({
  isImporting = false,
  onBluetoothPress,
  onImportPress,
}: DiveAddSourceOptionsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="블루투스 연동"
        onPress={onBluetoothPress}
        style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
        <Ionicons name="bluetooth" size={20} color={colors.primary} />
        <AppText variant="label" style={styles.optionLabel}>
          블루투스 연동
        </AppText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="파일에서 가져오기"
        disabled={isImporting}
        onPress={onImportPress}
        style={({ pressed }) => [
          styles.option,
          pressed && !isImporting && styles.optionPressed,
          isImporting && styles.optionDisabled,
        ]}>
        {isImporting ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="document-outline" size={20} color={colors.primary} />
        )}
        <AppText variant="label" style={styles.optionLabel}>
          파일에서 가져오기
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.sm,
  },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionPressed: {
    opacity: 0.88,
  },
  optionDisabled: {
    opacity: 0.7,
  },
  optionLabel: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
});
