import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createClient } from '@supabase/supabase-js';

import { config, requireEnv } from '../src/config.js';
import type { NormalizedPlace } from '../src/pipeline/types.js';

type PlacesFile = {
  meta: { processedAt: string; total: number };
  places: NormalizedPlace[];
};

function loadSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  return {
    url: requireEnv(url, 'SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL'),
    serviceRoleKey: requireEnv(
      serviceRoleKey,
      'SUPABASE_SERVICE_ROLE_KEY (required for bulk import; find in Supabase Dashboard → Settings → API)',
    ),
  };
}

function toPlaceRow(place: NormalizedPlace) {
  return {
    id: place.id,
    place_type: place.placeType,
    name: place.name,
    name_normalized: place.nameNormalized,
    country_code: place.countryCode,
    region: place.region ?? null,
    city: place.city ?? null,
    address_line: place.addressLine || null,
    latitude: place.latitude,
    longitude: place.longitude,
    phone: place.phone ?? null,
    website: place.website ?? null,
    google_maps_url: place.googleMapsUrl ?? null,
    naver_map_url: place.naverMapUrl ?? null,
    kakao_map_url: place.kakaoMapUrl ?? null,
    status: place.status,
    verification_status: place.verificationStatus,
    verification_source_count: place.verificationSourceCount,
    confidence: place.confidence,
    raw_category: place.rawCategory ?? null,
    source_apis: place.sourceApis,
    merged_from_count: place.mergedFromCount,
    tags: place.tags,
    is_published: true,
    last_verified_at: new Date().toISOString(),
  };
}

function toSourceRows(place: NormalizedPlace) {
  return place.sources.map((source) => ({
    place_id: place.id,
    source_api: source.api,
    source_id: source.sourceId,
    source_url: source.sourceUrl ?? null,
    source_query: source.sourceQuery ?? null,
    raw_payload: source.raw,
    fetched_at: source.fetchedAt ?? null,
  }));
}

async function importPlaces(fresh = false) {
  const { url, serviceRoleKey } = loadSupabaseConfig();
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const filePath = join(config.outputDir, 'normalized', 'places.json');
  const payload = JSON.parse(readFileSync(filePath, 'utf8')) as PlacesFile;
  const places = payload.places;

  if (places.length === 0) {
    throw new Error('No places found. Run `pnpm process:places` first.');
  }

  if (fresh) {
    const { error: deleteSourcesError } = await supabase
      .from('place_sources')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteSourcesError) {
      throw deleteSourcesError;
    }

    const { error: deletePlacesError } = await supabase
      .from('places')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deletePlacesError) {
      throw deletePlacesError;
    }
  }

  const batchSize = 50;
  let importedPlaces = 0;
  let importedSources = 0;

  for (let index = 0; index < places.length; index += batchSize) {
    const batch = places.slice(index, index + batchSize);
    const placeRows = batch.map(toPlaceRow);
    const sourceRows = batch.flatMap(toSourceRows);

    const { error: placeError } = await supabase.from('places').upsert(placeRows, {
      onConflict: 'id',
    });
    if (placeError) {
      throw placeError;
    }

    const { error: sourceError } = await supabase.from('place_sources').upsert(sourceRows, {
      onConflict: 'source_api,source_id',
    });
    if (sourceError) {
      throw sourceError;
    }

    importedPlaces += batch.length;
    importedSources += sourceRows.length;
    console.log(`Imported ${importedPlaces}/${places.length} places...`);
  }

  console.log('Supabase import complete.');
  console.log(`- Places upserted: ${importedPlaces}`);
  console.log(`- Source records upserted: ${importedSources}`);
}

const fresh = process.argv.includes('--fresh');

importPlaces(fresh).catch((error) => {
  console.error('Import failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
