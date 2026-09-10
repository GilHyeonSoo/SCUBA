import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type {
  CollectionFile,
  GooglePlacesItem,
  KakaoLocalItem,
  NaverLocalItem,
  OverpassOsmItem,
  PlaceCategory,
} from '../types.js';
import type { PlaceCandidate, PlaceType, SourceApi, SourceRecord } from './types.js';
import { CATEGORY_TO_PLACE_TYPE } from './types.js';
import {
  isInKoreaBBox,
  isRelevantCandidate,
  naverToWgs84,
  pickBestAddress,
  stripHtml,
} from './utils.js';

const API_DIRS: Record<SourceApi, string> = {
  'google-places': 'google-places',
  'naver-local': 'naver-local',
  'kakao-local': 'kakao-local',
  'overpass-osm': 'overpass-osm',
};

const CATEGORY_FILES: PlaceCategory[] = ['dive-shops', 'dive-pools', 'dive-sites'];

function loadCollection<TItem>(outputDir: string, api: SourceApi, category: PlaceCategory) {
  const filePath = join(outputDir, API_DIRS[api], `${category}.json`);
  const raw = readFileSync(filePath, 'utf8');
  return JSON.parse(raw) as CollectionFile<TItem>;
}

function googleStatus(businessStatus?: string): PlaceCandidate['status'] {
  if (businessStatus === 'CLOSED_PERMANENTLY' || businessStatus === 'CLOSED_TEMPORARILY') {
    return 'closed';
  }
  if (businessStatus === 'OPERATIONAL') {
    return 'active';
  }
  return 'unknown';
}

function adaptGoogle(
  item: GooglePlacesItem,
  fetchedAt: string,
): PlaceCandidate | null {
  const lat = item.location?.latitude;
  const lon = item.location?.longitude;
  const name = item.displayName?.text?.trim();

  if (!name || lat == null || lon == null || !isInKoreaBBox(lat, lon)) {
    return null;
  }

  const placeType = CATEGORY_TO_PLACE_TYPE[item.sourceCategory];
  if (!isRelevantCandidate(placeType, name)) {
    return null;
  }

  const source: SourceRecord = {
    api: 'google-places',
    sourceId: item.id,
    sourceUrl: item.googleMapsUri,
    sourceQuery: item.sourceQuery,
    fetchedAt,
    raw: item,
  };

  return {
    placeType,
    name,
    address: item.formattedAddress ?? '',
    lat,
    lon,
    googleMapsUrl: item.googleMapsUri,
    status: googleStatus(item.businessStatus),
    sources: [source],
  };
}

function adaptNaver(item: NaverLocalItem, fetchedAt: string): PlaceCandidate | null {
  const coords = naverToWgs84(item.mapx, item.mapy);
  const name = stripHtml(item.title);
  const address = pickBestAddress([item.roadAddress, item.address]);
  const category = stripHtml(item.category);

  if (!name || !coords || !isInKoreaBBox(coords.lat, coords.lon)) {
    return null;
  }

  const placeType = CATEGORY_TO_PLACE_TYPE[item.sourceCategory];
  if (!isRelevantCandidate(placeType, name, category)) {
    return null;
  }

  const source: SourceRecord = {
    api: 'naver-local',
    sourceId: `${item.mapx}:${item.mapy}:${normalizeSourceKey(name)}`,
    sourceUrl: item.link,
    sourceQuery: item.sourceQuery,
    fetchedAt,
    raw: item,
  };

  return {
    placeType,
    name,
    address,
    lat: coords.lat,
    lon: coords.lon,
    phone: item.telephone || undefined,
    website: item.link.startsWith('http') ? item.link : undefined,
    naverMapUrl: item.link,
    rawCategory: category,
    status: 'unknown',
    sources: [source],
  };
}

