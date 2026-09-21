import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';

type HomeUpcomingTourCardProps = {
  title: string;
  location: string;
  date: string;
  participants: string;
  isOfficial?: boolean;
  stacked?: boolean;
  onPress?: () => void;
};

export function HomeUpcomingTourCard({
  title,
  location,
  date,
  participants,
  isOfficial = false,
  stacked = false,
  onPress,
}: HomeUpcomingTourCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        stacked && styles.cardStacked,
        pressed && onPress && styles.cardPressed,
      ]}>
      <View style={styles.headerRow}>
        <AppText variant="caption" style={styles.eyebrow}>
          UPCOMING TOUR
        </AppText>
        {isOfficial ? (
          <View style={styles.officialBadge}>
            <AppText variant="caption" style={styles.officialText}>
              공식
            </AppText>
          </View>
        ) : null}
      </View>

      <AppText variant="body" style={styles.title} numberOfLines={2}>
        {title}
      </AppText>

      <View style={styles.footerRow}>
        <AppText variant="bodySmall" style={styles.meta} numberOfLines={1}>
          {location}
        </AppText>
        <AppText variant="bodySmall" style={styles.metaStrong} numberOfLines={1}>
          {`${date} · ${participants}`}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  cardPressed: {
    backgroundColor: colors.surface,
  },
  cardStacked: {
    borderTopWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  officialBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  officialText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  footerRow: {
    gap: 2,
  },
  meta: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  metaStrong: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
