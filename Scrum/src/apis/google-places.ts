import { config, requireEnv } from '../config.js';
import { assertMapApiEnabled } from '../map-api-guard.js';
import {
  getGooglePlacesMaxBillableCalls,
  getGooglePlacesMaxPhotosPerPlace,
  getGooglePlacesMaxPlaces,
  GooglePlacesUsageTracker,
  isGooglePlacesApiEnabled,
  requireGooglePlacesConfirmation,
  estimateEnrichmentGoogleUsage,
  estimateTextSearchUsage,
} from '../google-places-guard.js';
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

async function searchText(
  query: SearchQuery,
  apiKey: string,
  tracker: GooglePlacesUsageTracker,
): Promise<GooglePlacesItem[]> {
  tracker.record('text_search');
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
  assertMapApiEnabled('fetch:google');
  const apiKey = requireEnv(config.googlePlacesApiKey, 'GOOGLE_PLACES_API_KEY');
  const limitedQueries = queries.slice(0, getGooglePlacesMaxPlaces());
  requireGooglePlacesConfirmation(
    'fetch:google',
    estimateTextSearchUsage(limitedQueries.length),
  );

  const tracker = new GooglePlacesUsageTracker(getGooglePlacesMaxBillableCalls());
  const items: GooglePlacesItem[] = [];

  for (const query of limitedQueries) {
    const results = await searchText(query, apiKey, tracker);
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
