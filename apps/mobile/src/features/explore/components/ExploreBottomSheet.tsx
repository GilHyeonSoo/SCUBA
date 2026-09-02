import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { ExplorePlaceListItem } from '@/src/features/explore/components/ExplorePlaceListItem';
import type { ExplorePlace } from '@/src/features/explore/mock-data';
import { MapBottomSheet } from '@/src/features/map/components/MapBottomSheet';

type ExploreBottomSheetProps = {
  places: ExplorePlace[];
  selectedFilterIndex: number;
  onFilterChange: (index: number) => void;
  filters: readonly string[];
  searchQuery: string;
};

export function ExploreBottomSheet({
  places,
  selectedFilterIndex,
  onFilterChange,
  filters,
  searchQuery,
}: ExploreBottomSheetProps) {
  const emptyMessage =
    searchQuery.trim().length > 0
      ? `'${searchQuery.trim()}'에 맞는 장소가 없습니다.`
      : '표시할 장소가 없습니다.';

  return (
    <MapBottomSheet
      title="주변 다이빙 장소"
      data={places}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ExplorePlaceListItem place={item} />}
      filters={filters}
      selectedFilterIndex={selectedFilterIndex}
      onFilterChange={onFilterChange}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <AppText variant="bodySmall" style={styles.emptyText}>
            {emptyMessage}
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
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
