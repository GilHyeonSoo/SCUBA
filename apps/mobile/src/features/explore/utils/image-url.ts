import type { ExplorePlaceImage, PlaceImageRow } from '@/src/features/explore/types';

const IMAGE_SOURCE_PRIORITY: Record<ExplorePlaceImage['source'], number> = {
  google_places: 0,
  naver_place: 1,
  official_website: 2,
};

export function normalizeImageUrl(url: string): string {
  return url.replace(/&amp;/g, '&').trim();
}

export function comparePlaceImages(a: PlaceImageRow, b: PlaceImageRow): number {
  const sourceDiff =
    IMAGE_SOURCE_PRIORITY[a.source] - IMAGE_SOURCE_PRIORITY[b.source];
  if (sourceDiff !== 0) return sourceDiff;

  if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
  return a.sort_order - b.sort_order;
}

export function sortPlaceImageRows(images: PlaceImageRow[]): PlaceImageRow[] {
  return [...images].sort(comparePlaceImages);
}
