import type { Confidence, NormalizedPlace, PlaceCandidate, VerificationStatus } from './types.js';
import type { SourceApi } from './types.js';
import { normalizeName, parseKoreanRegion, stablePlaceId } from './utils.js';

function uniqueApis(sources: PlaceCandidate['sources']): SourceApi[] {
  return [...new Set(sources.map((source) => source.api))];
}

function resolveVerification(sourceCount: number): VerificationStatus {
  if (sourceCount >= 2) {
    return 'verified';
  }
  if (sourceCount === 1) {
    return 'partial';
  }
  return 'unverified';
}

function resolveConfidence(
  verificationStatus: VerificationStatus,
  sourceCount: number,
): Confidence {
  if (verificationStatus === 'verified' && sourceCount >= 3) {
    return 'high';
  }
  if (verificationStatus === 'verified') {
    return 'medium';
  }
  if (verificationStatus === 'partial') {
    return 'low';
  }
  return 'low';
}

function buildTags(candidate: PlaceCandidate): string[] {
  const tags = new Set<string>([candidate.placeType]);
  if (candidate.rawCategory) {
    tags.add(candidate.rawCategory);
  }
  if (candidate.status === 'closed') {
    tags.add('closed');
  }
  return [...tags];
}

export function normalizePlace(candidate: PlaceCandidate): NormalizedPlace {
  const sourceApis = uniqueApis(candidate.sources);
  const verificationSourceCount = sourceApis.length;
  const verificationStatus = resolveVerification(verificationSourceCount);
  const confidence = resolveConfidence(verificationStatus, verificationSourceCount);
  const name = candidate.name.trim();
  const addressLine = candidate.address.trim();
  const { region, city } = parseKoreanRegion(addressLine);

  return {
    id: stablePlaceId(candidate.placeType, name, candidate.lat, candidate.lon),
    placeType: candidate.placeType,
    name,
    nameNormalized: normalizeName(name),
    countryCode: 'KR',
    region,
    city,
    addressLine,
    latitude: candidate.lat,
    longitude: candidate.lon,
    phone: candidate.phone,
    website: candidate.website,
    googleMapsUrl: candidate.googleMapsUrl,
    naverMapUrl: candidate.naverMapUrl,
    kakaoMapUrl: candidate.kakaoMapUrl,
    status: candidate.status,
    verificationStatus,
    verificationSourceCount,
    confidence,
    rawCategory: candidate.rawCategory,
    sourceApis,
    mergedFromCount: candidate.sources.length,
    tags: buildTags(candidate),
    sources: candidate.sources,
  };
}

export function normalizePlaces(candidates: PlaceCandidate[]): NormalizedPlace[] {
  return candidates
    .map(normalizePlace)
    .sort((a, b) => {
      if (a.placeType !== b.placeType) {
        return a.placeType.localeCompare(b.placeType);
      }
      return a.name.localeCompare(b.name, 'ko');
    });
}
