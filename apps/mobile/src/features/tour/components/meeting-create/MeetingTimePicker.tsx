import { useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const PADDING_ROWS = Math.floor(VISIBLE_ROWS / 2);

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

type MeetingTimePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

type WheelColumnProps = {
  items: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  label: string;
};

function WheelColumn({ items, selectedValue, onValueChange, label }: WheelColumnProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const selectedIndex = items.indexOf(selectedValue);
    if (selectedIndex < 0) {
      return;
    }

    scrollRef.current?.scrollTo({
      y: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, [items, selectedValue]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const nextValue = items[Math.min(Math.max(index, 0), items.length - 1)];
    onValueChange(nextValue);
  };

  return (
    <View style={styles.column}>
      <AppText variant="caption" style={styles.columnLabel}>{label}</AppText>
      <View style={styles.wheelFrame}>
        <View pointerEvents="none" style={styles.selectionFrame} />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScrollEnd}
          contentContainerStyle={styles.wheelContent}>
          {Array.from({ length: PADDING_ROWS }).map((_, index) => (
            <View key={`top-${index}`} style={styles.wheelItem} />
          ))}
          {items.map((item) => {
            const selected = item === selectedValue;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                onPress={() => onValueChange(item)}
                style={[styles.wheelItem, selected && styles.wheelItemSelected]}>
                <AppText
                  variant="label"
                  style={[styles.wheelLabel, selected && styles.wheelLabelSelected]}>
                  {padTwo(item)}
                </AppText>
              </Pressable>
            );
          })}
          {Array.from({ length: PADDING_ROWS }).map((_, index) => (
            <View key={`bottom-${index}`} style={styles.wheelItem} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export function MeetingTimePicker({ value, onChange }: MeetingTimePickerProps) {
  const hour = value.getHours();
  const minute = value.getMinutes();

  const updateTime = (nextHour: number, nextMinute: number) => {
    const next = new Date(value);
    next.setHours(nextHour, nextMinute, 0, 0);
    onChange(next);
  };

  return (
    <View style={styles.container}>
      <WheelColumn
        label="시"
        items={HOURS}
        selectedValue={hour}
        onValueChange={(nextHour) => updateTime(nextHour, minute)}
      />
      <AppText variant="h2" style={styles.separator}>:</AppText>
      <WheelColumn
        label="분"
        items={MINUTES}
        selectedValue={minute}
        onValueChange={(nextMinute) => updateTime(hour, nextMinute)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  columnLabel: {
    color: colors.textTertiary,
    fontWeight: '600',
  },
  wheelFrame: {
    width: '100%',
    height: PICKER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  wheelContent: {
    paddingVertical: 0,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  wheelItemSelected: {
    backgroundColor: colors.primarySoft,
  },
  wheelLabel: {
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: '500',
  },
  wheelLabelSelected: {
    color: colors.primaryStrong,
    fontSize: 24,
    fontWeight: '700',
  },
  selectionFrame: {
    position: 'absolute',
    left: spacing.xs,
    right: spacing.xs,
    top: PADDING_ROWS * ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    opacity: 0.35,
    zIndex: 1,
  },
  separator: {
    color: colors.textPrimary,
    marginBottom: PADDING_ROWS * ITEM_HEIGHT - spacing.sm,
    fontWeight: '700',
  },
});
