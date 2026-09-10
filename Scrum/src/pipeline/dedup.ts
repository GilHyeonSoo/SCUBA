import type { PlaceCandidate, PlaceType } from './types.js';
import { haversineMeters, nameSimilarity, pickBestAddress, pickBestName } from './utils.js';

const MERGE_RADIUS_METERS: Record<PlaceType, number> = {
  shop: 80,
  pool: 80,
  site: 150,
};

const NAME_SIMILARITY_THRESHOLD = 0.52;

function mergeCandidateFields(target: PlaceCandidate, incoming: PlaceCandidate): PlaceCandidate {
  const names = [target.name, incoming.name];
  const addresses = [target.address, incoming.address];

  const mergedSources = [...target.sources];
  for (const source of incoming.sources) {
    const exists = mergedSources.some(
      (entry) => entry.api === source.api && entry.sourceId === source.sourceId,
    );
    if (!exists) {
      mergedSources.push(source);
    }
  }

  const lat =
    mergedSources.length > 1
      ? (target.lat + incoming.lat) / 2
      : target.lat;
  const lon =
    mergedSources.length > 1
      ? (target.lon + incoming.lon) / 2
      : target.lon;

  const status =
    target.status === 'closed' || incoming.status === 'closed'
      ? 'closed'
      : target.status === 'active' || incoming.status === 'active'
        ? 'active'
        : 'unknown';

  return {
    placeType: target.placeType,
    name: pickBestName(names),
    address: pickBestAddress(addresses),
    lat,
    lon,
    phone: target.phone ?? incoming.phone,
    website: target.website ?? incoming.website,
    googleMapsUrl: target.googleMapsUrl ?? incoming.googleMapsUrl,
    naverMapUrl: target.naverMapUrl ?? incoming.naverMapUrl,
    kakaoMapUrl: target.kakaoMapUrl ?? incoming.kakaoMapUrl,
    rawCategory: target.rawCategory ?? incoming.rawCategory,
    status,
    sources: mergedSources,
  };
}

function shouldMerge(a: PlaceCandidate, b: PlaceCandidate): boolean {
  if (a.placeType !== b.placeType) {
    return false;
  }

  const distance = haversineMeters(a.lat, a.lon, b.lat, b.lon);
  if (distance > MERGE_RADIUS_METERS[a.placeType]) {
    return false;
  }

  const similarity = nameSimilarity(a.name, b.name);
  if (similarity >= NAME_SIMILARITY_THRESHOLD) {
    return true;
  }

  // Allow looser merge when addresses strongly overlap.
  if (distance <= 35 && a.address && b.address) {
    const left = a.address.replace(/\s+/g, '');
    const right = b.address.replace(/\s+/g, '');
    if (left.includes(right.slice(0, 12)) || right.includes(left.slice(0, 12))) {
      return true;
    }
  }

  return false;
}

export function deduplicateCandidates(candidates: PlaceCandidate[]): PlaceCandidate[] {
  const merged: PlaceCandidate[] = [];

  for (const candidate of candidates) {
    let matchIndex = -1;

    for (let index = 0; index < merged.length; index += 1) {
      if (shouldMerge(merged[index], candidate)) {
        matchIndex = index;
        break;
      }
    }

    if (matchIndex === -1) {
      merged.push(candidate);
      continue;
    }

    merged[matchIndex] = mergeCandidateFields(merged[matchIndex], candidate);
  }

  return merged;
}
