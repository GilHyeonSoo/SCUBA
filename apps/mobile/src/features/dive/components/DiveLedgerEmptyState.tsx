import { StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { DiveAddSourceOptions } from '@/src/features/dive/components/DiveAddSourceOptions';
import { FadeInView } from '@/src/components/motion';

type DiveLedgerEmptyStateProps = {
  isImporting: boolean;
  optionsExpanded: boolean;
  onToggleOptions: () => void;
  onBluetoothPress: () => void;
  onImportPress: () => void;
};

export function DiveLedgerEmptyState({
  isImporting,
  optionsExpanded,
  onToggleOptions,
  onBluetoothPress,
  onImportPress,
}: DiveLedgerEmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="h3" style={styles.title}>
        아직 다이빙 기록이 없습니다
      </AppText>
      <AppText variant="bodySmall" style={styles.subtitle}>
        블루투스로 다이브 컴퓨터를 연동하거나 기존 로그 파일을 가져와 로그북을 시작하세요.
      </AppText>

      <View style={styles.actions}>
        <AppButton
          label="첫 다이빙 기록"
          size="lg"
          fullWidth
          onPress={onToggleOptions}
        />

        {optionsExpanded ? (
          <FadeInView index={0}>
            <DiveAddSourceOptions
              isImporting={isImporting}
              onBluetoothPress={onBluetoothPress}
              onImportPress={onImportPress}
            />
          </FadeInView>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    textAlign: 'center',
    fontSize: 19,
    lineHeight: 26,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
