import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';

type HomeLogInsightCardProps = {
  insight: string;
  onPress?: () => void;
};

export function HomeLogInsightCard({ insight, onPress }: HomeLogInsightCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`로그가 말해준 것. ${insight}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.cardPressed]}>
      <View style={styles.accent} />
      <View style={styles.content}>
        <AppText variant="label" style={styles.label}>
          로그가 말해준 것
        </AppText>
        <AppText variant="bodySmall" style={styles.insight}>
          {insight}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  cardPressed: {
    opacity: 0.88,
  },
  accent: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    color: colors.primary,
  },
  insight: {
    color: colors.textPrimary,
  },
});
