import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/src/constants';
import { AppText } from './AppText';

type SectionHeaderProps = {
  title: string;
  /** Editorial 스타일 상단 라벨 (선택) */
  eyebrow?: string;
  action?: string;
  onActionPress?: () => void;
  compact?: boolean;
};

export function SectionHeader({
  title,
  eyebrow,
  action,
  onActionPress,
  compact = false,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          {eyebrow ? (
            <AppText variant="caption" style={styles.eyebrow}>
              {eyebrow}
            </AppText>
          ) : null}
          <AppText variant="h2" style={styles.title}>
            {title}
          </AppText>
        </View>

        {action ? (
          <Pressable
            accessibilityRole="button"
            onPress={onActionPress}
            hitSlop={8}
            style={styles.action}>
            <AppText variant="label" color="primary" style={styles.actionLabel}>
              {action}
            </AppText>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  compact: {
    marginTop: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
  },
  actionLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
});
