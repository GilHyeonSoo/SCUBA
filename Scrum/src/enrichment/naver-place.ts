import { config } from '../config.js';
import { isNaverLocalApiEnabled } from '../map-api-guard.js';
import type { EnrichedImage } from './types.js';

export type NaverLocalCandidate = {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
};

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9',
};

function normalizeName(value: string): string {
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, '').toLowerCase();
}

export function isNaverPlaceUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('map.naver.com') || lower.includes('place.naver.com') || lower.includes('pcmap.place.naver.com');
}

export function isNaverPlaceDetailUrl(url: string): boolean {
  if (!isNaverPlaceUrl(url)) return false;
  const lower = url.toLowerCase();
  if (lower.includes('/p/search/')) return false;
  return /\/(place|restaurant|entry\/place)\/\d+/.test(lower);
}

const NAVER_PLACE_IMAGE_HOSTS = ['ldb-phinf.pstatic.net', 'phinf.pstatic.net', 'naverbooking.pstatic.net'];

const NAVER_PLACE_IMAGE_BLOCKLIST = [
  'og-map',
  'static/maps/assets',
  'maps-service.pstatic.net',
  'sstatic/search',
  'sstatic.map',
  'favicon',
  'icon',
  'sprite',
  'logo',
  'blank',
  'pcweb_navermap',
];

export function isNaverPlacePhotoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (!lower.startsWith('http')) return false;
  if (!NAVER_PLACE_IMAGE_HOSTS.some((host) => lower.includes(host))) return false;
  return !NAVER_PLACE_IMAGE_BLOCKLIST.some((token) => lower.includes(token));
}

export async function searchNaverLocalCandidates(
  query: string,
  display = 5,
): Promise<NaverLocalCandidate[]> {
  if (!isNaverLocalApiEnabled() || !config.naverClientId || !config.naverClientSecret) return [];
  try {
    const url = new URL('https://openapi.naver.com/v1/search/local.json');
    url.searchParams.set('query', query);
    url.searchParams.set('display', String(display));
    const res = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': config.naverClientId,
        'X-Naver-Client-Secret': config.naverClientSecret,
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: Array<Record<string, string>> };
    return (data.items ?? []).map((item) => ({
      title: item.title ?? '',
      link: item.link ?? '',
      category: item.category ?? '',
      description: item.description ?? '',
      telephone: item.telephone ?? '',
      address: item.address ?? '',
      roadAddress: item.roadAddress ?? '',
      mapx: item.mapx ?? '',
      mapy: item.mapy ?? '',
    }));
  } catch {
    return [];
  }
}

export function pickBestNaverMatch(
  placeName: string,
  addressLine?: string,
  candidates: NaverLocalCandidate[] = [],
): NaverLocalCandidate | null {
  if (candidates.length === 0) return null;
  const targetName = normalizeName(placeName);
  const targetAddress = normalizeName(addressLine ?? '');
  let best: { item: NaverLocalCandidate; score: number } | null = null;

  for (const item of candidates) {
    const title = normalizeName(item.title);
    let score = 0;
    if (title === targetName) score += 100;
    else if (title.includes(targetName) || targetName.includes(title)) score += 60;

    const address = normalizeName(item.roadAddress || item.address);
    if (targetAddress && address) {
      if (address === targetAddress) score += 40;
      else if (address.includes(targetAddress) || targetAddress.includes(address)) score += 20;
    }

    if (item.telephone) score += 5;
    if (!best || score > best.score) best = { item, score };
  }

  return best && best.score >= 40 ? best.item : candidates[0] ?? null;
}

export function resolveNaverPlacePageUrl(
  placeName: string,
  city?: string,
  region?: string,
  candidate?: NaverLocalCandidate | null,
  existingUrl?: string,
): string | null {
  if (existingUrl && isNaverPlaceUrl(existingUrl)) return existingUrl;
  if (candidate?.link && isNaverPlaceUrl(candidate.link)) return candidate.link;

  const query = `${placeName} ${city || region || ''}`.trim();
  if (!query) return null;
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}/place`;
}

function extractPlaceIdFromHtml(html: string): string | null {
  const patterns = [
    /"placeId":"(\d{5,})"/,
    /entry\/place\/(\d{5,})/,
    /\/place\/(\d{5,})\//,
    /\/restaurant\/(\d{5,})\//,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractNaverImagesFromHtml(html: string, pageUrl: string, placeName: string): EnrichedImage[] {
  const images: EnrichedImage[] = [];
  const seen = new Set<string>();

  const cdnMatches = html.matchAll(/https?:\/\/[a-z0-9.-]*pstatic\.net\/[^"'\\s<>]+/gi);
  for (const match of cdnMatches) {
    const url = match[0].replace(/\\u002F/g, '/').replace(/&amp;/g, '&');
    if (!isNaverPlacePhotoUrl(url) || seen.has(url)) continue;
    seen.add(url);
    images.push({
      url,
      source: 'naver_place',
      sourcePageUrl: pageUrl,
      caption: placeName,
      isPrimary: images.length === 0,
    });
    if (images.length >= 3) break;
  }

  return images;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        ...BROWSER_HEADERS,
        Referer: 'https://map.naver.com/',
      },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const html = await res.text();
    return html.length > 500 ? html : null;
  } catch {
    return null;
  }
}

export async function collectNaverPlaceImages(
  placeName: string,
  pageUrl: string,
  existingImageCount = 0,
): Promise<EnrichedImage[]> {
  if (!isNaverLocalApiEnabled()) return [];
  if (!pageUrl || !isNaverPlaceDetailUrl(pageUrl)) return [];

  let html = await fetchHtml(pageUrl);
  let images = html ? extractNaverImagesFromHtml(html, pageUrl, placeName) : [];

  if (images.length === 0 && html) {
    const placeId = extractPlaceIdFromHtml(html);
    if (placeId) {
      const detailUrls = [
        `https://pcmap.place.naver.com/place/${placeId}/photo`,
        `https://m.place.naver.com/place/${placeId}/photo`,
      ];
      for (const detailUrl of detailUrls) {
        const detailHtml = await fetchHtml(detailUrl);
        if (!detailHtml) continue;
        images = extractNaverImagesFromHtml(detailHtml, detailUrl, placeName);
        if (images.length > 0) break;
      }
    }
  }

  return images.slice(0, 3).map((img, index) => ({
    ...img,
    isPrimary: existingImageCount === 0 && index === 0,
  }));
}
