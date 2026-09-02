import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import type { ProfileLevelBadge } from '@/src/features/profile/utils';

type DiverLevelBadgeProps = {
  badge: ProfileLevelBadge;
};

const toneStyles = {
  default: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    textColor: colors.textSecondary,
  },
  primary: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryMuted,
    textColor: colors.primary,
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: colors.success,
    textColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    textColor: colors.warning,
  },
} as const;

export function DiverLevelBadge({ badge }: DiverLevelBadgeProps) {
  const tone = toneStyles[badge.tone];

  return (
    <View
      accessibilityLabel={`다이버 레벨 ${badge.label}`}
      style={[styles.badge, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }]}>
      <AppText variant="caption" style={[styles.label, { color: tone.textColor }]}>
        {badge.shortLabel}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.4,
    fontSize: 11,
    lineHeight: 14,
  },
});
