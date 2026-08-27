import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/src/constants';
import { AppText } from './AppText';

type SectionHeaderProps = {
  /** 영문 메인 타이틀 */
  title: string;
  /** 한글 서브 타이틀 */
  subtitle?: string;
  action?: string;
  onActionPress?: () => void;
  compact?: boolean;
};

export function SectionHeader({
  title,
  subtitle,
  action,
  onActionPress,
  compact = false,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <AppText variant="h2" style={styles.mainTitle}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}
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
    marginTop: spacing.xl + spacing.xs,
    marginBottom: spacing.lg,
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
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mainTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.35,
    lineHeight: 22,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
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
