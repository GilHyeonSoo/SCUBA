import { explorePlaces as fallbackPlaces } from '@/src/features/explore/mock-data';
import {
  mapPlaceRowToExplorePlace,
  mapPlaceRowToExplorePlaceDetail,
  type ExplorePlace,
  type ExplorePlaceDetail,
  type PlaceDetailRow,
  type PlaceImageRow,
  type PlaceRow,
} from '@/src/features/explore/types';
import {
  buildExplorePlaceEnrichment,
  buildPlaceHighlights,
} from '@/src/features/explore/utils/map-enrichment';
import { getSupabaseClient, isSupabaseConfigured } from '@/src/services/supabase';

const PLACES_PAGE_SIZE = 1000;
const IMAGES_PAGE_SIZE = 1000;

const PLACE_LIST_SELECT = `
  id,
  name,
  place_type,
  address_line,
  region,
  city,
  latitude,
  longitude,
  short_description
`;

const PLACE_IMAGE_SELECT = `
  id,
  place_id,
  url,
  source,
  caption,
  is_primary,
  sort_order
`;

const PLACE_DETAIL_SELECT = `
  id,
  name,
  place_type,
  address_line,
  region,
  city,
  latitude,
  longitude,
  short_description,
  phone,
  website,
  google_maps_url,
  naver_map_url,
  kakao_map_url,
  verification_status,
  verification_source_count,
  raw_category,
  place_enrichments (
    enrichment_status,
    enriched_at,
    naver_place_page_url,
    known_data_applied,
    pool_data,
    site_data,
    shop_data,
    notes
  ),
  place_images (
    id,
    url,
    source,
    caption,
    is_primary,
    sort_order
  )
`;

export class PlacesFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlacesFetchError';
  }
}

function groupImagesByPlaceId(images: PlaceImageRow[]): Map<string, PlaceImageRow[]> {
  const grouped = new Map<string, PlaceImageRow[]>();

  for (const image of images) {
    const placeId = image.place_id;
    if (!placeId) continue;

    const existing = grouped.get(placeId);
    if (existing) {
      existing.push(image);
      continue;
    }

    grouped.set(placeId, [image]);
  }

  return grouped;
}

async function fetchPublishedPlaceRows(client: NonNullable<ReturnType<typeof getSupabaseClient>>) {
  const rows: PlaceRow[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await client
      .from('places')
      .select(PLACE_LIST_SELECT)
      .eq('is_published', true)
      .neq('status', 'closed')
      .order('name')
      .range(offset, offset + PLACES_PAGE_SIZE - 1);

    if (error) {
      throw new PlacesFetchError(error.message);
    }

    if (!data?.length) {
      break;
    }

    rows.push(...(data as PlaceRow[]));

    if (data.length < PLACES_PAGE_SIZE) {
      break;
    }

    offset += PLACES_PAGE_SIZE;
  }

  return rows;
}

async function fetchPlaceImageRows(client: NonNullable<ReturnType<typeof getSupabaseClient>>) {
  const rows: PlaceImageRow[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await client
      .from('place_images')
      .select(PLACE_IMAGE_SELECT)
      .order('place_id')
      .order('sort_order')
      .range(offset, offset + IMAGES_PAGE_SIZE - 1);

    if (error) {
      throw new PlacesFetchError(error.message);
    }

    if (!data?.length) {
      break;
    }

    rows.push(...(data as PlaceImageRow[]));

    if (data.length < IMAGES_PAGE_SIZE) {
      break;
    }

    offset += IMAGES_PAGE_SIZE;
  }

  return rows;
}

export async function fetchExplorePlaces(): Promise<ExplorePlace[]> {
  if (!isSupabaseConfigured) {
    return fallbackPlaces;
  }

  const client = getSupabaseClient();
  if (!client) {
    return fallbackPlaces;
  }

  const [placeRows, imageRows] = await Promise.all([
    fetchPublishedPlaceRows(client),
    fetchPlaceImageRows(client),
  ]);

  const imagesByPlaceId = groupImagesByPlaceId(imageRows);

  return placeRows.map((row) =>
    mapPlaceRowToExplorePlace({
      ...row,
      place_images: imagesByPlaceId.get(row.id) ?? [],
    }),
  );
}

export async function fetchExplorePlaceById(placeId: string): Promise<ExplorePlaceDetail | null> {
  if (!isSupabaseConfigured) {
    const fallback = fallbackPlaces.find((place) => place.id === placeId);
    if (!fallback) return null;

    return {
      ...fallback,
      images: [],
      highlights: [],
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from('places')
    .select(PLACE_DETAIL_SELECT)
    .eq('id', placeId)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    throw new PlacesFetchError(error.message);
  }

  if (!data) {
    return null;
  }

  const row = data as PlaceDetailRow;
  const enrichmentRow = Array.isArray(row.place_enrichments)
    ? row.place_enrichments[0]
    : row.place_enrichments;

  const enrichment = buildExplorePlaceEnrichment(row.place_type, enrichmentRow
    ? {
        enrichmentStatus: enrichmentRow.enrichment_status,
        enrichedAt: enrichmentRow.enriched_at,
        naverPlacePageUrl: enrichmentRow.naver_place_page_url ?? undefined,
        knownDataApplied: enrichmentRow.known_data_applied ?? undefined,
        poolData: enrichmentRow.pool_data,
        siteData: enrichmentRow.site_data,
        shopData: enrichmentRow.shop_data,
        notes: enrichmentRow.notes,
      }
    : null);

  const highlights = buildPlaceHighlights(row.place_type, enrichment);

  return mapPlaceRowToExplorePlaceDetail(row, enrichment, highlights);
}
