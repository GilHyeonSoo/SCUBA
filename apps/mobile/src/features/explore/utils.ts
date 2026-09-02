import type { ExplorePlace, ExplorePlaceCategory } from '@/src/features/explore/mock-data';

export function filterExplorePlaces(
  places: ExplorePlace[],
  category: ExplorePlaceCategory | 'all',
  query: string,
): ExplorePlace[] {
  const categoryFiltered =
    category === 'all' ? places : places.filter((place) => place.category === category);

  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return categoryFiltered;
  }

  return categoryFiltered.filter((place) => {
    const haystack = `${place.name} ${place.address} ${place.categoryLabel}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}
