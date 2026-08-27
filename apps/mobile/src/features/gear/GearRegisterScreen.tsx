import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppButton, AppChip, AppHeader, AppText } from '@/src/components/ui';
import { colors, layout, radius, spacing } from '@/src/constants';
import { GearCatalogCard } from '@/src/features/gear/components/GearCatalogCard';
import { GearCatalogError } from '@/src/features/gear/api/gear-catalog.api';
import { useGearCatalog } from '@/src/features/gear/hooks/useGearCatalog';
import { useGearStore } from '@/src/features/gear/stores/gear-store';
import type { GearCatalogProduct, GearDiveTypeFilter } from '@/src/features/gear/types';

const diveTypeFilters: Array<{ label: string; value: GearDiveTypeFilter }> = [
  { label: '전체', value: 'all' },
  { label: '스킨스쿠버', value: 'scuba' },
  { label: '프리다이빙', value: 'freediving' },
];

export default function GearRegisterScreen() {
  const router = useRouter();
  const [diveType, setDiveType] = useState<GearDiveTypeFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const registerGear = useGearStore((state) => state.registerGear);
  const isRegistered = useGearStore((state) => state.isRegistered);

  const {
    products,
    source,
    hasMore,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    isFetchingNextPage,
  } = useGearCatalog({
    diveType,
    query: searchQuery,
    limit: 30,
  });

  const isFallback = source === 'fallback';
  const errorMessage =
    error instanceof GearCatalogError
      ? error.message
      : error instanceof Error
        ? error.message
        : '카탈로그를 불러오지 못했습니다.';

  const handleRegister = useCallback(
    (product: GearCatalogProduct) => {
      const added = registerGear(product);
      if (!added) {
        Alert.alert('이미 등록됨', '이 장비는 이미 내 장비 목록에 있습니다.');
        return;
      }

      Alert.alert('등록 완료', `${product.brandName} ${product.title} 장비가 등록되었습니다.`, [
        { text: '계속 찾기', style: 'cancel' },
        { text: '내 장비 보기', onPress: () => router.back() },
      ]);
    },
    [registerGear, router],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.headerContent}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder="제품명 또는 브랜드 검색"
            placeholderTextColor={colors.textTertiary}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => setSearchQuery(searchInput.trim())}
          />
          {searchInput.length > 0 ? (
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textTertiary}
              onPress={() => {
                setSearchInput('');
                setSearchQuery('');
              }}
            />
          ) : null}
        </View>

        <AppButton
          label="검색"
          size="md"
          variant="secondary"
          onPress={() => setSearchQuery(searchInput.trim())}
        />

        <View style={styles.chipRow}>
          {diveTypeFilters.map((filter) => (
            <AppChip
              key={filter.value}
              label={filter.label}
              selected={diveType === filter.value}
              onPress={() => setDiveType(filter.value)}
            />
          ))}
        </View>

        {isFallback ? (
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <AppText variant="caption" style={styles.noticeText}>
              Channel3 API 연결 전 샘플 카탈로그를 표시합니다. Supabase Edge Function과 API 키를
              설정하면 실제 상품 데이터가 표시됩니다.
            </AppText>
          </View>
        ) : null}

        <AppText variant="bodySmall" color="textSecondary">
          카드를 선택하면 내 장비로 등록됩니다 · {products.length}개 표시
          {hasMore ? ' · 아래로 스크롤하면 더 불러옵니다' : ''}
        </AppText>
      </View>
    ),
    [diveType, hasMore, isFallback, products.length, searchInput],
  );

  return (
    <ScreenLayout
      scrollable={false}
      withTabBarInset={false}
      header={
        <AppHeader
          title="장비 등록"
          subtitle="상품을 선택해 내 장비에 추가하세요"
          onBack={() => router.back()}
        />
      }
      contentContainerStyle={styles.content}>
      {isLoading ? (
        <View style={styles.flexState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="bodySmall" color="textSecondary">
            다이빙 장비 카탈로그를 불러오는 중...
          </AppText>
        </View>
      ) : isError ? (
        <View style={styles.flexState}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.textTertiary} />
          <AppText variant="h3" style={styles.errorTitle}>
            연결에 실패했습니다
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={styles.errorText}>
            {errorMessage}
          </AppText>
          <AppButton label="다시 시도" onPress={() => refetch()} />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={listHeader}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isFetching && !isLoading}
          onRefresh={() => refetch()}
          onEndReached={() => {
            if (hasMore && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
                <AppText variant="caption" color="textSecondary">
                  더 많은 장비를 불러오는 중...
                </AppText>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centerState}>
              <AppText variant="h3">검색 결과가 없습니다</AppText>
              <AppText variant="bodySmall" color="textSecondary">
                다른 검색어나 필터를 시도해 보세요.
              </AppText>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.cardCell}>
              <GearCatalogCard
                product={item}
                selected={isRegistered(item.id)}
                onPress={() => handleRegister(item)}
              />
            </View>
          )}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  headerContent: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    color: colors.textSecondary,
  },
  columnWrapper: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardCell: {
    flex: 1,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing['3xl'],
  },
  flexState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  errorTitle: {
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
});
