import { ScrollView, StyleSheet, View } from 'react-native';

import { AppChip } from '@/src/components/ui';

type DiveYearSelectorProps = {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
};

export function DiveYearSelector({ years, selectedYear, onSelectYear }: DiveYearSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {years.map((year) => (
        <AppChip
          key={year}
          label={`${year}`}
          selected={year === selectedYear}
          onPress={() => onSelectYear(year)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingVertical: 2,
  },
});
