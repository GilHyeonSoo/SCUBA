import { AppText } from '@/src/components/ui';
import { spacing } from '@/src/constants';
import { BuddyListItem } from '@/src/features/buddy/components/BuddyListItem';
import type { BuddyProfile } from '@/src/features/buddy/mock-data';
import { MapBottomSheet } from '@/src/features/map/components/MapBottomSheet';
import { StyleSheet, View } from 'react-native';

type BuddyBottomSheetProps = {
  buddies: BuddyProfile[];
  selectedFilterIndex: number;
  onFilterChange: (index: number) => void;
  filters: readonly string[];
};

export function BuddyBottomSheet({
  buddies,
  selectedFilterIndex,
  onFilterChange,
  filters,
}: BuddyBottomSheetProps) {
  return (
    <MapBottomSheet
      title="주변 버디"
      data={buddies}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <BuddyListItem buddy={item} />}
      filters={filters}
      selectedFilterIndex={selectedFilterIndex}
      onFilterChange={onFilterChange}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <AppText variant="bodySmall" color="textSecondary">
            선택한 조건에 맞는 버디가 없습니다.
          </AppText>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  emptyState: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
});
