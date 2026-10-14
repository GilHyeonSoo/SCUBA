import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import type { TourScheduleTable } from '@/src/features/tour/types/tour-meeting-detail';

type TourDetailScheduleTableProps = {
  schedule: TourScheduleTable;
};

export function TourDetailScheduleTable({ schedule }: TourDetailScheduleTableProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <AppText variant="caption" style={[styles.headerCell, styles.timeColumn]}>시간</AppText>
        <AppText variant="caption" style={[styles.headerCell, styles.activityColumn]}>프로그램</AppText>
      </View>

      {schedule.days.map((day) => (
        <View key={day.dayLabel} style={styles.dayGroup}>
          <View style={styles.dayLabelRow}>
            <AppText variant="label" style={styles.dayLabel}>{day.dayLabel}</AppText>
          </View>
          {day.rows.map((row, index) => (
            <View
              key={`${day.dayLabel}-${row.time}-${row.activity}`}
              style={[
                styles.dataRow,
                index === day.rows.length - 1 && styles.dataRowLastInGroup,
              ]}>
              <AppText variant="bodySmall" style={[styles.dataCell, styles.timeColumn]}>
                {row.time}
              </AppText>
              <AppText variant="bodySmall" style={[styles.dataCell, styles.activityColumn]}>
                {row.activity}
              </AppText>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  headerCell: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  timeColumn: {
    width: 72,
  },
  activityColumn: {
    flex: 1,
  },
  dayGroup: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  dayLabelRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  dayLabel: {
    color: colors.primaryStrong,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  dataRowLastInGroup: {},
  dataCell: {
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
