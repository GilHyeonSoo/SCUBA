import {
  normalizeImageUrl,
  sortPlaceImageRows,
} from '@/src/features/explore/utils/image-url';
import { extractOperatingHoursFromEnrichment } from '@/src/features/explore/utils/operating-hours';
import type { MapMarkerTone } from '@/src/features/map/types';

export type ExplorePlaceCategory = Exclude<MapMarkerTone, 'buddy'>;
export type ExplorePlaceType = 'shop' | 'pool' | 'site';

export type FieldWithSource<T> = {
  value: T;
  sourceUrl: string;
  collectedAt: string;
  verified?: boolean;
};

export type OperatingHoursDay =
  | '월요일'
  | '화요일'
  | '수요일'
  | '목요일'
  | '금요일'
  | '토요일'
  | '일요일';

export type OperatingHoursRow = {
  day: OperatingHoursDay;
  open: string | null;
  close: string | null;
};

export type OperatingHoursTable = {
  rows: OperatingHoursRow[];
};

export type PoolEnrichmentData = {
  maxDepthM?: FieldWithSource<number>;
  poolSize?: FieldWithSource<string>;
  operatingHours?: FieldWithSource<OperatingHoursTable | string>;
  priceInfo?: FieldWithSource<string>;
  reservationMethod?: FieldWithSource<string>;
  parking?: FieldWithSource<boolean>;
  shower?: FieldWithSource<boolean>;
  equipmentRental?: FieldWithSource<boolean>;
  airFill?: FieldWithSource<boolean>;
  scubaAvailable?: FieldWithSource<boolean>;
  freedivingAvailable?: FieldWithSource<boolean>;
};

export type SiteEnrichmentData = {
  depthRangeM?: FieldWithSource<string>;
  difficulty?: FieldWithSource<string>;
  waterTemperature?: FieldWithSource<string>;
  visibility?: FieldWithSource<string>;
  accessType?: FieldWithSource<string>;
  currentInfo?: FieldWithSource<string>;
};

export type ShopEnrichmentData = {
  services?: FieldWithSource<string[]>;
  operatingHours?: FieldWithSource<OperatingHoursTable | string>;
  rentalAvailable?: FieldWithSource<boolean>;
  trainingAvailable?: FieldWithSource<boolean>;
  nitroxAvailable?: FieldWithSource<boolean>;
};

export type ExplorePlaceImage = {
  id?: string;
  url: string;
  source: 'official_website' | 'google_places' | 'naver_place';
  caption?: string;
  isPrimary?: boolean;
};

export type ExplorePlaceEnrichment = {
  status?: string;
  enrichedAt?: string;
  naverPlacePageUrl?: string;
  knownDataApplied?: {
    profile: 'pool' | 'site';
    matchKey: string;
    verified: true;
  };
  pool?: PoolEnrichmentData;
  site?: SiteEnrichmentData;
  shop?: ShopEnrichmentData;
  notes?: string;
};

export type ExplorePlaceHighlight = {
  label: string;
  value: string;
};

export type ExplorePlace = {
  id: string;
  name: string;
  category: ExplorePlaceCategory;
  categoryLabel: string;
  address: string;
  latitude: number;
  longitude: number;
  primaryImageUrl?: string;
  shortDescription?: string;
};

export type PlaceImageRow = {
  id: string;
  place_id?: string;
  url: string;
  source: ExplorePlaceImage['source'];
  caption: string | null;
  is_primary: boolean;
  sort_order: number;
};

export type PlaceEnrichmentRow = {
  enrichment_status: string;
  enriched_at: string;
  naver_place_page_url: string | null;
  known_data_applied: ExplorePlaceEnrichment['knownDataApplied'] | null;
  pool_data: PoolEnrichmentData | null;
  site_data: SiteEnrichmentData | null;
  shop_data: ShopEnrichmentData | null;
  notes: string | null;
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
  short_description?: string | null;
  place_images?: PlaceImageRow[] | null;
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
  place_enrichments?: PlaceEnrichmentRow[] | PlaceEnrichmentRow | null;
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
  images: ExplorePlaceImage[];
  operatingHours?: OperatingHoursRow[];
  enrichment?: ExplorePlaceEnrichment;
  highlights: ExplorePlaceHighlight[];
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

function pickPrimaryImageUrl(images?: PlaceImageRow[] | null): string | undefined {
  if (!images?.length) return undefined;

  const primary = sortPlaceImageRows(images)[0];
  return primary ? normalizeImageUrl(primary.url) : undefined;
}

export function mapPlaceImages(images?: PlaceImageRow[] | null): ExplorePlaceImage[] {
  if (!images?.length) return [];

  return sortPlaceImageRows(images).map((image) => ({
    id: image.id,
    url: normalizeImageUrl(image.url),
    source: image.source,
    caption: image.caption ?? undefined,
    isPrimary: image.is_primary,
  }));
}

function normalizeEnrichmentRow(
  row?: PlaceEnrichmentRow[] | PlaceEnrichmentRow | null,
): PlaceEnrichmentRow | null {
  if (!row) return null;
  return Array.isArray(row) ? row[0] ?? null : row;
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
    primaryImageUrl: pickPrimaryImageUrl(row.place_images),
    shortDescription: row.short_description?.trim() || undefined,
  };
}

export function mapPlaceRowToExplorePlaceDetail(
  row: PlaceDetailRow,
  enrichment?: ExplorePlaceEnrichment,
  highlights: ExplorePlaceHighlight[] = [],
): ExplorePlaceDetail {
  const base = mapPlaceRowToExplorePlace(row);
  const enrichmentRow = normalizeEnrichmentRow(row.place_enrichments);

  return {
    ...base,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    googleMapsUrl: row.google_maps_url ?? undefined,
    naverMapUrl: row.naver_map_url ?? enrichmentRow?.naver_place_page_url ?? undefined,
    kakaoMapUrl: row.kakao_map_url ?? undefined,
    verificationStatus: row.verification_status ?? undefined,
    verificationSourceCount: row.verification_source_count ?? undefined,
    rawCategory: row.raw_category ?? undefined,
    region: row.region ?? undefined,
    city: row.city ?? undefined,
    images: mapPlaceImages(row.place_images),
    operatingHours: extractOperatingHoursFromEnrichment(enrichment),
    enrichment,
    highlights,
  };
}
