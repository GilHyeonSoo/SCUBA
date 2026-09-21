import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';

type HomeNextExpeditionCardProps = {
  title: string;
  location: string;
  date: string;
  time: string;
  depthLabel: string;
  gasLabel: string;
  ctaLabel?: string;
  onPress?: () => void;
  onCtaPress?: () => void;
};

export function HomeNextExpeditionCard({
  title,
  location,
  date,
  time,
  depthLabel,
  gasLabel,
  ctaLabel = '프리다이브 체크리스트 보기',
  onPress,
  onCtaPress,
}: HomeNextExpeditionCardProps) {
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => [styles.body, pressed && onPress && styles.bodyPressed]}>
        <View style={styles.splitRow}>
          <View style={styles.spotColumn}>
            <AppText variant="h3" style={styles.spotTitle} numberOfLines={2}>
              {title}
            </AppText>
            <AppText variant="bodySmall" style={styles.spotMeta} numberOfLines={1}>
              {location}
            </AppText>
            <AppText variant="bodySmall" style={styles.spotSchedule} numberOfLines={1}>
              {`${date} · ${time}`}
            </AppText>
          </View>

          <View style={styles.metricsColumn}>
            <View style={styles.metricBlock}>
              <AppText variant="caption" style={styles.metricLabel}>
                DEPTH
              </AppText>
              <View style={styles.metricValueRow}>
                <AppText variant="numeric" style={styles.metricValue}>
                  {depthLabel.replace(/m$/i, '')}
                </AppText>
                <AppText variant="label" style={styles.metricUnit}>
                  m
                </AppText>
              </View>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricBlock}>
              <AppText variant="caption" style={styles.metricLabel}>
                GAS
              </AppText>
              <AppText variant="body" style={styles.gasValue} numberOfLines={1}>
                {gasLabel}
              </AppText>
            </View>
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onCtaPress ?? onPress}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
        <AppText variant="label" style={styles.ctaText}>
          {ctaLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopWidth: 0,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  bodyPressed: {
    opacity: 0.92,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  spotColumn: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  spotTitle: {
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  spotMeta: {
    color: colors.textSecondary,
  },
  spotSchedule: {
    color: colors.textPrimary,
  },
  metricsColumn: {
    width: 140,
    borderLeftWidth: 1,
    borderLeftColor: colors.divider,
    paddingLeft: spacing.md,
    gap: spacing.sm,
  },
  metricBlock: {
    gap: 2,
  },
  metricLabel: {
    letterSpacing: 0.6,
    color: colors.textTertiary,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  metricValue: {
    color: colors.primary,
    letterSpacing: -0.8,
  },
  metricUnit: {
    color: colors.primary,
    marginBottom: 2,
  },
  gasValue: {
    color: colors.primary,
  },
  metricDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  cta: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  ctaPressed: {
    backgroundColor: colors.surface,
  },
  ctaText: {
    color: colors.primary,
  },
});
