import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';

type DiveLedgerEmptyStateProps = {
  isImporting: boolean;
  onImportPress: () => void;
  onRecordPress: () => void;
};

export function DiveLedgerEmptyState({
  isImporting,
  onImportPress,
  onRecordPress,
}: DiveLedgerEmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="h3" style={styles.title}>
        아직 다이빙 기록이 없습니다
      </AppText>
      <AppText variant="bodySmall" style={styles.subtitle}>
        기록을 직접 추가하거나 기존 로그 파일을 가져와 로그북을 시작하세요.
      </AppText>

      <View style={styles.actions}>
        <AppButton label="첫 다이빙 기록" size="lg" fullWidth onPress={onRecordPress} />
        <Pressable
          accessibilityRole="button"
          disabled={isImporting}
          onPress={onImportPress}
          style={({ pressed }) => [styles.importLink, pressed && styles.importLinkPressed]}>
          {isImporting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <AppText variant="label" color="primary" style={styles.importLinkText}>
              파일에서 가져오기
            </AppText>
          )}
        </Pressable>
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
  importLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  importLinkPressed: {
    opacity: 0.7,
  },
  importLinkText: {
    fontSize: 15,
    lineHeight: 20,
  },
});
