import { sleep, uniqueBy } from '../save-json.js';
import type { CollectionFile, OverpassOsmItem, PlaceCategory } from '../types.js';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

type OverpassQuerySpec = {
  category: PlaceCategory;
  label: string;
  query: string;
};

const overpassQueries: OverpassQuerySpec[] = [
  {
    category: 'dive-shops',
    label: 'leisure=dive_centre',
    query: `
[out:json][timeout:120];
area["ISO3166-1"="KR"]->.kr;
(
  node["leisure"="dive_centre"](area.kr);
  way["leisure"="dive_centre"](area.kr);
  node["shop"="scuba_diving"](area.kr);
  way["shop"="scuba_diving"](area.kr);
);
out center tags;
`,
  },
  {
    category: 'dive-pools',
    label: 'sport=scuba_diving + pool context',
    query: `
[out:json][timeout:120];
area["ISO3166-1"="KR"]->.kr;
(
  node["sport"="scuba_diving"]["leisure"="swimming_pool"](area.kr);
  way["sport"="scuba_diving"]["leisure"="swimming_pool"](area.kr);
  node["name"~"잠수풀|다이빙풀",i](area.kr);
  way["name"~"잠수풀|다이빙풀",i](area.kr);
);
out center tags;
`,
  },
  {
    category: 'dive-sites',
    label: 'sport=scuba_diving + dive site names',
    query: `
[out:json][timeout:120];
area["ISO3166-1"="KR"]->.kr;
(
  node["sport"="scuba_diving"]["natural"](area.kr);
  way["sport"="scuba_diving"]["natural"](area.kr);
  node["name"~"다이빙|스쿠버|잠수",i]["natural"](area.kr);
  way["name"~"다이빙|스쿠버|잠수",i]["natural"](area.kr);
  node["seamark:type"="diving"](area.kr);
  way["seamark:type"="diving"](area.kr);
);
out center tags;
`,
  },
];

function toOsmItem(
  element: Record<string, unknown>,
  category: PlaceCategory,
  sourceQuery: string,
): OverpassOsmItem | null {
  const type = element.type as 'node' | 'way' | 'relation' | undefined;
  const id = element.id as number | undefined;
  const tags = (element.tags as Record<string, string> | undefined) ?? {};

  if (!type || !id) {
    return null;
  }

  const lat =
    typeof element.lat === 'number'
      ? element.lat
      : typeof (element.center as { lat?: number } | undefined)?.lat === 'number'
        ? (element.center as { lat: number }).lat
        : null;

  const lon =
    typeof element.lon === 'number'
      ? element.lon
      : typeof (element.center as { lon?: number } | undefined)?.lon === 'number'
        ? (element.center as { lon: number }).lon
        : null;

  return {
    osmType: type,
    osmId: id,
    lat,
    lon,
    tags,
    sourceCategory: category,
    sourceQuery,
  };
}

async function runOverpassQuery(spec: OverpassQuerySpec): Promise<OverpassOsmItem[]> {
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Accept: 'application/json',
          'User-Agent': 'SCUBA-Scrum-DataCollector/1.0 (contact: local-dev)',
        },
        body: `data=${encodeURIComponent(spec.query.trim())}`,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Overpass API failed (${response.status}) for ${spec.label}: ${body}`);
      }

      const data = (await response.json()) as {
        elements?: Array<Record<string, unknown>>;
      };

      return (data.elements ?? [])
        .map((element) => toOsmItem(element, spec.category, spec.label))
        .filter((item): item is OverpassOsmItem => item !== null);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error(`Overpass API failed for ${spec.label}`);
}

export async function collectOverpassByCategory(
  category: PlaceCategory,
): Promise<CollectionFile<OverpassOsmItem>> {
  const specs = overpassQueries.filter((spec) => spec.category === category);
  const items: OverpassOsmItem[] = [];

  for (const spec of specs) {
    const results = await runOverpassQuery(spec);
    items.push(...results);
    await sleep(1000);
  }

  const deduped = uniqueBy(items, (item) => `${item.osmType}-${item.osmId}`);

  return {
    meta: {
      api: 'overpass-osm',
      category,
      fetchedAt: new Date().toISOString(),
      queryCount: specs.length,
      resultCount: deduped.length,
      notes: 'OpenStreetMap Overpass API. No API key required. Coverage varies by region.',
    },
    queries: specs.map((spec) => ({
      query: spec.label,
      category,
    })),
    items: deduped,
  };
}

export async function collectAllOverpass(): Promise<CollectionFile<OverpassOsmItem>[]> {
  const categories: PlaceCategory[] = ['dive-shops', 'dive-pools', 'dive-sites'];
  const results: CollectionFile<OverpassOsmItem>[] = [];

  for (const category of categories) {
    results.push(await collectOverpassByCategory(category));
  }

  return results;
}
