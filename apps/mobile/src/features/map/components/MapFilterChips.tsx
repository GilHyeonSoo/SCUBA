import { ScrollView, StyleSheet } from 'react-native';

import { AppChip } from '@/src/components/ui';
import { layout, spacing } from '@/src/constants';

type MapFilterChipsProps = {
  filters: string[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
};

export function MapFilterChips({
  filters,
  selectedIndex = 0,
  onSelect,
}: MapFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}>
      {filters.map((label, index) => (
        <AppChip
          key={label}
          label={label}
          selected={index === selectedIndex}
          onPress={() => onSelect?.(index)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingRight: layout.screenPaddingHorizontal + spacing.sm,
  },
});
