import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { config } from '../config.js';
import { loadAllCandidates } from './adapters.js';
import { deduplicateCandidates } from './dedup.js';
import type { NormalizedPlace, PipelineReport, PlaceType, VerificationStatus } from './types.js';
import { normalizePlaces } from './verify.js';

function countCandidatesByType<T extends { placeType: PlaceType }>(
  items: T[],
): Record<PlaceType, number> {
  return {
    shop: items.filter((item) => item.placeType === 'shop').length,
    pool: items.filter((item) => item.placeType === 'pool').length,
    site: items.filter((item) => item.placeType === 'site').length,
  };
}

function countVerification(places: NormalizedPlace[]): Record<VerificationStatus, number> {
  return {
    verified: places.filter((place) => place.verificationStatus === 'verified').length,
    partial: places.filter((place) => place.verificationStatus === 'partial').length,
    unverified: places.filter((place) => place.verificationStatus === 'unverified').length,
    disputed: places.filter((place) => place.verificationStatus === 'disputed').length,
  };
}

export function runPlacePipeline(outputDir = config.outputDir): {
  places: NormalizedPlace[];
  report: PipelineReport;
  outputPaths: { places: string; report: string };
} {
  const { candidates, inputCounts } = loadAllCandidates(outputDir);
  const deduped = deduplicateCandidates(candidates);
  const places = normalizePlaces(deduped);

  const report: PipelineReport = {
    processedAt: new Date().toISOString(),
    inputCounts,
    afterRelevanceFilter: countCandidatesByType(candidates),
    afterDedup: countCandidatesByType(places),
    verification: countVerification(places),
    outputTotal: places.length,
  };

  const normalizedDir = join(outputDir, 'normalized');
  mkdirSync(normalizedDir, { recursive: true });

  const placesPath = join(normalizedDir, 'places.json');
  const reportPath = join(normalizedDir, 'report.json');

  writeFileSync(
    placesPath,
    `${JSON.stringify({ meta: { processedAt: report.processedAt, total: places.length }, places }, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  return {
    places,
    report,
    outputPaths: { places: placesPath, report: reportPath },
  };
}
