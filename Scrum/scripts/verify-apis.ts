import { config, requireEnv } from '../src/config.js';
import { isGooglePlacesApiEnabled } from '../src/google-places-guard.js';
import { isKakaoLocalApiEnabled, isNaverLocalApiEnabled } from '../src/map-api-guard.js';

type CheckResult = {
  api: string;
  ok: boolean;
  message: string;
  sampleCount?: number;
};

async function checkGoogle(): Promise<CheckResult> {
  if (!isGooglePlacesApiEnabled()) {
    return {
      api: 'Google Places',
      ok: true,
      message: '건너뜀 (MAP_API_ENABLED / GOOGLE_PLACES_API_ENABLED=false)',
    };
  }

  try {
    const apiKey = requireEnv(config.googlePlacesApiKey, 'GOOGLE_PLACES_API_KEY');
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName',
      },
      body: JSON.stringify({
        textQuery: '제주 다이브샵',
        regionCode: 'KR',
        languageCode: 'ko',
        maxResultCount: 3,
      }),
    });

    if (!response.ok) {
      return {
        api: 'Google Places',
        ok: false,
        message: `HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`,
      };
    }

    const data = (await response.json()) as { places?: unknown[] };
    const count = data.places?.length ?? 0;

    return {
      api: 'Google Places',
      ok: true,
      message: '호출 성공',
      sampleCount: count,
    };
  } catch (error) {
    return {
      api: 'Google Places',
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkNaver(): Promise<CheckResult> {
  if (!isNaverLocalApiEnabled()) {
    return {
      api: 'Naver Local',
      ok: true,
      message: '건너뜀 (MAP_API_ENABLED / NAVER_LOCAL_API_ENABLED=false)',
    };
  }

  try {
    const clientId = requireEnv(config.naverClientId, 'NAVER_CLIENT_ID');
    const clientSecret = requireEnv(config.naverClientSecret, 'NAVER_CLIENT_SECRET');
    const url = new URL('https://openapi.naver.com/v1/search/local.json');
    url.searchParams.set('query', '제주 다이브샵');
    url.searchParams.set('display', '3');

    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      return {
        api: 'Naver Local',
        ok: false,
        message: `HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`,
      };
    }

    const data = (await response.json()) as { items?: unknown[] };
    const count = data.items?.length ?? 0;

    return {
      api: 'Naver Local',
      ok: true,
      message: '호출 성공',
      sampleCount: count,
    };
  } catch (error) {
    return {
      api: 'Naver Local',
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkKakao(): Promise<CheckResult> {
  if (!isKakaoLocalApiEnabled()) {
    return {
      api: 'Kakao Local',
      ok: true,
      message: '건너뜀 (MAP_API_ENABLED / KAKAO_LOCAL_API_ENABLED=false)',
    };
  }

  try {
    const restApiKey = requireEnv(config.kakaoRestApiKey, 'KAKAO_REST_API_KEY');
    const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
    url.searchParams.set('query', '제주 다이브샵');
    url.searchParams.set('size', '3');

    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${restApiKey}`,
      },
    });

    if (!response.ok) {
      return {
        api: 'Kakao Local',
        ok: false,
        message: `HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`,
      };
    }

    const data = (await response.json()) as { documents?: unknown[] };
    const count = data.documents?.length ?? 0;

    return {
      api: 'Kakao Local',
      ok: true,
      message: '호출 성공',
      sampleCount: count,
    };
  } catch (error) {
    return {
      api: 'Kakao Local',
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkOverpass(): Promise<CheckResult> {
  try {
    const query = `
[out:json][timeout:30];
area["ISO3166-1"="KR"]->.kr;
node["shop"="scuba_diving"](area.kr);
out center tags 3;
`;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json',
        'User-Agent': 'SCUBA-Scrum-DataCollector/1.0 (verify)',
      },
      body: `data=${encodeURIComponent(query.trim())}`,
    });

    if (!response.ok) {
      return {
        api: 'Overpass OSM',
        ok: false,
        message: `HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`,
      };
    }

    const data = (await response.json()) as { elements?: unknown[] };
    const count = data.elements?.length ?? 0;

    return {
      api: 'Overpass OSM',
      ok: true,
      message: '호출 성공 (키 불필요)',
      sampleCount: count,
    };
  } catch (error) {
    return {
      api: 'Overpass OSM',
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const results = await Promise.all([
    checkGoogle(),
    checkNaver(),
    checkKakao(),
    checkOverpass(),
  ]);

  for (const result of results) {
    const status = result.ok ? 'OK' : 'FAIL';
    const count =
      typeof result.sampleCount === 'number' ? ` (샘플 ${result.sampleCount}건)` : '';
    console.log(`[${status}] ${result.api}: ${result.message}${count}`);
  }

  const failed = results.filter((result) => !result.ok);
  process.exitCode = failed.length > 0 ? 1 : 0;
}

main();
