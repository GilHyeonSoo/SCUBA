import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import type { OperatingHoursRow } from '@/src/features/explore/types';

type ExploreOperatingHoursTableProps = {
  rows: OperatingHoursRow[];
};

function formatCell(value: string | null, closed = false): string {
  if (closed) {
    return '-';
  }

  return value ?? '-';
}

export function ExploreOperatingHoursTable({ rows }: ExploreOperatingHoursTableProps) {
  if (!rows.length) {
    return null;
  }

  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        <AppText variant="caption" style={[styles.headerCell, styles.dayColumn]}>
          요일
        </AppText>
        <AppText variant="caption" style={[styles.headerCell, styles.timeColumn]}>
          오픈
        </AppText>
        <AppText variant="caption" style={[styles.headerCell, styles.timeColumn]}>
          마감
        </AppText>
      </View>

      {rows.map((row) => {
        const isClosed = !row.open && !row.close;

        return (
          <View key={row.day} style={styles.bodyRow}>
            <AppText variant="bodySmall" style={[styles.bodyCell, styles.dayColumn]}>
              {row.day}
            </AppText>
            <AppText
              variant="bodySmall"
              style={[styles.bodyCell, styles.timeColumn, isClosed && styles.closedText]}>
              {isClosed ? '휴무' : formatCell(row.open)}
            </AppText>
            <AppText
              variant="bodySmall"
              style={[styles.bodyCell, styles.timeColumn, isClosed && styles.closedText]}>
              {isClosed ? '-' : formatCell(row.close)}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerCell: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  bodyCell: {
    color: colors.textPrimary,
  },
  dayColumn: {
    flex: 1.1,
  },
  timeColumn: {
    flex: 1,
    textAlign: 'center',
  },
  closedText: {
    color: colors.textSecondary,
  },
});
