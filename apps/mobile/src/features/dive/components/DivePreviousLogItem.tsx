import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import type { DiveLog } from '@/src/features/dive-log/types';
import {
  formatDepthMeters,
  formatDiveDuration,
  formatDiveLocationLabel,
  formatPreviousLogDate,
} from '@/src/features/dive-log/utils/format-dive-log';

type DivePreviousLogItemProps = {
  dive: DiveLog;
  onPress?: (diveId: string) => void;
};

export function DivePreviousLogItem({ dive, onPress }: DivePreviousLogItemProps) {
  const title = dive.diveNumber ? `Dive #${dive.diveNumber}` : 'Dive';
  const locationLabel = formatDiveLocationLabel(dive.source.vendor, dive.source.model);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${formatPreviousLogDate(dive.startedAt)} ${title} 상세 보기`}
      onPress={() => onPress?.(dive.id)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.main}>
        <AppText variant="body" style={styles.date}>
          {formatPreviousLogDate(dive.startedAt)}
        </AppText>
        <AppText variant="bodySmall" style={styles.location}>
          {locationLabel}
        </AppText>
        <AppText variant="caption" style={styles.diveNumber}>
          {title}
        </AppText>
      </View>
      <View style={styles.trailing}>
        <AppText variant="label" style={styles.depth}>
          {formatDepthMeters(dive.maxDepthM)}
        </AppText>
        <AppText variant="caption" style={styles.duration}>
          {formatDiveDuration(dive.durationSec)}
        </AppText>
        <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowPressed: {
    opacity: 0.7,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  date: {
    fontSize: 17,
    lineHeight: 25,
  },
  location: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
  },
  diveNumber: {
    color: colors.textTertiary,
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 2,
  },
  depth: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
  },
  duration: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
