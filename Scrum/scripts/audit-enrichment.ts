import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PlaceEnrichment } from '../src/enrichment/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const enrichedPath = resolve(__dirname, '../output/enriched/places-enriched.json');
const placesPath = resolve(__dirname, '../output/normalized/places.json');
const reportPath = resolve(__dirname, '../output/enriched/audit-report.json');

const data = JSON.parse(readFileSync(enrichedPath, 'utf8'));
const items: PlaceEnrichment[] = data.items;
const places = JSON.parse(readFileSync(placesPath, 'utf8')).places as Array<{ id: string; name: string }>;
const placeById = new Map(places.map((p) => [p.id, p]));

const imgSources: Record<string, number> = {};
let totalImages = 0;
let placesWithImages = 0;
const socialViolations: string[] = [];
const invalidImageSources: string[] = [];
const fieldsMissingSource: string[] = [];
let poolShowerTrueCount = 0;
let poolDefaultAmenitiesCount = 0;
let verifiedKnownDataCount = 0;
let unverifiedShowerCount = 0;

for (const item of items) {
  if (item.images.length > 0) {
    placesWithImages++;
    totalImages += item.images.length;
    for (const img of item.images) {
      imgSources[img.source] = (imgSources[img.source] ?? 0) + 1;
      const lower = img.url.toLowerCase();
      if (
        lower.includes('instagram.com') ||
        lower.includes('facebook.com') ||
        lower.includes('blog.naver.com') ||
        lower.includes('cafe.naver.com')
      ) {
        socialViolations.push(`${item.id}: ${img.url}`);
      }
      if (!['official_website', 'google_places', 'naver_place'].includes(img.source)) {
        invalidImageSources.push(`${item.id}: ${img.source}`);
      }
    }
  }

  if (item.pool?.shower?.value === true) {
    poolShowerTrueCount++;
    if (!item.pool.shower.verified) unverifiedShowerCount++;
  }
  if (
    item.pool?.parking?.value === true &&
    item.pool?.shower?.value === true &&
    item.pool?.equipmentRental?.value === true &&
    item.pool?.airFill?.value === true
  ) {
    poolDefaultAmenitiesCount++;
  }
  if (item.knownDataApplied?.verified) verifiedKnownDataCount++;

  for (const section of [item.pool, item.site, item.shop]) {
    if (!section) continue;
    for (const [key, value] of Object.entries(section)) {
      if (value && typeof value === 'object' && 'value' in value && !value.sourceUrl) {
        fieldsMissingSource.push(`${item.id}.${key}`);
      }
    }
  }
}

const enrichedIds = new Set(items.map((i) => i.id));
const missingIds = places.filter((p) => !enrichedIds.has(p.id)).map((p) => p.id);

const statusCounts: Record<string, number> = {};
for (const item of items) {
  statusCounts[item.enrichmentStatus] = (statusCounts[item.enrichmentStatus] ?? 0) + 1;
}

const samplesWithImages = items
  .filter((i) => i.images.length >= 2)
  .slice(0, 3)
  .map((i) => ({
    name: placeById.get(i.id)?.name,
    placeType: i.placeType,
    enrichmentStatus: i.enrichmentStatus,
    imageCount: i.images.length,
    sources: i.images.map((img) => img.source),
  }));

const notFoundSamples = items
  .filter((i) => i.enrichmentStatus === 'not_found')
  .slice(0, 10)
  .map((i) => placeById.get(i.id)?.name ?? i.id);

const report = {
  auditedAt: new Date().toISOString(),
  coverage: {
    inputPlaces: places.length,
    enrichedPlaces: items.length,
    missingCount: missingIds.length,
    missingIds: missingIds.slice(0, 20),
  },
  statusCounts,
  images: {
    placesWithImages,
    totalImages,
    bySource: imgSources,
    socialViolations: socialViolations.length,
    invalidImageSources: invalidImageSources.length,
    socialViolationSamples: socialViolations.slice(0, 5),
  },
  dataQualityFlags: {
    poolShowerTrueCount,
    unverifiedShowerCount,
    poolDefaultAmenitiesBundleCount: poolDefaultAmenitiesCount,
    verifiedKnownDataCount,
    fieldsMissingSourceCount: fieldsMissingSource.length,
    note:
      'unverifiedShowerCount should be low after v2 — shower is only set when explicitly mentioned or from verified KNOWN_POOLS profiles',
  },
  samplesWithImages,
  notFoundSamples,
  reviewerVerdict: {
    coveragePass: missingIds.length === 0 && items.length === places.length,
    imageSourcePolicyPass: socialViolations.length === 0 && invalidImageSources.length === 0,
    attributionPass: fieldsMissingSource.length === 0,
    naverPlaceImagesCollected: (imgSources.naver_place ?? 0) > 0,
    concerns: [
      ...(imgSources.naver_place ? [] : ['No naver_place images collected — Naver may block automated page fetches']),
      ...(unverifiedShowerCount > 20
        ? [`${unverifiedShowerCount} pools still have unverified shower=true values`]
        : []),
      ...(poolDefaultAmenitiesCount > 20
        ? [`${poolDefaultAmenitiesCount} pools have bundled amenity defaults that may be over-assumed`]
        : []),
    ],
  },
};

writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
