import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';

type HomeInsetRowProps = {
  title: string;
  subtitle?: string;
  detail?: string;
  showDivider?: boolean;
  onPress?: () => void;
};

export function HomeInsetRow({
  title,
  subtitle,
  detail,
  showDivider = true,
  onPress,
}: HomeInsetRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}>
      <View style={styles.content}>
        <AppText variant="body" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {detail ? (
        <AppText variant="caption" style={styles.detail} numberOfLines={1}>
          {detail}
        </AppText>
      ) : null}

      {showDivider ? <View style={styles.divider} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    position: 'relative',
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  detail: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: '28%',
  },
  divider: {
    position: 'absolute',
    left: spacing.lg,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
  },
});
