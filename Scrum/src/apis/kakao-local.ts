import { config, requireEnv } from '../config.js';
import { assertMapApiEnabled, isKakaoLocalApiEnabled } from '../map-api-guard.js';
import { sleep, uniqueBy } from '../save-json.js';
import type { CollectionFile, KakaoLocalItem, PlaceCategory, SearchQuery } from '../types.js';

const KAKAO_KEYWORD_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';

async function searchKeyword(query: SearchQuery, restApiKey: string) {
  const url = new URL(KAKAO_KEYWORD_SEARCH_URL);
  url.searchParams.set('query', query.query);
  url.searchParams.set('size', '15');

  const response = await fetch(url, {
    headers: {
      Authorization: `KakaoAK ${restApiKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Kakao Local Search failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as {
    documents?: Array<Record<string, string>>;
  };

  return (data.documents ?? []).map((item) => ({
    id: item.id ?? '',
    place_name: item.place_name ?? '',
    category_name: item.category_name ?? '',
    category_group_code: item.category_group_code ?? '',
    phone: item.phone ?? '',
    address_name: item.address_name ?? '',
    road_address_name: item.road_address_name ?? '',
    x: item.x ?? '',
    y: item.y ?? '',
    place_url: item.place_url ?? '',
    sourceQuery: query.query,
    sourceCategory: query.category,
  }));
}

export async function collectKakaoLocal(
  queries: SearchQuery[],
  category: PlaceCategory,
): Promise<CollectionFile<KakaoLocalItem>> {
  assertMapApiEnabled('fetch:kakao');
  if (!isKakaoLocalApiEnabled()) {
    throw new Error(
      '[fetch:kakao] Kakao Local API calls are disabled. Set MAP_API_ENABLED=true and KAKAO_LOCAL_API_ENABLED=true to enable.',
    );
  }

  const restApiKey = requireEnv(config.kakaoRestApiKey, 'KAKAO_REST_API_KEY');
  const items: KakaoLocalItem[] = [];

  for (const query of queries) {
    const results = await searchKeyword(query, restApiKey);
    items.push(...results);
    await sleep(config.requestDelayMs);
  }

  const deduped = uniqueBy(items, (item) => item.id || `${item.place_name}-${item.x}-${item.y}`);

  return {
    meta: {
      api: 'kakao-local',
      category,
      fetchedAt: new Date().toISOString(),
      queryCount: queries.length,
      resultCount: deduped.length,
      notes: 'Kakao Local Keyword Search API. x/y are WGS84 longitude/latitude strings.',
    },
    queries,
    items: deduped,
  };
}
