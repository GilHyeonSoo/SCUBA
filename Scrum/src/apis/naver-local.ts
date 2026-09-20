import { config, requireEnv } from '../config.js';
import { assertMapApiEnabled, isNaverLocalApiEnabled } from '../map-api-guard.js';
import { sleep, uniqueBy } from '../save-json.js';
import type { CollectionFile, NaverLocalItem, PlaceCategory, SearchQuery } from '../types.js';

const NAVER_LOCAL_SEARCH_URL = 'https://openapi.naver.com/v1/search/local.json';

async function searchLocal(query: SearchQuery, clientId: string, clientSecret: string) {
  const url = new URL(NAVER_LOCAL_SEARCH_URL);
  url.searchParams.set('query', query.query);
  url.searchParams.set('display', '20');
  url.searchParams.set('start', '1');
  url.searchParams.set('sort', 'random');

  const response = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Naver Local Search failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as {
    items?: Array<Record<string, string>>;
  };

  return (data.items ?? []).map((item) => ({
    title: stripHtml(item.title ?? ''),
    link: item.link ?? '',
    category: item.category ?? '',
    description: stripHtml(item.description ?? ''),
    telephone: item.telephone ?? '',
    address: item.address ?? '',
    roadAddress: item.roadAddress ?? '',
    mapx: item.mapx ?? '',
    mapy: item.mapy ?? '',
    sourceQuery: query.query,
    sourceCategory: query.category,
  }));
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, '');
}

export async function collectNaverLocal(
  queries: SearchQuery[],
  category: PlaceCategory,
): Promise<CollectionFile<NaverLocalItem>> {
  assertMapApiEnabled('fetch:naver');
  if (!isNaverLocalApiEnabled()) {
    throw new Error(
      '[fetch:naver] Naver Local API calls are disabled. Set MAP_API_ENABLED=true and NAVER_LOCAL_API_ENABLED=true to enable.',
    );
  }

  const clientId = requireEnv(config.naverClientId, 'NAVER_CLIENT_ID');
  const clientSecret = requireEnv(config.naverClientSecret, 'NAVER_CLIENT_SECRET');
  const items: NaverLocalItem[] = [];

  for (const query of queries) {
    const results = await searchLocal(query, clientId, clientSecret);
    items.push(...results);
    await sleep(config.requestDelayMs);
  }

  const deduped = uniqueBy(
    items,
    (item) => `${item.title}-${item.roadAddress || item.address}-${item.mapx}-${item.mapy}`,
  );

  return {
    meta: {
      api: 'naver-local',
      category,
      fetchedAt: new Date().toISOString(),
      queryCount: queries.length,
      resultCount: deduped.length,
      notes: 'Naver Local Search API. mapx/mapy are KATECH coordinates.',
    },
    queries,
    items: deduped,
  };
}
