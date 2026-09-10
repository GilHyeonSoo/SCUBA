import { config, requireEnv } from '../config.js';
import { sleep, uniqueBy } from '../save-json.js';
import type { CollectionFile, GooglePlacesItem, PlaceCategory, SearchQuery } from '../types.js';

const PLACES_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

// Pro SKU fields only (excludes phone/website → Enterprise tier)
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.types',
  'places.googleMapsUri',
  'places.businessStatus',
].join(',');

async function searchText(query: SearchQuery, apiKey: string): Promise<GooglePlacesItem[]> {
  const response = await fetch(PLACES_TEXT_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: query.query,
      regionCode: 'KR',
      languageCode: 'ko',
      maxResultCount: 20,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Places search failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as {
    places?: Array<Omit<GooglePlacesItem, 'sourceQuery' | 'sourceCategory'>>;
  };

  return (data.places ?? []).map((place) => ({
    ...place,
    id: place.id ?? '',
    sourceQuery: query.query,
    sourceCategory: query.category,
  }));
}

export async function collectGooglePlaces(
  queries: SearchQuery[],
  category: PlaceCategory,
): Promise<CollectionFile<GooglePlacesItem>> {
  const apiKey = requireEnv(config.googlePlacesApiKey, 'GOOGLE_PLACES_API_KEY');
  const items: GooglePlacesItem[] = [];

  for (const query of queries) {
    const results = await searchText(query, apiKey);
    items.push(...results);
    await sleep(config.requestDelayMs);
  }

  const deduped = uniqueBy(items, (item) => item.id || `${item.formattedAddress}-${item.sourceQuery}`);

  return {
    meta: {
      api: 'google-places',
      category,
      fetchedAt: new Date().toISOString(),
      queryCount: queries.length,
      resultCount: deduped.length,
      notes: 'Google Places API (New) Text Search Pro SKU. Phone/website excluded to reduce billing tier.',
    },
    queries,
    items: deduped,
  };
}
