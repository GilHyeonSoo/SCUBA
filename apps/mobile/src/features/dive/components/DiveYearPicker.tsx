import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';

type DiveYearPickerProps = {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
};

export function DiveYearPicker({ years, selectedYear, onSelectYear }: DiveYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${selectedYear}년 선택`}
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}>
        <AppText variant="h3" style={styles.triggerText}>
          {selectedYear}년
        </AppText>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={isOpen} animationType="fade" transparent onRequestClose={() => setIsOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsOpen(false)} />
          <View style={styles.sheet}>
            <AppText variant="h3" style={styles.sheetTitle}>
              연도 선택
            </AppText>
            {years.map((year) => {
              const isSelected = year === selectedYear;

              return (
                <Pressable
                  key={year}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    onSelectYear(year);
                    setIsOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.yearRow,
                    isSelected && styles.yearRowSelected,
                    pressed && styles.yearRowPressed,
                  ]}>
                  <AppText
                    variant="body"
                    color={isSelected ? 'primary' : undefined}
                    style={styles.yearText}>
                    {year}년
                  </AppText>
                  {isSelected ? (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  triggerPressed: {
    opacity: 0.7,
  },
  triggerText: {
    fontSize: 19,
    lineHeight: 26,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.xs,
  },
  sheetTitle: {
    marginBottom: spacing.sm,
    fontSize: 19,
    lineHeight: 26,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  yearRowSelected: {
    backgroundColor: colors.primarySoft,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomColor: colors.borderLight,
  },
  yearRowPressed: {
    opacity: 0.7,
  },
  yearText: {
    fontSize: 17,
    lineHeight: 25,
  },
});
