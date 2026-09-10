import { createHash } from 'node:crypto';

const DIVE_KEYWORDS = [
  '다이브',
  '다이빙',
  '스쿠버',
  '스킨스쿠버',
  '잠수',
  '프리다이빙',
  '스쿠버다이빙',
  'dive',
  'diving',
  'scuba',
  'freediv',
];

const POOL_KEYWORDS = ['잠수풀', '다이빙풀', 'diving pool', 'scuba pool'];

const SITE_KEYWORDS = ['포인트', '다이빙포인트', '잠수포인트', '해안', '섬', 'dive site', 'reef'];

const EXCLUDE_KEYWORDS = [
  '다이어트',
  '미용',
  '피부',
  '체형관리',
  '헬스',
  '피트니스',
  'pt',
  '요가',
  '필라테스',
  '네일',
  '마사지',
];

export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}

export function normalizeName(value: string): string {
  return stripHtml(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .trim();
}

export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

export function nameSimilarity(a: string, b: string): number {
  const left = normalizeName(a);
  const right = normalizeName(b);

  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  if (left.includes(right) || right.includes(left)) {
    return 0.85;
  }

  const leftTokens = new Set(left.match(/[\p{L}\p{N}]{2,}/gu) ?? []);
  const rightTokens = new Set(right.match(/[\p{L}\p{N}]{2,}/gu) ?? []);
  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / Math.max(leftTokens.size, rightTokens.size);
}

export function isInKoreaBBox(lat: number, lon: number): boolean {
  return lat >= 33 && lat <= 39.5 && lon >= 124 && lon <= 132.5;
}

export function parseKoreanRegion(address: string): { region?: string; city?: string } {
  const trimmed = address.trim();
  const regionMatch = trimmed.match(/^([^\s]+(?:특별자치도|특별자치시|특별시|광역시|도))/);
  if (!regionMatch) {
    return {};
  }

  const region = regionMatch[1];
  const rest = trimmed.slice(region.length).trim();
  const cityMatch = rest.match(/^([^\s]+(?:시|군|구))/);
  return {
    region,
    city: cityMatch?.[1],
  };
}

function containsKeyword(haystack: string, keywords: string[]): boolean {
  const lower = haystack.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

export function isRelevantCandidate(
  placeType: 'shop' | 'pool' | 'site',
  name: string,
  category?: string,
): boolean {
  const haystack = `${name} ${category ?? ''}`;

  if (containsKeyword(haystack, EXCLUDE_KEYWORDS)) {
    const poolException =
      placeType === 'pool' &&
      (haystack.includes('잠수풀') || haystack.includes('다이빙풀'));
    if (!poolException) {
      return false;
    }
  }

  if (containsKeyword(haystack, DIVE_KEYWORDS)) {
    return true;
  }

  if (placeType === 'pool') {
    if (containsKeyword(haystack, POOL_KEYWORDS)) {
      return true;
    }
    return containsKeyword(haystack, DIVE_KEYWORDS);
  }

  if (placeType === 'site') {
    return containsKeyword(haystack, SITE_KEYWORDS);
  }

  return placeType === 'shop';
}

export function stablePlaceId(
  placeType: string,
  name: string,
  lat: number,
  lon: number,
): string {
  const key = `${placeType}|${normalizeName(name)}|${lat.toFixed(4)}|${lon.toFixed(4)}`;
  const hash = createHash('sha256').update(key).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function pickBestName(names: string[]): string {
  const cleaned = names.map(stripHtml).filter(Boolean);
  if (cleaned.length === 0) {
    return '이름 없음';
  }

  return cleaned.sort((a, b) => b.length - a.length)[0];
}

export function pickBestAddress(addresses: string[]): string {
  const cleaned = addresses.map((value) => value.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return '';
  }

  const road = cleaned.find((value) => value.includes('로 ') || value.includes('길 '));
  return road ?? cleaned[0];
}

export function naverToWgs84(mapx: string, mapy: string): { lat: number; lon: number } | null {
  const lon = Number(mapx) / 10_000_000;
  const lat = Number(mapy) / 10_000_000;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  return { lat, lon };
}
