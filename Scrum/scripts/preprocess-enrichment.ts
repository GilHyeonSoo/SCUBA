import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  normalizeDepthRange,
  normalizeDifficulty,
  normalizeEnrichedImage,
  normalizeEnrichmentItem,
  normalizeFreeText,
  normalizeImageUrl,
  normalizeIsoTimestamp,
  normalizeOperatingHours,
  normalizePriceInfo,
  normalizeServices,
  normalizeVisibility,
  normalizeWaterTemperature,
} from '../src/enrichment/normalize-fields.js';
import type {
  EnrichmentFile,
  EnrichmentSummary,
  PlaceEnrichment,
} from '../src/enrichment/types.js';

type SampleDiff = {
  placeId: string;
  before: unknown;
  after: unknown;
};

type PreprocessStats = {
  totalPlaces: number;
  changedPlacesCount: number;
  unchangedPlacesCount: number;
  countsByType: {
    timestamps: number;
    operatingHours: number;
    priceInfo: number;
    depthRange: number;
    waterTemperature: number;
    visibility: number;
    difficulty: number;
    services: number;
    imageUrls: number;
    freeText: number;
  };
  samples: {
    timestamps: SampleDiff[];
    operatingHours: SampleDiff[];
    priceInfo: SampleDiff[];
    depthRange: SampleDiff[];
    waterTemperature: SampleDiff[];
    visibility: SampleDiff[];
    difficulty: SampleDiff[];
    services: SampleDiff[];
    imageUrls: SampleDiff[];
    freeText: SampleDiff[];
  };
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const enrichedDir = resolve(__dirname, '../output/enriched');
const placesEnrichedPath = resolve(enrichedDir, 'places-enriched.json');
const rawBackupPath = resolve(enrichedDir, 'places-enriched.raw.json');
const preprocessedPath = resolve(enrichedDir, 'places-enriched-preprocessed.json');
const reportPath = resolve(enrichedDir, 'preprocess-report.json');

function addSample(list: SampleDiff[], sample: SampleDiff, max = 5) {
  if (list.length < max) {
    list.push(sample);
  }
}

function run() {
  console.log('=== Place Enrichment Data Preprocessing ===\n');

  if (!existsSync(placesEnrichedPath)) {
    console.error(`Error: Enriched file not found at ${placesEnrichedPath}`);
    process.exit(1);
  }

  // 1. Backup raw original file if not exists
  if (!existsSync(rawBackupPath)) {
    copyFileSync(placesEnrichedPath, rawBackupPath);
    console.log(`[1/5] Backup created at: ${rawBackupPath}`);
  } else {
    console.log(`[1/5] Backup already exists at: ${rawBackupPath} (skipping overwrite)`);
  }

  // 2. Read places-enriched.json
  const rawContent = readFileSync(placesEnrichedPath, 'utf8');
  const summary: EnrichmentSummary = JSON.parse(rawContent);
  const items: PlaceEnrichment[] = summary.items;

  console.log(`[2/5] Loaded ${items.length} places from places-enriched.json`);

  const stats: PreprocessStats = {
    totalPlaces: items.length,
    changedPlacesCount: 0,
    unchangedPlacesCount: 0,
    countsByType: {
      timestamps: 0,
      operatingHours: 0,
      priceInfo: 0,
      depthRange: 0,
      waterTemperature: 0,
      visibility: 0,
      difficulty: 0,
      services: 0,
      imageUrls: 0,
      freeText: 0,
    },
    samples: {
      timestamps: [],
      operatingHours: [],
      priceInfo: [],
      depthRange: [],
      waterTemperature: [],
      visibility: [],
      difficulty: [],
      services: [],
      imageUrls: [],
      freeText: [],
    },
  };

  // 3. Preprocess every item and collect stats
  const normalizedItems: PlaceEnrichment[] = [];

  for (const item of items) {
    let itemChanged = false;

    // Check enrichedAt timestamp
    const normEnrichedAt = normalizeIsoTimestamp(item.enrichedAt);
    if (normEnrichedAt !== item.enrichedAt) {
      stats.countsByType.timestamps++;
      addSample(stats.samples.timestamps, {
        placeId: item.id,
        before: item.enrichedAt,
        after: normEnrichedAt,
      });
      itemChanged = true;
    }

    // Check shortDescription
    if (item.shortDescription) {
      const normVal = normalizeFreeText(item.shortDescription.value);
      if (normVal !== item.shortDescription.value) {
        stats.countsByType.freeText++;
        addSample(stats.samples.freeText, {
          placeId: item.id,
          before: item.shortDescription.value,
          after: normVal,
        });
        itemChanged = true;
      }
      const normCol = normalizeIsoTimestamp(item.shortDescription.collectedAt);
      if (normCol !== item.shortDescription.collectedAt) {
        stats.countsByType.timestamps++;
        addSample(stats.samples.timestamps, {
          placeId: item.id,
          before: item.shortDescription.collectedAt,
          after: normCol,
        });
        itemChanged = true;
      }
    }

    // Check phone
    if (item.phone) {
      const normCol = normalizeIsoTimestamp(item.phone.collectedAt);
      if (normCol !== item.phone.collectedAt) {
        stats.countsByType.timestamps++;
        itemChanged = true;
      }
    }

    // Check website
    if (item.website) {
      const normCol = normalizeIsoTimestamp(item.website.collectedAt);
      if (normCol !== item.website.collectedAt) {
        stats.countsByType.timestamps++;
        itemChanged = true;
      }
    }

    // Check images
    for (const img of item.images) {
      const normUrl = normalizeImageUrl(img.url);
      if (normUrl !== img.url) {
        stats.countsByType.imageUrls++;
        addSample(stats.samples.imageUrls, {
          placeId: item.id,
          before: img.url,
          after: normUrl,
        });
        itemChanged = true;
      }
      const normSourcePage = normalizeImageUrl(img.sourcePageUrl);
      if (normSourcePage !== img.sourcePageUrl) {
        stats.countsByType.imageUrls++;
        itemChanged = true;
      }
      if (img.caption) {
        const normCaption = normalizeFreeText(img.caption);
        if (normCaption !== img.caption) {
          stats.countsByType.freeText++;
          itemChanged = true;
        }
      }
    }

    // Check pool fields
    if (item.pool) {
      if (item.pool.operatingHours) {
        const normVal = normalizeOperatingHours(item.pool.operatingHours.value);
        if (JSON.stringify(normVal) !== JSON.stringify(item.pool.operatingHours.value)) {
          stats.countsByType.operatingHours++;
          addSample(stats.samples.operatingHours, {
            placeId: item.id,
            before: item.pool.operatingHours.value,
            after: normVal,
          });
          itemChanged = true;
        }
      }
      if (item.pool.priceInfo) {
        const normVal = normalizePriceInfo(item.pool.priceInfo.value);
        if (normVal !== item.pool.priceInfo.value) {
          stats.countsByType.priceInfo++;
          addSample(stats.samples.priceInfo, {
            placeId: item.id,
            before: item.pool.priceInfo.value,
            after: normVal,
          });
          itemChanged = true;
        }
      }
      if (item.pool.poolSize) {
        const normVal = normalizeFreeText(item.pool.poolSize.value);
        if (normVal !== item.pool.poolSize.value) {
          stats.countsByType.freeText++;
          itemChanged = true;
        }
      }
      if (item.pool.reservationMethod) {
        const normVal = normalizeFreeText(item.pool.reservationMethod.value);
        if (normVal !== item.pool.reservationMethod.value) {
          stats.countsByType.freeText++;
          itemChanged = true;
        }
      }

      // Check all pool collectedAt
      for (const key of Object.keys(item.pool) as (keyof typeof item.pool)[]) {
        const f = item.pool[key];
        if (f && typeof f === 'object' && 'collectedAt' in f) {
          const normCol = normalizeIsoTimestamp(f.collectedAt);
          if (normCol !== f.collectedAt) {
            stats.countsByType.timestamps++;
            itemChanged = true;
          }
        }
      }
    }

    // Check site fields
    if (item.site) {
      if (item.site.depthRangeM) {
        const normVal = normalizeDepthRange(item.site.depthRangeM.value);
        if (normVal !== item.site.depthRangeM.value) {
          stats.countsByType.depthRange++;
          addSample(stats.samples.depthRange, {
            placeId: item.id,
            before: item.site.depthRangeM.value,
            after: normVal,
          });
          itemChanged = true;
        }
      }
      if (item.site.waterTemperature) {
        const normVal = normalizeWaterTemperature(item.site.waterTemperature.value);
        if (normVal !== item.site.waterTemperature.value) {
          stats.countsByType.waterTemperature++;
          addSample(stats.samples.waterTemperature, {
            placeId: item.id,
            before: item.site.waterTemperature.value,
            after: normVal,
          });
          itemChanged = true;
        }
      }
      if (item.site.visibility) {
        const normVal = normalizeVisibility(item.site.visibility.value);
        if (normVal !== item.site.visibility.value) {
          stats.countsByType.visibility++;
          addSample(stats.samples.visibility, {
            placeId: item.id,
            before: item.site.visibility.value,
            after: normVal,
          });
          itemChanged = true;
        }
      }
      if (item.site.difficulty) {
        const normVal = normalizeDifficulty(item.site.difficulty.value);
        if (normVal !== item.site.difficulty.value) {
          stats.countsByType.difficulty++;
          addSample(stats.samples.difficulty, {
            placeId: item.id,
            before: item.site.difficulty.value,
            after: normVal,
          });
          itemChanged = true;
        }
      }
      if (item.site.accessType) {
        const normVal = normalizeFreeText(item.site.accessType.value);
        if (normVal !== item.site.accessType.value) {
          stats.countsByType.freeText++;
          itemChanged = true;
        }
      }
      if (item.site.currentInfo) {
        const normVal = normalizeFreeText(item.site.currentInfo.value);
        if (normVal !== item.site.currentInfo.value) {
          stats.countsByType.freeText++;
          itemChanged = true;
        }
      }

      for (const key of Object.keys(item.site) as (keyof typeof item.site)[]) {
        const f = item.site[key];
        if (f && typeof f === 'object' && 'collectedAt' in f) {
          const normCol = normalizeIsoTimestamp(f.collectedAt);
          if (normCol !== f.collectedAt) {
            stats.countsByType.timestamps++;
            itemChanged = true;
          }
        }
      }
    }

    // Check shop fields
    if (item.shop) {
      if (item.shop.services) {
        const normVal = normalizeServices(item.shop.services.value);
        if (JSON.stringify(normVal) !== JSON.stringify(item.shop.services.value)) {
          stats.countsByType.services++;
          addSample(stats.samples.services, {
            placeId: item.id,
            before: item.shop.services.value,
            after: normVal,
          });
          itemChanged = true;
        }
      }
      if (item.shop.operatingHours) {
        const normVal = normalizeOperatingHours(item.shop.operatingHours.value);
        if (JSON.stringify(normVal) !== JSON.stringify(item.shop.operatingHours.value)) {
          stats.countsByType.operatingHours++;
          addSample(stats.samples.operatingHours, {
            placeId: item.id,
            before: item.shop.operatingHours.value,
            after: normVal,
          });
          itemChanged = true;
        }
      }

      for (const key of Object.keys(item.shop) as (keyof typeof item.shop)[]) {
        const f = item.shop[key];
        if (f && typeof f === 'object' && 'collectedAt' in f) {
          const normCol = normalizeIsoTimestamp(f.collectedAt);
          if (normCol !== f.collectedAt) {
            stats.countsByType.timestamps++;
            itemChanged = true;
          }
        }
      }
    }

    if (item.notes) {
      const normVal = normalizeFreeText(item.notes);
      if (normVal !== item.notes) {
        stats.countsByType.freeText++;
        itemChanged = true;
      }
    }

    if (itemChanged) {
      stats.changedPlacesCount++;
    } else {
      stats.unchangedPlacesCount++;
    }

    // Perform actual normalization
    const normalizedItem = normalizeEnrichmentItem(item);
    normalizedItems.push(normalizedItem);
  }

  // 4. Write full preprocessed file & report
  const preprocessedSummary: EnrichmentSummary = {
    meta: {
      ...summary.meta,
      enrichedAt: normalizeIsoTimestamp(summary.meta.enrichedAt),
    },
    items: normalizedItems,
  };

  writeFileSync(preprocessedPath, JSON.stringify(preprocessedSummary, null, 2) + '\n', 'utf8');
  console.log(`[3/5] Written preprocessed dataset to: ${preprocessedPath}`);

  const report = {
    generatedAt: normalizeIsoTimestamp(new Date().toISOString()),
    summary: {
      totalPlaces: stats.totalPlaces,
      changedPlacesCount: stats.changedPlacesCount,
      unchangedPlacesCount: stats.unchangedPlacesCount,
      changedPercentage: `${((stats.changedPlacesCount / stats.totalPlaces) * 100).toFixed(1)}%`,
    },
    countsByType: stats.countsByType,
    samples: stats.samples,
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log(`[4/5] Written preprocessing report to: ${reportPath}`);

  // 5. Overwrite batch files batch-001..batch-023
  const batchFiles = readdirSync(enrichedDir)
    .filter((f) => f.startsWith('batch-') && f.endsWith('.json'))
    .sort();

  console.log(`[5/5] Overwriting ${batchFiles.length} batch files...`);
  for (const batchFile of batchFiles) {
    const batchPath = resolve(enrichedDir, batchFile);
    const batchData: EnrichmentFile = JSON.parse(readFileSync(batchPath, 'utf8'));
    batchData.meta.enrichedAt = normalizeIsoTimestamp(batchData.meta.enrichedAt);
    batchData.items = batchData.items.map((it) => normalizeEnrichmentItem(it));
    writeFileSync(batchPath, JSON.stringify(batchData, null, 2) + '\n', 'utf8');
  }
  console.log(`      Updated all ${batchFiles.length} batch files.`);

  // 6. Replace places-enriched.json with preprocessed version
  copyFileSync(preprocessedPath, placesEnrichedPath);
  console.log(`[Done] Replaced ${placesEnrichedPath} with normalized dataset.`);

  // 7. Output summary to stdout
  console.log('\n========================================');
  console.log('       PREPROCESSING SUMMARY REPORT     ');
  console.log('========================================');
  console.log(`Total places processed:     ${stats.totalPlaces}`);
  console.log(`Places with normalized data: ${stats.changedPlacesCount} (${report.summary.changedPercentage})`);
  console.log(`Unchanged places:           ${stats.unchangedPlacesCount}`);
  console.log('----------------------------------------');
  console.log('Normalized Field Counts:');
  console.log(`  - Operating Hours:        ${stats.countsByType.operatingHours}`);
  console.log(`  - Timestamps (ms trimmed): ${stats.countsByType.timestamps}`);
  console.log(`  - Services (canonical):   ${stats.countsByType.services}`);
  console.log(`  - Price Info:             ${stats.countsByType.priceInfo}`);
  console.log(`  - Depth Range:            ${stats.countsByType.depthRange}`);
  console.log(`  - Water Temperature:      ${stats.countsByType.waterTemperature}`);
  console.log(`  - Visibility:             ${stats.countsByType.visibility}`);
  console.log(`  - Difficulty:             ${stats.countsByType.difficulty}`);
  console.log(`  - Image URLs:             ${stats.countsByType.imageUrls}`);
  console.log(`  - Free Text Fields:       ${stats.countsByType.freeText}`);
  console.log('========================================\n');
}

run();
