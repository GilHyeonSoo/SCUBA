import { useQuery } from '@tanstack/react-query';

import { fetchExplorePlaces } from '@/src/features/explore/api/places.api';

export function useExplorePlaces() {
  const query = useQuery({
    queryKey: ['explore-places'],
    queryFn: fetchExplorePlaces,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  return {
    places: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
