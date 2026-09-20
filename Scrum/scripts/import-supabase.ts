import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createClient } from '@supabase/supabase-js';

import { config, requireEnv } from '../src/config.js';
import type { PlaceEnrichment, EnrichmentSummary } from '../src/enrichment/types.js';
import { buildImportBundles } from '../src/import/merge-enrichment.js';
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

function toPlaceRow(bundle: ReturnType<typeof buildImportBundles>[number]) {
  const { place, enrichment } = bundle;
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
    short_description: enrichment.shortDescription?.value ?? null,
    raw_category: place.rawCategory ?? null,
    source_apis: place.sourceApis,
    merged_from_count: place.mergedFromCount,
    tags: place.tags,
    is_published: true,
    last_verified_at: enrichment.enrichedAt,
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

function toEnrichmentRow(enrichment: PlaceEnrichment) {
  return {
    place_id: enrichment.id,
    enrichment_status: enrichment.enrichmentStatus,
    enriched_at: enrichment.enrichedAt,
    naver_place_page_url: enrichment.naverPlacePageUrl ?? null,
    known_data_applied: enrichment.knownDataApplied ?? null,
    pool_data: enrichment.pool ?? null,
    site_data: enrichment.site ?? null,
    shop_data: enrichment.shop ?? null,
    sources_checked: enrichment.sourcesChecked,
    notes: enrichment.notes ?? null,
  };
}

function toImageRows(enrichment: PlaceEnrichment) {
  return enrichment.images.map((image, index) => ({
    place_id: enrichment.id,
    url: image.url,
    source: image.source,
    source_page_url: image.sourcePageUrl,
    caption: image.caption ?? null,
    is_primary: image.isPrimary ?? index === 0,
    sort_order: index,
  }));
}

async function importPlaces(fresh = false) {
  const { url, serviceRoleKey } = loadSupabaseConfig();
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const placesPath = join(config.outputDir, 'normalized', 'places.json');
  const enrichedPath = join(config.outputDir, 'enriched', 'places-enriched.json');
  const placesPayload = JSON.parse(readFileSync(placesPath, 'utf8')) as PlacesFile;
  const enrichedPayload = JSON.parse(readFileSync(enrichedPath, 'utf8')) as EnrichmentSummary;

  const bundles = buildImportBundles(placesPayload.places, enrichedPayload.items);

  if (bundles.length === 0) {
    throw new Error('No places found. Run `pnpm process:places` and `pnpm enrich:places` first.');
  }

  if (fresh) {
    const { error: deleteImagesError } = await supabase
      .from('place_images')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteImagesError) throw deleteImagesError;

    const { error: deleteEnrichmentError } = await supabase
      .from('place_enrichments')
      .delete()
      .neq('place_id', '00000000-0000-0000-0000-000000000000');
    if (deleteEnrichmentError) throw deleteEnrichmentError;

    const { error: deleteSourcesError } = await supabase
      .from('place_sources')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteSourcesError) throw deleteSourcesError;

    const { error: deletePlacesError } = await supabase
      .from('places')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deletePlacesError) throw deletePlacesError;
  }

  const batchSize = 50;
  let importedPlaces = 0;
  let importedSources = 0;
  let importedEnrichments = 0;
  let importedImages = 0;

  for (let index = 0; index < bundles.length; index += batchSize) {
    const batch = bundles.slice(index, index + batchSize);
    const placeRows = batch.map(toPlaceRow);
    const sourceRows = batch.flatMap((bundle) => toSourceRows(bundle.place));
    const enrichmentRows = batch.map((bundle) => toEnrichmentRow(bundle.enrichment));
    const imageRows = batch.flatMap((bundle) => toImageRows(bundle.enrichment));

    const { error: placeError } = await supabase.from('places').upsert(placeRows, {
      onConflict: 'id',
    });
    if (placeError) throw placeError;

    const { error: sourceError } = await supabase.from('place_sources').upsert(sourceRows, {
      onConflict: 'source_api,source_id',
    });
    if (sourceError) throw sourceError;

    const { error: enrichmentError } = await supabase.from('place_enrichments').upsert(enrichmentRows, {
      onConflict: 'place_id',
    });
    if (enrichmentError) throw enrichmentError;

    if (imageRows.length > 0) {
      const { error: imageError } = await supabase.from('place_images').upsert(imageRows, {
        onConflict: 'place_id,url',
      });
      if (imageError) throw imageError;
    }

    importedPlaces += batch.length;
    importedSources += sourceRows.length;
    importedEnrichments += enrichmentRows.length;
    importedImages += imageRows.length;
    console.log(`Imported ${importedPlaces}/${bundles.length} places...`);
  }

  console.log('Supabase import complete.');
  console.log(`- Places upserted: ${importedPlaces}`);
  console.log(`- Source records upserted: ${importedSources}`);
  console.log(`- Enrichment records upserted: ${importedEnrichments}`);
  console.log(`- Image records upserted: ${importedImages}`);
}

const fresh = process.argv.includes('--fresh');

importPlaces(fresh).catch((error) => {
  console.error('Import failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