function adaptKakao(item: KakaoLocalItem, fetchedAt: string): PlaceCandidate | null {
  const lat = Number(item.y);
  const lon = Number(item.x);
  const name = item.place_name.trim();

  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon) || !isInKoreaBBox(lat, lon)) {
    return null;
  }

  const placeType = CATEGORY_TO_PLACE_TYPE[item.sourceCategory];
  if (!isRelevantCandidate(placeType, name, item.category_name)) {
    return null;
  }

  const source: SourceRecord = {
    api: 'kakao-local',
    sourceId: item.id,
    sourceUrl: item.place_url,
    sourceQuery: item.sourceQuery,
    fetchedAt,
    raw: item,
  };

  return {
    placeType,
    name,
    address: pickBestAddress([item.road_address_name, item.address_name]),
    lat,
    lon,
    phone: item.phone || undefined,
    kakaoMapUrl: item.place_url,
    rawCategory: item.category_name,
    status: 'unknown',
    sources: [source],
  };
}

function buildOverpassAddress(tags: Record<string, string>): string {
  const parts = [
    tags['addr:province'],
    tags['addr:city'],
    tags['addr:district'],
    tags['addr:town'],
    tags['addr:street'],
    tags['addr:housenumber'],
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(' ');
  }

  return tags['addr:full'] ?? tags.address ?? '';
}

function adaptOverpass(item: OverpassOsmItem, fetchedAt: string): PlaceCandidate | null {
  const lat = item.lat;
  const lon = item.lon;
  const name = item.tags.name ?? item.tags['name:ko'] ?? item.tags['name:en'];

  if (!name || lat == null || lon == null || !isInKoreaBBox(lat, lon)) {
    return null;
  }

  const placeType = CATEGORY_TO_PLACE_TYPE[item.sourceCategory];
  const category = item.tags.shop ?? item.tags.leisure ?? item.tags.natural ?? '';
  if (!isRelevantCandidate(placeType, name, category)) {
    return null;
  }

  const source: SourceRecord = {
    api: 'overpass-osm',
    sourceId: `${item.osmType}/${item.osmId}`,
    sourceQuery: item.sourceQuery,
    fetchedAt,
    raw: item,
  };

  const phone = item.tags.phone ?? item.tags['contact:phone'];
  const website = item.tags.website ?? item.tags['contact:website'];

  return {
    placeType,
    name,
    address: buildOverpassAddress(item.tags),
    lat,
    lon,
    phone,
    website,
    rawCategory: category,
    status: 'unknown',
    sources: [source],
  };
}

function normalizeSourceKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '');
}

export function loadAllCandidates(outputDir: string): {
  candidates: PlaceCandidate[];
  inputCounts: Record<SourceApi, Record<PlaceType, number>>;
} {
  const inputCounts: Record<SourceApi, Record<PlaceType, number>> = {
    'google-places': { shop: 0, pool: 0, site: 0 },
    'naver-local': { shop: 0, pool: 0, site: 0 },
    'kakao-local': { shop: 0, pool: 0, site: 0 },
    'overpass-osm': { shop: 0, pool: 0, site: 0 },
  };

  const candidates: PlaceCandidate[] = [];

  for (const category of CATEGORY_FILES) {
    const googleFile = loadCollection<GooglePlacesItem>(outputDir, 'google-places', category);
    for (const item of googleFile.items) {
      const adapted = adaptGoogle(item, googleFile.meta.fetchedAt);
      if (adapted) {
        inputCounts['google-places'][adapted.placeType] += 1;
        candidates.push(adapted);
      }
    }

    const naverFile = loadCollection<NaverLocalItem>(outputDir, 'naver-local', category);
    for (const item of naverFile.items) {
      const adapted = adaptNaver(item, naverFile.meta.fetchedAt);
      if (adapted) {
        inputCounts['naver-local'][adapted.placeType] += 1;
        candidates.push(adapted);
      }
    }

    const kakaoFile = loadCollection<KakaoLocalItem>(outputDir, 'kakao-local', category);
    for (const item of kakaoFile.items) {
      const adapted = adaptKakao(item, kakaoFile.meta.fetchedAt);
      if (adapted) {
        inputCounts['kakao-local'][adapted.placeType] += 1;
        candidates.push(adapted);
      }
    }

    const overpassFile = loadCollection<OverpassOsmItem>(outputDir, 'overpass-osm', category);
    for (const item of overpassFile.items) {
      const adapted = adaptOverpass(item, overpassFile.meta.fetchedAt);
      if (adapted) {
        inputCounts['overpass-osm'][adapted.placeType] += 1;
        candidates.push(adapted);
      }
    }
  }

  return { candidates, inputCounts };
}
