import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export type MeetingDateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

type MeetingCalendarPickerProps = {
  value: MeetingDateRange;
  onChange: (range: MeetingDateRange) => void;
  minimumDate?: Date;
};

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isWithinRange(date: Date, startDate: Date, endDate: Date): boolean {
  const target = startOfDay(date).getTime();
  const start = startOfDay(startDate).getTime();
  const end = startOfDay(endDate).getTime();

  return target >= start && target <= end;
}

function normalizeRange(startDate: Date, endDate: Date): MeetingDateRange {
  if (startOfDay(endDate) < startOfDay(startDate)) {
    return { startDate: endDate, endDate: startDate };
  }

  return { startDate, endDate };
}

export function MeetingCalendarPicker({
  value,
  onChange,
  minimumDate = startOfDay(new Date()),
}: MeetingCalendarPickerProps) {
  const anchorDate = value.startDate ?? value.endDate ?? minimumDate;
  const [viewDate, setViewDate] = useState(
    () => new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1),
  );

  const [gridWidth, setGridWidth] = useState(0);
  const cellSize = gridWidth > 0 ? gridWidth / 7 : 0;

  const weeks = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOffset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<Date | null> = Array.from({ length: firstDayOffset }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }

    const trailingEmptyCells = (7 - (cells.length % 7)) % 7;
    for (let index = 0; index < trailingEmptyCells; index += 1) {
      cells.push(null);
    }

    const nextWeeks: Array<Array<Date | null>> = [];
    for (let index = 0; index < cells.length; index += 7) {
      nextWeeks.push(cells.slice(index, index + 7));
    }

    return nextWeeks;
  }, [viewDate]);

  const handleGridLayout = (event: LayoutChangeEvent) => {
    setGridWidth(event.nativeEvent.layout.width);
  };

  const monthLabel = `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`;

  const handlePrevMonth = () => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const handleDatePress = (date: Date) => {
    const { startDate, endDate } = value;

    if (startDate && endDate) {
      onChange({ startDate: date, endDate: null });
      return;
    }

    if (!startDate) {
      onChange({ startDate: date, endDate: null });
      return;
    }

    onChange(normalizeRange(startDate, date));
  };

  const selectionHint = (() => {
    if (!value.startDate) {
      return '시작 날짜를 선택하세요';
    }

    if (!value.endDate) {
      return '종료 날짜를 선택하세요';
    }

    return '다시 선택하려면 날짜를 탭하세요';
  })();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="이전 달"
          onPress={handlePrevMonth}
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <AppText variant="label" style={styles.monthLabel}>{monthLabel}</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다음 달"
          onPress={handleNextMonth}
          style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}>
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <AppText variant="caption" style={styles.selectionHint}>
        {selectionHint}
      </AppText>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <AppText variant="caption" style={styles.weekdayLabel}>{label}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.grid} onLayout={handleGridLayout}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map((date, dayIndex) => {
              const cellStyle =
                cellSize > 0 ? { width: cellSize, height: cellSize } : styles.dayCellPlaceholder;

              if (!date) {
                return <View key={`empty-${weekIndex}-${dayIndex}`} style={cellStyle} />;
              }

              const disabled = startOfDay(date) < startOfDay(minimumDate);
              const isToday = isSameDay(date, new Date());
              const hasRange = Boolean(value.startDate && value.endDate);
              const isRangeStart = value.startDate ? isSameDay(date, value.startDate) : false;
              const isRangeEnd = value.endDate ? isSameDay(date, value.endDate) : false;
              const isSingleDaySelected =
                hasRange && value.startDate && value.endDate && isRangeStart && isRangeEnd;
              const isPendingStart = value.startDate
                ? isSameDay(date, value.startDate) && !value.endDate
                : false;
              const isWithinSelectedRange =
                value.startDate && value.endDate
                  ? isWithinRange(date, value.startDate, value.endDate)
                  : false;
              const isRangeMiddle =
                isWithinSelectedRange && !isRangeStart && !isRangeEnd && !isSingleDaySelected;

              return (
                <Pressable
                  key={date.toISOString()}
                  accessibilityRole="button"
                  disabled={disabled}
                  onPress={() => handleDatePress(date)}
                  style={({ pressed }) => [
                    styles.dayCell,
                    cellStyle,
                    isRangeMiddle && styles.dayCellInRange,
                    (isRangeStart || isRangeEnd || isPendingStart || isSingleDaySelected) &&
                      styles.dayCellSelected,
                    isToday &&
                      !isRangeStart &&
                      !isRangeEnd &&
                      !isPendingStart &&
                      !isSingleDaySelected &&
                      styles.dayCellToday,
                    disabled && styles.dayCellDisabled,
                    pressed && !disabled && styles.dayCellPressed,
                  ]}>
                  <AppText
                    variant="label"
                    style={[
                      styles.dayLabel,
                      (isRangeStart ||
                        isRangeEnd ||
                        isPendingStart ||
                        isSingleDaySelected) &&
                        styles.dayLabelSelected,
                      isRangeMiddle && styles.dayLabelInRange,
                      disabled && styles.dayLabelDisabled,
                    ]}>
                    {date.getDate()}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  navButtonPressed: {
    backgroundColor: colors.surface,
  },
  monthLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  selectionHint: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekdayLabel: {
    color: colors.textTertiary,
    fontWeight: '600',
  },
  grid: {
    width: '100%',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCellPlaceholder: {
    flex: 1,
    aspectRatio: 1,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellInRange: {
    backgroundColor: colors.primarySoft,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayCellPressed: {
    backgroundColor: colors.primarySoft,
  },
  dayLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  dayLabelSelected: {
    color: colors.white,
  },
  dayLabelInRange: {
    color: colors.primaryStrong,
  },
  dayLabelDisabled: {
    color: colors.textTertiary,
  },
});
