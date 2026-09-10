import { explorePlaces as fallbackPlaces } from '@/src/features/explore/mock-data';
import {
  mapPlaceRowToExplorePlace,
  mapPlaceRowToExplorePlaceDetail,
  type ExplorePlace,
  type ExplorePlaceDetail,
  type PlaceDetailRow,
  type PlaceRow,
} from '@/src/features/explore/types';
import { getSupabaseClient, isSupabaseConfigured } from '@/src/services/supabase';

const PLACES_PAGE_SIZE = 1000;

export class PlacesFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlacesFetchError';
  }
}

export async function fetchExplorePlaces(): Promise<ExplorePlace[]> {
  if (!isSupabaseConfigured) {
    return fallbackPlaces;
  }

  const client = getSupabaseClient();
  if (!client) {
    return fallbackPlaces;
  }

  const rows: PlaceRow[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await client
      .from('places')
      .select('id,name,place_type,address_line,region,city,latitude,longitude')
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

  return rows.map(mapPlaceRowToExplorePlace);
}

export async function fetchExplorePlaceById(placeId: string): Promise<ExplorePlaceDetail | null> {
  if (!isSupabaseConfigured) {
    const fallback = fallbackPlaces.find((place) => place.id === placeId);
    return fallback ?? null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from('places')
    .select(
      'id,name,place_type,address_line,region,city,latitude,longitude,phone,website,google_maps_url,naver_map_url,kakao_map_url,verification_status,verification_source_count,raw_category',
    )
    .eq('id', placeId)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    throw new PlacesFetchError(error.message);
  }

  if (!data) {
    return null;
  }

  return mapPlaceRowToExplorePlaceDetail(data as PlaceDetailRow);
}
