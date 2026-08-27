import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CHANNEL3_BASE_URL = 'https://api.trychannel3.com';
const CHANNEL3_PAGE_SIZE = 30;

const DIVING_BRAND_CATALOG: Array<{ slug: string; displayName: string }> = [
  { slug: 'scubapro', displayName: 'Scubapro' },
  { slug: 'aqualung', displayName: 'Aqualung' },
  { slug: 'mares', displayName: 'Mares' },
  { slug: 'cressi', displayName: 'Cressi' },
  { slug: 'suunto', displayName: 'Suunto' },
  { slug: 'shearwater', displayName: 'Shearwater' },
  { slug: 'oceanic', displayName: 'Oceanic' },
  { slug: 'garmin', displayName: 'Garmin' },
  { slug: 'atomic aquatics', displayName: 'Atomic Aquatics' },
  { slug: 'atomic', displayName: 'Atomic' },
  { slug: 'zeagle', displayName: 'Zeagle' },
  { slug: 'hollis', displayName: 'Hollis' },
  { slug: 'xdeep', displayName: 'XDeep' },
  { slug: 'apeks', displayName: 'Apeks' },
  { slug: 'fourth element', displayName: 'Fourth Element' },
  { slug: 'tusa', displayName: 'TUSA' },
  { slug: 'beuchat', displayName: 'Beuchat' },
  { slug: 'salvimar', displayName: 'Salvimar' },
  { slug: 'omersub', displayName: 'Omer' },
  { slug: 'seac', displayName: 'SEAC' },
  { slug: 'sporasub', displayName: 'Sporasub' },
  { slug: 'halcyon', displayName: 'Halcyon' },
  { slug: 'dive rite', displayName: 'Dive Rite' },
  { slug: 'diverite', displayName: 'Dive Rite' },
  { slug: 'waterproof', displayName: 'Waterproof' },
  { slug: 'bare', displayName: 'BARE' },
  { slug: 'henderson', displayName: 'Henderson' },
  { slug: 'ocean reef', displayName: 'Ocean Reef' },
  { slug: 'sherwood', displayName: 'Sherwood' },
  { slug: 'xs scuba', displayName: 'XS Scuba' },
  { slug: 'ist sports', displayName: 'IST' },
  { slug: 'rabighor', displayName: 'Rabighor' },
  { slug: 'aquatic', displayName: 'Aqua Lung' },
  { slug: 'northern diver', displayName: 'Northern Diver' },
  { slug: 'waterproof', displayName: 'Waterproof' },
];

const SCUBA_BRAND_QUERIES = [
  'Scubapro scuba regulator BCD',
  'Aqualung scuba diving equipment',
  'Cressi scuba mask fins BCD',
  'Mares scuba diving equipment',
  'Atomic Aquatics scuba regulator',
  'Shearwater dive computer',
  'Suunto dive computer scuba',
  'Tusa scuba mask snorkel fins',
  'Oceanic scuba dive computer',
  'Apeks scuba regulator',
  'Fourth Element scuba wetsuit',
  'Zeagle scuba BCD',
  'Hollis scuba diving',
  'Sherwood scuba regulator',
  'XS Scuba diving equipment',
];

const FREEDIVING_BRAND_QUERIES = [
  'Beuchat freediving fins wetsuit',
  'Salvimar freediving equipment',
  'Mares freediving fins',
  'Cressi freediving mask fins',
  'Omer freediving wetsuit',
  'SEAC freediving equipment',
  'Sporasub freediving fins',
];

const SCUBA_QUERIES = [
  ...SCUBA_BRAND_QUERIES,
  'scuba regulator first second stage',
  'scuba BCD buoyancy compensator jacket',
  'scuba dive computer wrist',
  'scuba wetsuit 3mm 5mm 7mm',
  'scuba drysuit diving',
  'scuba diving mask tempered glass',
  'scuba diving fins open heel',
  'scuba snorkel dry top',
  'scuba aluminum tank cylinder',
  'scuba SMB surface marker buoy',
  'scuba diving reel finger spool',
  'scuba dive light underwater torch',
  'scuba weight belt pockets',
  'scuba nitrox oxygen analyzer',
  'scuba dive boots booties neoprene',
  'scuba mesh gear bag backpack',
  'scuba dive knife titanium',
  'scuba pony bottle stage rigging',
];

