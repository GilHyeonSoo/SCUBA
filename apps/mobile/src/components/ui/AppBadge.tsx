import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants';
import { AppText } from './AppText';

type BadgeTone = 'default' | 'success' | 'warning' | 'error' | 'primary' | 'onDark';

type AppBadgeProps = {
  label: string;
  tone?: BadgeTone;
};

const toneStyles: Record<BadgeTone, { bg: string; text: string }> = {
  default: { bg: colors.surface, text: colors.textSecondary },
  success: { bg: colors.successSoft, text: colors.success },
  warning: { bg: colors.warningSoft, text: colors.warning },
  error: { bg: colors.errorSoft, text: colors.error },
  primary: { bg: colors.primarySoft, text: colors.primary },
  onDark: { bg: 'rgba(255,255,255,0.16)', text: colors.textOnPrimary },
};

export function AppBadge({ label, tone = 'default' }: AppBadgeProps) {
  const toneStyle = toneStyles[tone];

  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.bg }]}>
      <AppText variant="caption" style={[styles.text, { color: toneStyle.text }]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
