import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';

type HomeFeedSectionProps = {
  title: string;
  rightLabel?: string;
  children: ReactNode;
  showTopBorder?: boolean;
};

export function HomeFeedSection({
  title,
  rightLabel,
  children,
  showTopBorder = true,
}: HomeFeedSectionProps) {
  return (
    <View style={[styles.section, showTopBorder && styles.sectionBorder]}>
      <View style={styles.titleRow}>
        <AppText variant="h3" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
        {rightLabel ? (
          <AppText variant="label" style={styles.rightLabel} numberOfLines={1}>
            {rightLabel}
          </AppText>
        ) : null}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.background,
  },
  sectionBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    flex: 1,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  rightLabel: {
    flexShrink: 1,
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'right',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
