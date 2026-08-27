import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  fetchGearCatalog,
  type FetchGearCatalogParams,
  GearCatalogError,
} from '@/src/features/gear/api/gear-catalog.api';
import type { GearCatalogProduct } from '@/src/features/gear/types';

type UseGearCatalogParams = Omit<FetchGearCatalogParams, 'pageToken'>;

export function useGearCatalog(params: UseGearCatalogParams) {
  const diveType = params.diveType ?? 'all';
  const query = params.query?.trim() ?? '';
  const limit = params.limit ?? 30;

  const result = useInfiniteQuery({
    queryKey: ['gear-catalog', diveType, query, limit],
    queryFn: ({ pageParam }) =>
      fetchGearCatalog({
        diveType,
        query,
        limit,
        pageToken: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
    staleTime: 5 * 60_000,
    retry: (failureCount, error) => {
      if (error instanceof GearCatalogError && error.code === 'FUNCTION_NOT_FOUND') {
        return false;
      }
      return failureCount < 1;
    },
  });

  const products = useMemo(
    () =>
      result.data?.pages.reduce<GearCatalogProduct[]>((acc, page) => {
        const seen = new Set(acc.map((item) => item.id));
        for (const product of page.products) {
          if (!seen.has(product.id)) {
            acc.push(product);
          }
        }
        return acc;
      }, []) ?? [],
    [result.data?.pages],
  );

  const source = result.data?.pages[0]?.source;
  const hasMore = result.hasNextPage;

  return {
    ...result,
    products,
    source,
    hasMore,
  };
}
