import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const DAY_CIRCLE_SIZE = 40;

type MeetingDetailCalendarProps = {
  startDateIso: string;
  endDateIso: string;
};

function parseMeetingDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

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

type DayCellProps = {
  date: Date;
  cellSize: number;
  startDate: Date;
  endDate: Date;
  isSingleDay: boolean;
};

function DayCell({ date, cellSize, startDate, endDate, isSingleDay }: DayCellProps) {
  const today = startOfDay(new Date());
  const day = startOfDay(date);
  const isPast = day.getTime() < today.getTime();

  const inRange = isSingleDay
    ? isSameDay(date, startDate)
    : isWithinRange(date, startDate, endDate);
  const isRangeStart = isSameDay(date, startDate);
  const isRangeEnd = isSameDay(date, endDate);
  const isRangeMiddle = !isSingleDay && inRange && !isRangeStart && !isRangeEnd;
  const isEndpoint = isRangeStart || isRangeEnd || (isSingleDay && inRange);

  const showRangeTrack = inRange && !isSingleDay;

  return (
    <View style={[styles.dayCell, cellSize > 0 && { width: cellSize, height: cellSize }]}>
      {showRangeTrack ? (
        <View
          style={[
            styles.rangeTrack,
            {
              top: (cellSize - DAY_CIRCLE_SIZE) / 2,
              height: DAY_CIRCLE_SIZE,
            },
            isRangeMiddle && styles.rangeTrackMiddle,
            isRangeStart && styles.rangeTrackFromStart,
            isRangeEnd && styles.rangeTrackToEnd,
          ]}
        />
      ) : null}

      <View
        style={[
          styles.dayCircle,
          isEndpoint && styles.dayCircleSelected,
          !isEndpoint && isToday(date) && styles.dayCircleToday,
        ]}>
        <AppText
          variant="label"
          style={[
            styles.dayLabel,
            isEndpoint && styles.dayLabelSelected,
            isPast && !inRange && styles.dayLabelPast,
          ]}>
          {date.getDate()}
        </AppText>
      </View>
    </View>
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function MeetingDetailCalendar({ startDateIso, endDateIso }: MeetingDetailCalendarProps) {
  const startDate = parseMeetingDate(startDateIso);
  const endDate = parseMeetingDate(endDateIso);
  const isSingleDay = startDateIso === endDateIso;

  const viewDate = useMemo(
    () => new Date(startDate.getFullYear(), startDate.getMonth(), 1),
    [startDateIso],
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

  const monthLabel = `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`;

  const handleGridLayout = (event: LayoutChangeEvent) => {
    setGridWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      <AppText variant="sectionTitle" style={styles.monthLabel}>{monthLabel}</AppText>

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
              if (!date) {
                return (
                  <View
                    key={`empty-${weekIndex}-${dayIndex}`}
                    style={cellSize > 0 ? { width: cellSize, height: cellSize } : styles.dayCellPlaceholder}
                  />
                );
              }

              return (
                <DayCell
                  key={date.toISOString()}
                  date={date}
                  cellSize={cellSize}
                  startDate={startDate}
                  endDate={endDate}
                  isSingleDay={isSingleDay}
                />
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
    gap: spacing.md,
  },
  monthLabel: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayLabel: {
    color: colors.textTertiary,
    fontWeight: '600',
    fontSize: 12,
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
    position: 'relative',
  },
  rangeTrack: {
    position: 'absolute',
    backgroundColor: colors.primarySoft,
  },
  rangeTrackMiddle: {
    left: 0,
    right: 0,
  },
  rangeTrackFromStart: {
    left: '50%',
    right: 0,
  },
  rangeTrackToEnd: {
    left: 0,
    right: '50%',
  },
  dayCircle: {
    width: DAY_CIRCLE_SIZE,
    height: DAY_CIRCLE_SIZE,
    borderRadius: DAY_CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dayCircleSelected: {
    backgroundColor: colors.primary,
  },
  dayCircleToday: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  dayLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  dayLabelSelected: {
    color: colors.white,
  },
  dayLabelPast: {
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
});
