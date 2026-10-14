import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';

type MeetingDetailMetaGridProps = {
  cells: {
    label: string;
    value: string;
  }[];
};

function MetaCell({
  label,
  value,
  showLeftDivider,
}: {
  label: string;
  value: string;
  showLeftDivider: boolean;
}) {
  return (
    <View style={[styles.cell, showLeftDivider && styles.cellDividerLeft]}>
      <AppText variant="caption" color="textTertiary">
        {label}
      </AppText>
      <AppText variant="h3" style={styles.cellValue} numberOfLines={2}>
        {value}
      </AppText>
    </View>
  );
}

export function MeetingDetailMetaGrid({ cells }: MeetingDetailMetaGridProps) {
  const rowOne = cells.slice(0, 2);
  const rowTwo = cells.slice(2, 4);

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        {rowOne.map((cell, index) => (
          <MetaCell
            key={cell.label}
            label={cell.label}
            value={cell.value}
            showLeftDivider={index > 0}
          />
        ))}
      </View>
      <View style={[styles.row, styles.rowBorderTop]}>
        {rowTwo.map((cell, index) => (
          <MetaCell
            key={cell.label}
            label={cell.label}
            value={cell.value}
            showLeftDivider={index > 0}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  rowBorderTop: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  cell: {
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  cellDividerLeft: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.divider,
  },
  cellValue: {
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
  },
});