const FREEDIVING_QUERIES = [
  ...FREEDIVING_BRAND_QUERIES,
  'freediving bi-fin fins',
  'freediving wetsuit open cell',
  'freediving low volume mask',
  'freediving snorkel',
  'freediving lanyard',
  'freediving weight belt neck',
  'freediving dive computer',
  'freediving monofin',
  'apnea freediving wetsuit',
  'freediving nose clip',
];

const GENERIC_UNKNOWN_TITLES = new Set([
  'scuba diving mask',
  'scuba mask',
  'diving mask',
  'scuba fins',
  'diving fins',
  'scuba snorkel',
  'scuba wetsuit',
  'diving wetsuit',
  'scuba bcd',
  'scuba regulator',
  'dive computer',
  'scuba tank',
  'weight belt',
  'scuba diving fins',
  'single-lens scuba mask',
  'focus adult size scuba mask',
]);

type DiveTypeFilter = 'all' | 'scuba' | 'freediving';

const JUNK_KEYWORDS = [
  'toy',
  'ornament',
  'decoration',
  'decor ',
  'sprinkler',
  'screwdriver',
  'hanger',
  'fish ornament',
  'bubble blower',
  'aquatic decor',
  'no fishing sign',
  'stem starter',
  'coral fish',
  'classic clip',
  'phillips',
  'flathead',
  'party favor',
  'cake topper',
  'plush',
  'stuffed animal',
  'keychain',
  'magnet',
  'poster',
  'sticker',
  'costume',
  'halloween',
  'pet ',
  'dog ',
  'cat ',
  'aquarium decoration',
  'fish tank decor',
];

const STRONG_EQUIPMENT_KEYWORDS = [
  'scuba diving',
  'freediving',
  'freedive',
  'bcd',
  'buoyancy compensator',
  'wetsuit',
  'drysuit',
  'dive computer',
  'dive light',
  'dive knife',
  'dive bag',
  'dive boot',
  'dive booty',
  'dive booties',
  'dive mask',
  'diving mask',
  'snorkel set',
  'scuba tank',
  'diving cylinder',
  'surface marker',
  'signal buoy',
  'weight belt',
  'weight pocket',
  'monofin',
  'bi-fin',
  'bifin',
  'nitrox analyzer',
  'pony bottle',
  'stage bottle',
  'first stage',
  'second stage',
  'inflator hose',
  'dive reel',
  'dive spool',
  'dive torch',
  'dive compass',
  'dive hood',
  'dive glove',
  'underwater housing',
  'scuba regulator',
  'diving regulator',
  'octopus regulator',
  'backup regulator',
];

const WEAK_EQUIPMENT_KEYWORDS = [
  'scuba',
  'snorkel',
  'regulator',
  'octopus',
  'fins',
  'mask',
  'reel',
  'smb',
  'lanyard',
  'neoprene',
  'apnea',
  'spearfishing',
];

const DIVE_WATCH_HINTS = [
  'dive computer',
  'dive watch',
  'diving watch',
  'diver watch',
  'suunto',
  'shearwater',
  'garmin descent',
  'oceanic',
  'cressi',
  'mares',
  'scubapro',
  'pro diver',
  'diver scuba',
  'khaki navy scuba',
  'aquastar',
  'doxa',
  'citizen promaster',
  'seiko prospex diver',
];

