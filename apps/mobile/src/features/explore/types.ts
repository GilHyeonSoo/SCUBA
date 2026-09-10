import type { MapMarkerTone } from '@/src/features/map/types';

export type ExplorePlaceCategory = Exclude<MapMarkerTone, 'buddy'>;
export type ExplorePlaceType = 'shop' | 'pool' | 'site';

export type ExplorePlace = {
  id: string;
  name: string;
  category: ExplorePlaceCategory;
  categoryLabel: string;
  address: string;
  latitude: number;
  longitude: number;
};

export type PlaceRow = {
  id: string;
  name: string;
  place_type: ExplorePlaceType;
  address_line: string | null;
  region: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
};

export type PlaceDetailRow = PlaceRow & {
  phone: string | null;
  website: string | null;
  google_maps_url: string | null;
  naver_map_url: string | null;
  kakao_map_url: string | null;
  verification_status: string | null;
  verification_source_count: number | null;
  raw_category: string | null;
};

export type ExplorePlaceDetail = ExplorePlace & {
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  naverMapUrl?: string;
  kakaoMapUrl?: string;
  verificationStatus?: string;
  verificationSourceCount?: number;
  rawCategory?: string;
  region?: string;
  city?: string;
};

export const EXPLORE_CATEGORY_LABELS: Record<ExplorePlaceType, string> = {
  pool: '잠수풀',
  site: '포인트',
  shop: '샵',
};

export const exploreFilters = ['전체', '잠수풀', '포인트', '샵', '투어'] as const;

export const exploreFilterCategories: Array<ExplorePlaceCategory | 'all'> = [
  'all',
  'pool',
  'site',
  'shop',
  'tour',
];

export function mapPlaceRowToExplorePlaceDetail(row: PlaceDetailRow): ExplorePlaceDetail {
  const base = mapPlaceRowToExplorePlace(row);

  return {
    ...base,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    googleMapsUrl: row.google_maps_url ?? undefined,
    naverMapUrl: row.naver_map_url ?? undefined,
    kakaoMapUrl: row.kakao_map_url ?? undefined,
    verificationStatus: row.verification_status ?? undefined,
    verificationSourceCount: row.verification_source_count ?? undefined,
    rawCategory: row.raw_category ?? undefined,
    region: row.region ?? undefined,
    city: row.city ?? undefined,
  };
}

export function mapPlaceRowToExplorePlace(row: PlaceRow): ExplorePlace {
  const address =
    row.address_line?.trim() ||
    [row.region, row.city].filter(Boolean).join(' ') ||
    '주소 정보 없음';

  return {
    id: row.id,
    name: row.name,
    category: row.place_type,
    categoryLabel: EXPLORE_CATEGORY_LABELS[row.place_type],
    address,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}
