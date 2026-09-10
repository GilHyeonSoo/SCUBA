import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { ExplorePlaceDetailContent } from '@/src/features/explore/components/ExplorePlaceDetailContent';
import { ExplorePlaceListItem } from '@/src/features/explore/components/ExplorePlaceListItem';
import type { ExploreSheetSnap } from '@/src/features/explore/constants';
import type { ExplorePlace, ExplorePlaceDetail } from '@/src/features/explore/types';
import { MapBottomSheet } from '@/src/features/map/components/MapBottomSheet';

type ExploreBottomSheetProps = {
  places: ExplorePlace[];
  listTitle?: string;
  selectedFilterIndex: number;
  onFilterChange: (index: number) => void;
  filters: readonly string[];
  searchQuery: string;
  onPlacePress?: (place: ExplorePlace) => void;
  detailPlace?: ExplorePlaceDetail | null;
  isDetailLoading?: boolean;
  sheetSnap?: ExploreSheetSnap;
  onDetailBack?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

export function ExploreBottomSheet({
  places,
  listTitle = '주변 다이빙 장소',
  selectedFilterIndex,
  onFilterChange,
  filters,
  searchQuery,
  onPlacePress,
  detailPlace,
  isDetailLoading = false,
  sheetSnap = 'peek',
  onDetailBack,
  isLoading = false,
  isError = false,
  onRetry,
}: ExploreBottomSheetProps) {
  const isDetailMode = Boolean(detailPlace);
  const emptyMessage =
    searchQuery.trim().length > 0
      ? `'${searchQuery.trim()}'에 맞는 장소가 없습니다.`
      : '표시할 장소가 없습니다.';

  const listEmptyComponent = isLoading ? (
    <View style={styles.emptyState}>
      <ActivityIndicator size="small" color={colors.primary} />
      <AppText variant="bodySmall" style={styles.emptyText}>
        장소를 불러오는 중입니다.
      </AppText>
    </View>
  ) : isError ? (
    <View style={styles.emptyState}>
      <AppText variant="bodySmall" style={styles.emptyText}>
        장소를 불러오지 못했습니다.
      </AppText>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <AppText variant="label" style={styles.retryText}>
            다시 시도
          </AppText>
        </Pressable>
      ) : null}
    </View>
  ) : (
    <View style={styles.emptyState}>
      <AppText variant="bodySmall" style={styles.emptyText}>
        {emptyMessage}
      </AppText>
    </View>
  );

  return (
    <MapBottomSheet
      mode={isDetailMode ? 'detail' : 'list'}
      title={listTitle}
      onDetailBack={onDetailBack}
      snapTarget={sheetSnap}
      snapKey={detailPlace?.id ?? 'list'}
      detailContent={
        detailPlace ? (
          <ExplorePlaceDetailContent place={detailPlace} isLoading={isDetailLoading} />
        ) : undefined
      }
      data={places}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ExplorePlaceListItem place={item} onPress={() => onPlacePress?.(item)} />
      )}
      filters={filters}
      selectedFilterIndex={selectedFilterIndex}
      onFilterChange={onFilterChange}
      ListEmptyComponent={listEmptyComponent}
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
  retryButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  retryText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
