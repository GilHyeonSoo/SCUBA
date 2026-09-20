import { useQuery } from '@tanstack/react-query';

import { fetchExplorePlaceById } from '@/src/features/explore/api/places.api';
import {
  mapPlaceImages,
  type ExplorePlace,
  type ExplorePlaceDetail,
} from '@/src/features/explore/types';

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
    query.data ??
    (fallbackPlace && placeId === fallbackPlace.id
      ? {
          ...fallbackPlace,
          images: fallbackPlace.primaryImageUrl
            ? mapPlaceImages([
                {
                  id: `${fallbackPlace.id}-primary`,
                  url: fallbackPlace.primaryImageUrl,
                  source: 'google_places',
                  caption: null,
                  is_primary: true,
                  sort_order: 0,
                },
              ])
            : [],
          operatingHours: [],
          highlights: [],
        }
      : null);

  return {
    detail,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
