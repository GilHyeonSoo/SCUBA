import { useQuery } from '@tanstack/react-query';

import { fetchExplorePlaceById } from '@/src/features/explore/api/places.api';
import type { ExplorePlace, ExplorePlaceDetail } from '@/src/features/explore/types';

export function useExplorePlaceDetail(
  placeId: string | null,
  fallbackPlace?: ExplorePlace | null,
) {
  const query = useQuery({
    queryKey: ['explore-place', placeId],
    queryFn: () => fetchExplorePlaceById(placeId!),
    enabled: Boolean(placeId),
    staleTime: 5 * 60_000,
  });

  const detail: ExplorePlaceDetail | null =
    query.data ?? (fallbackPlace && placeId === fallbackPlace.id ? fallbackPlace : null);

  return {
    detail,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