const HARD_EXCLUDED_KEYWORDS = [
  'bikini',
  'swimsuit',
  'swim suit',
  'bathing suit',
  'one-piece swim',
  'one piece swim',
  'beach cover',
  'cover-up',
  'coverup',
  'sarong',
  'evening dress',
  'cocktail dress',
  'maxi dress',
  'mini dress',
  'sundress',
  'high heel',
  'high-heel',
  'stiletto',
  'loafer',
  'oxford shoe',
  'dress shoe',
  'running shoe',
  'sneaker',
  'sandal',
  'handbag',
  'purse',
  'clutch bag',
  'tote bag',
  'necklace',
  'bracelet',
  'earring',
  'jewelry',
  'jewellery',
  'lipstick',
  'perfume',
  'cologne',
  'smartwatch',
  'apple watch',
  'fitness tracker',
  'fly fishing',
  'fishing rod',
  'fishing reel',
  'pool float',
  'pool toy',
  'inflatable raft',
  'ski goggle',
  'snowboard',
  'phone case',
  'laptop bag',
  'coffee maker',
  'kitchen',
  'sofa',
  'chair',
  'mattress',
];

const SOFT_EXCLUDED_KEYWORDS = [
  'dress',
  'skirt',
  'blouse',
  'jeans',
  'shorts',
  'boot',
  'shoe',
  'watch',
  'backpack',
  'reel',
  'tank top',
  't-shirt',
  'tee ',
  'hoodie',
  'jacket',
  'coat',
  'goggle',
];

type SearchGearRequest = {
  diveType?: DiveTypeFilter;
  query?: string;
  limit?: number;
  pageToken?: string;
};

type PageState = {
  queryIndex: number;
  pageToken?: string;
};

type Channel3Brand = { id?: string; name?: string } | string | null;

type Channel3Image = { url?: string };

type Channel3Price = { price?: number; currency?: string };

type Channel3Offer = {
  price?: Channel3Price;
};

type Channel3Product = {
  id: string;
  title?: string;
  brand?: Channel3Brand;
  brands?: Channel3Brand[];
  images?: Channel3Image[];
  offers?: Channel3Offer[];
};

type Channel3Page = {
  data?: Channel3Product[];
  products?: Channel3Product[];
  next_page_token?: string | null;
};

type GearCatalogProduct = {
  id: string;
  title: string;
  brandName: string;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
  diveType: 'scuba' | 'freediving';
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getBrandNameFromValue(brand: Channel3Brand | undefined): string | null {
  if (!brand) return null;
  if (typeof brand === 'string') {
    const trimmed = brand.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  const name = brand.name?.trim();
  return name && name.length > 0 ? name : null;
}

function inferBrandFromTitle(title: string): string | null {
  const haystack = title.toLowerCase();
  const sortedBrands = [...DIVING_BRAND_CATALOG].sort(
    (a, b) => b.slug.length - a.slug.length,
  );

  for (const brand of sortedBrands) {
    if (haystack.includes(brand.slug)) {
      return brand.displayName;
    }
  }

  return null;
}

function getProductBrandName(product: Channel3Product, title: string): string {
  const fromBrandsArray = product.brands
    ?.map((brand) => getBrandNameFromValue(brand))
    .find((name): name is string => Boolean(name));

  if (fromBrandsArray) {
    return fromBrandsArray;
  }

  const fromLegacyBrand = getBrandNameFromValue(product.brand ?? undefined);
  if (fromLegacyBrand) {
    return fromLegacyBrand;
  }

  const fromTitle = inferBrandFromTitle(title);
  if (fromTitle) {
    return fromTitle;
  }

  return 'Unknown';
}

function isKnownDivingBrand(brandName: string): boolean {
  if (brandName === 'Unknown') return false;
  const haystack = brandName.toLowerCase();
  return DIVING_BRAND_CATALOG.some((brand) => haystack.includes(brand.slug));
}

function isGenericUnknownProduct(title: string, brandName: string): boolean {
  if (brandName !== 'Unknown') return false;
  return GENERIC_UNKNOWN_TITLES.has(title.toLowerCase().trim());
}

function brandQualityScore(brandName: string): number {
  if (isKnownDivingBrand(brandName)) return 3;
  if (brandName !== 'Unknown') return 2;
  return 1;
}

function sortByBrandQuality(products: GearCatalogProduct[]): GearCatalogProduct[] {
  return [...products].sort((left, right) => {
    const scoreDiff = brandQualityScore(right.brandName) - brandQualityScore(left.brandName);
    if (scoreDiff !== 0) return scoreDiff;
    return left.title.localeCompare(right.title);
  });
}

function getImageUrl(product: Channel3Product): string | null {
  const first = product.images?.find((image) => image.url);
  return first?.url ?? null;
}

function getBestPrice(product: Channel3Product): { price: number | null; currency: string | null } {
  const prices = (product.offers ?? [])
    .map((offer) => offer.price)
    .filter((price): price is Channel3Price => Boolean(price?.price));

  if (prices.length === 0) {
    return { price: null, currency: null };
  }

  const lowest = prices.reduce((min, current) =>
    (current.price ?? Infinity) < (min.price ?? Infinity) ? current : min,
  );

  return {
    price: lowest.price ?? null,
    currency: lowest.currency ?? 'USD',
  };
}

function includesAny(haystack: string, keywords: string[]): boolean {
  return keywords.some((keyword) => haystack.includes(keyword));
}

function hasDivingBrand(haystack: string): boolean {
  return DIVING_BRAND_CATALOG.some((brand) => haystack.includes(brand.slug));
}

function hasStrongEquipmentKeyword(haystack: string): boolean {
  return includesAny(haystack, STRONG_EQUIPMENT_KEYWORDS);
}

function hasWeakEquipmentKeyword(haystack: string): boolean {
  return includesAny(haystack, WEAK_EQUIPMENT_KEYWORDS);
}

function isDiveWatch(haystack: string): boolean {
  return includesAny(haystack, DIVE_WATCH_HINTS);
}

const INDUSTRIAL_OR_NON_DIVING_KEYWORDS = [
  'aquarium',
  'seachem',
  'king kooker',
  'oxygen acetylene',
  'acetylene',
  'welding',
  'water treatment',
  'cooking',
  'gas grill',
  'propane',
  'pneumatic',
  'lubricator',
  'flowmeter',
  'alkaline regulator',
  'neutral regulator',
  'co2 mini',
  'soda stream',
  'beer keg',
  'beverage',
  'paintball',
  'hvac',
  'medical oxygen',
  'welder',
  'torch kit',
  'air compressor',
  'gas regulator',
  'steel draft',
  'draft regulator',
  'co2 regulator',
  'c02 regulator',
  'infant',
  'feeding spoon',
  'silicone spoon',
  'baby bodysuit',
  'wagon',
  'submersible heater',
  'pool heater',
];

function isRelevantDivingGear(title: string, brandName: string): boolean {
  const haystack = `${title} ${brandName}`.toLowerCase();

  if (includesAny(haystack, HARD_EXCLUDED_KEYWORDS)) {
    return false;
  }

  if (includesAny(haystack, JUNK_KEYWORDS)) {
    return false;
  }

  if (haystack.includes('bodysuit') && !includesAny(haystack, ['wetsuit', 'neoprene', 'diving', 'freediv'])) {
    return false;
  }

  if (haystack.includes('first stage') && !includesAny(haystack, ['regulator', 'scuba', 'diving', 'dive'])) {
    return false;
  }

  if (includesAny(haystack, INDUSTRIAL_OR_NON_DIVING_KEYWORDS)) {
    return false;
  }

  if (
    (haystack.includes('watch') || haystack.includes('automatic')) &&
    !isDiveWatch(haystack)
  ) {
    return false;
  }

  if (haystack.includes('regulator')) {
    const divingRegulatorHints = [
      'scuba',
      'diving',
      'dive',
      'snorkel',
      'underwater',
      'first stage',
      'second stage',
      'octopus',
      'backup',
      'down stream',
      'downstream',
      'breathing',
      'buoyancy',
      'bcd',
    ];
    const hasDivingRegulatorContext =
      divingRegulatorHints.some((hint) => haystack.includes(hint)) || hasDivingBrand(haystack);
    if (!hasDivingRegulatorContext) {
      return false;
    }
  }

  if (includesAny(haystack, SOFT_EXCLUDED_KEYWORDS) && !hasStrongEquipmentKeyword(haystack)) {
    if (!hasDivingBrand(haystack) || !hasWeakEquipmentKeyword(haystack)) {
      return false;
    }
  }

  if (hasStrongEquipmentKeyword(haystack)) {
    return true;
  }

  if (hasDivingBrand(haystack) && hasWeakEquipmentKeyword(haystack)) {
    return true;
  }

  if (hasWeakEquipmentKeyword(haystack)) {
    const divingContext = ['diving', 'dive', 'scuba', 'freediv', 'apnea', 'underwater'];
    return divingContext.some((hint) => haystack.includes(hint));
  }

  return false;
}

function inferDiveType(title: string, brandName: string, query: string): 'scuba' | 'freediving' {
  const haystack = `${title} ${brandName} ${query}`.toLowerCase();
  const freedivingHints = [
    'freediv',
    'free-div',
    'apnea',
    'spearfishing',
    'monofin',
    'bi-fin',
    'bifin',
    'open cell',
  ];
  const scubaHints = [
    'scuba',
    'bcd',
    'regulator',
    'nitrox',
    'dive computer',
    'buoyancy',
    'octopus',
    'smb',
    'pony bottle',
    'stage bottle',
  ];

  const isFreediving = freedivingHints.some((hint) => haystack.includes(hint));
  const isScuba = scubaHints.some((hint) => haystack.includes(hint));

  if (isFreediving && !isScuba) return 'freediving';
  if (isScuba && !isFreediving) return 'scuba';
  if (query.toLowerCase().includes('freediv') || query.toLowerCase().includes('apnea')) {
    return 'freediving';
  }
  return 'scuba';
}

function normalizeProduct(
  product: Channel3Product,
  sourceQuery: string,
): GearCatalogProduct | null {
  if (!product.id || !product.title) return null;

  const brandName = getProductBrandName(product, product.title);
  if (isGenericUnknownProduct(product.title, brandName)) {
    return null;
  }
  if (!isRelevantDivingGear(product.title, brandName)) {
    return null;
  }

  const { price, currency } = getBestPrice(product);

  return {
    id: product.id,
    title: product.title,
    brandName,
    imageUrl: getImageUrl(product),
    price,
    currency,
    diveType: inferDiveType(product.title, brandName, sourceQuery),
  };
}

async function channel3Request(
  apiKey: string,
  path: string,
  body: Record<string, unknown>,
): Promise<Channel3Page> {
  const response = await fetch(`${CHANNEL3_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Channel3 ${path} failed (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<Channel3Page>;
}

function extractProducts(page: Channel3Page): Channel3Product[] {
  return page.data ?? page.products ?? [];
}

async function searchProducts(
  apiKey: string,
  query: string,
  limit: number,
  pageToken?: string,
): Promise<{ products: GearCatalogProduct[]; nextPageToken: string | null }> {
  const body: Record<string, unknown> = {
    query,
    limit: Math.min(limit, CHANNEL3_PAGE_SIZE),
    config: { keyword_search_only: true },
  };

  if (pageToken) {
    body.page_token = pageToken;
  }

  const page = await channel3Request(apiKey, '/v1/search', body);

  return {
    products: extractProducts(page)
      .map((product) => normalizeProduct(product, query))
      .filter((product): product is GearCatalogProduct => product !== null),
    nextPageToken: page.next_page_token ?? null,
  };
}

function mergeProducts(products: GearCatalogProduct[]): GearCatalogProduct[] {
  const map = new Map<string, GearCatalogProduct>();
  for (const product of products) {
    map.set(product.id, product);
  }
  return Array.from(map.values());
}

function filterByDiveType(
  products: GearCatalogProduct[],
  diveType: DiveTypeFilter,
): GearCatalogProduct[] {
  if (diveType === 'scuba') {
    return products.filter((product) => product.diveType === 'scuba');
  }
  if (diveType === 'freediving') {
    return products.filter((product) => product.diveType === 'freediving');
  }
  return products;
}

function getQueriesForDiveType(diveType: DiveTypeFilter): string[] {
  if (diveType === 'scuba') return SCUBA_QUERIES;
  if (diveType === 'freediving') return FREEDIVING_QUERIES;
  return [...SCUBA_QUERIES, ...FREEDIVING_QUERIES];
}

function encodePageState(state: PageState): string {
  return btoa(JSON.stringify(state));
}

function decodePageState(token: string): PageState {
  try {
    const parsed = JSON.parse(atob(token)) as PageState;
    if (typeof parsed.queryIndex === 'number') {
      return parsed;
    }
  } catch {
    // Fall through to default state for legacy tokens.
  }
  return { queryIndex: 0 };
}

function buildCustomSearchQuery(query: string, diveType: DiveTypeFilter): string {
  if (diveType === 'freediving') {
    return `${query} freediving equipment`;
  }
  if (diveType === 'scuba') {
    return `${query} scuba diving equipment`;
  }
  return `${query} scuba freediving equipment`;
}

async function fetchFilteredCatalog(
  apiKey: string,
  diveType: DiveTypeFilter,
  limit: number,
  initialState?: PageState,
): Promise<{ products: GearCatalogProduct[]; nextPageToken: string | null }> {
  const queries = getQueriesForDiveType(diveType);
  let queryIndex = initialState?.queryIndex ?? 0;
  let channelPageToken = initialState?.pageToken;
  const collected: GearCatalogProduct[] = [];
  const seen = new Set<string>();

  let safetyCounter = 0;

  while (collected.length < limit && queryIndex < queries.length && safetyCounter < 12) {
    safetyCounter += 1;
    const query = queries[queryIndex];
    const result = await searchProducts(
      apiKey,
      query,
      CHANNEL3_PAGE_SIZE,
      channelPageToken,
    );

    for (const product of filterByDiveType(result.products, diveType)) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        collected.push(product);
      }
    }

    if (result.nextPageToken) {
      channelPageToken = result.nextPageToken;
    } else {
      queryIndex += 1;
      channelPageToken = undefined;
    }
  }

  const hasMore = queryIndex < queries.length || Boolean(channelPageToken);
  const nextPageToken = hasMore
    ? encodePageState({ queryIndex, pageToken: channelPageToken })
    : null;

  return {
    products: sortByBrandQuality(collected.slice(0, limit)),
    nextPageToken,
  };
}

function getChannel3ApiKey(): string | undefined {
  return Deno.env.get('CHANNEL3_API_KEY') ?? Deno.env.get('channel3_api_key') ?? undefined;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const apiKey = getChannel3ApiKey();
  if (!apiKey) {
    return jsonResponse(
      {
        error:
          'Channel3 API key is not configured. Set CHANNEL3_API_KEY or channel3_api_key in Supabase Secrets.',
      },
      500,
    );
  }

  let payload: SearchGearRequest;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const diveType = payload.diveType ?? 'all';
  const limit = Math.min(Math.max(payload.limit ?? 30, 1), 60);
  const customQuery = payload.query?.trim();
  const pageToken = payload.pageToken?.trim();

  try {
    let products: GearCatalogProduct[] = [];
    let nextPageToken: string | null = null;

    if (customQuery) {
      const searchQuery = buildCustomSearchQuery(customQuery, diveType);
      const result = await searchProducts(apiKey, searchQuery, limit, pageToken);
      products = sortByBrandQuality(filterByDiveType(result.products, diveType));
      nextPageToken = result.nextPageToken;
    } else {
      const pageState = pageToken ? decodePageState(pageToken) : undefined;
      const result = await fetchFilteredCatalog(apiKey, diveType, limit, pageState);
      products = result.products;
      nextPageToken = result.nextPageToken;
    }

    return jsonResponse({
      products,
      total: products.length,
      source: 'channel3',
      nextPageToken,
      hasMore: Boolean(nextPageToken),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonResponse({ error: message }, 502);
  }
});
