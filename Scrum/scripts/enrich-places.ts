import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.js';
import {
  estimateEnrichmentGoogleUsage,
  getGooglePlacesMaxBillableCalls,
  getGooglePlacesMaxPhotosPerPlace,
  getGooglePlacesMaxPlaces,
  GooglePlacesUsageTracker,
  isGooglePlacesApiEnabled,
  printGooglePlacesEstimate,
  requireGooglePlacesConfirmation,
} from '../src/google-places-guard.js';
import { fieldWithSource } from '../src/enrichment/field-utils.js';
import { normalizeOperatingHoursTable } from '../src/enrichment/operating-hours-table.js';
import { matchKnownPool, matchKnownSite } from '../src/enrichment/known-places.js';
import {
  collectNaverPlaceImages,
  isNaverPlaceDetailUrl,
  pickBestNaverMatch,
  resolveNaverPlacePageUrl,
  searchNaverLocalCandidates,
} from '../src/enrichment/naver-place.js';
import type {
  PlaceEnrichment,
  EnrichedImage,
  FieldWithSource,
  KnownDataApplied,
  PoolEnrichment,
  SiteEnrichment,
  ShopEnrichment,
  EnrichmentFile,
  EnrichmentSummary,
} from '../src/enrichment/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const scrumRoot = resolve(__dirname, '..');
const normalizedPath = resolve(scrumRoot, 'output/normalized/places.json');
const enrichedDir = resolve(scrumRoot, 'output/enriched');
const progressLogPath = resolve(enrichedDir, 'progress.log');
const maxPhotosPerPlace = getGooglePlacesMaxPhotosPerPlace();
const skipExistingBatches = process.env.GOOGLE_PLACES_SKIP_EXISTING_BATCHES !== 'false';
let googleUsageTracker: GooglePlacesUsageTracker | null = null;

if (!existsSync(enrichedDir)) {
  mkdirSync(enrichedDir, { recursive: true });
}

type NormalizedPlace = {
  id: string;
  placeType: 'shop' | 'pool' | 'site';
  name: string;
  nameNormalized?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  addressLine?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  naverMapUrl?: string;
  kakaoMapUrl?: string;
  status?: string;
  verificationStatus?: string;
  confidence?: string;
  sourceApis?: string[];
  sources?: Array<{
    api: string;
    sourceId: string;
    sourceUrl: string;
    sourceQuery?: string;
    fetchedAt?: string;
    raw?: any;
  }>;
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isSocialMediaUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes('instagram.com') ||
    lower.includes('facebook.com') ||
    lower.includes('youtube.com') ||
    lower.includes('blog.naver.com') ||
    lower.includes('cafe.naver.com') ||
    lower.includes('tiktok.com') ||
    lower.includes('twitter.com') ||
    lower.includes('threads.net') ||
    lower.includes('band.us')
  );
}

// Fetch Google Places Details by Place ID
async function fetchGooglePlaceDetails(placeId: string): Promise<any> {
  if (!isGooglePlacesApiEnabled() || !config.googlePlacesApiKey) return null;
  googleUsageTracker?.record('place_details');
  try {
    const fieldMask =
      maxPhotosPerPlace > 0
        ? 'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,regularOpeningHours,editorialSummary,photos,parkingOptions,types,rating,userRatingCount'
        : 'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,regularOpeningHours,editorialSummary,parkingOptions,types';
    const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=ko`;
    const res = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': config.googlePlacesApiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Search Google Places by text query if placeId is missing
async function searchGooglePlace(query: string): Promise<any> {
  if (!isGooglePlacesApiEnabled() || !config.googlePlacesApiKey) return null;
  googleUsageTracker?.record('text_search');
  try {
    const fieldMask =
      maxPhotosPerPlace > 0
        ? 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.editorialSummary,places.photos,places.parkingOptions,places.types'
        : 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.editorialSummary,places.parkingOptions,places.types';
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': config.googlePlacesApiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify({
        textQuery: query,
        regionCode: 'KR',
        languageCode: 'ko',
        maxResultCount: 1,
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.places?.[0] || null;
  } catch {
    return null;
  }
}

// Resolve photo URI from Google Places photo resource name
async function resolveGooglePhotoUri(photoName: string): Promise<string | null> {
  if (!isGooglePlacesApiEnabled() || !config.googlePlacesApiKey || maxPhotosPerPlace <= 0) return null;
  googleUsageTracker?.record('place_photo');
  try {
    const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1000&maxWidthPx=1000&skipHttpRedirect=true&key=${config.googlePlacesApiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    return data.photoUri || null;
  } catch {
    return null;
  }
}

// Scrape official website for meta description and og:image
async function scrapeOfficialWebsite(websiteUrl: string): Promise<{
  ogImage?: string;
  ogDescription?: string;
  pageTitle?: string;
  bodyText?: string;
} | null> {
  if (isSocialMediaUrl(websiteUrl)) return null;
  try {
    const res = await fetch(websiteUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    if (!html || html.length < 50) return null;

    let ogImage = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || [])[1];
    if (ogImage && !ogImage.startsWith('http')) {
      try {
        ogImage = new URL(ogImage, websiteUrl).toString();
      } catch {
        ogImage = undefined;
      }
    }

    const ogDescription = (html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || [])[1];

    const pageTitle = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1];

    // Strip HTML tags from sample body
    const bodyText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 3000);

    return { ogImage, ogDescription, pageTitle, bodyText };
  } catch {
    return null;
  }
}

// Clean HTML tags and entities
function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function enrichPlace(place: NormalizedPlace): Promise<PlaceEnrichment> {
  const now = new Date().toISOString();
  const sourcesChecked: string[] = [];
  const images: EnrichedImage[] = [];

  let shortDescription: FieldWithSource<string> | undefined;
  let phone: FieldWithSource<string> | undefined;
  let website: FieldWithSource<string> | undefined;

  let poolEnrichment: PoolEnrichment | undefined;
  let siteEnrichment: SiteEnrichment | undefined;
  let shopEnrichment: ShopEnrichment | undefined;
  let knownDataApplied: KnownDataApplied | undefined;
  let naverPlacePageUrl: string | undefined;

  // Track existing links
  if (place.googleMapsUrl) sourcesChecked.push(place.googleMapsUrl);
  if (place.naverMapUrl) sourcesChecked.push(place.naverMapUrl);
  if (place.kakaoMapUrl) sourcesChecked.push(place.kakaoMapUrl);
  if (place.website) sourcesChecked.push(place.website);

  // 1. Google Places Details / Search
  let googlePlace: any = null;
  const googleSource = place.sources?.find(s => s.api === 'google-places');
  if (googleSource?.sourceId) {
    googlePlace = await fetchGooglePlaceDetails(googleSource.sourceId);
    if (googlePlace) {
      const gUrl = `https://places.googleapis.com/v1/places/${googleSource.sourceId}`;
      if (!sourcesChecked.includes(gUrl)) sourcesChecked.push(gUrl);
    }
  }

  // Fallback Google Search if not found
  if (!googlePlace) {
    const gQuery = `${place.name} ${place.city || place.region || ''}`.trim();
    googlePlace = await searchGooglePlace(gQuery);
    if (googlePlace?.id) {
      const gUrl = `https://places.googleapis.com/v1/places/${googlePlace.id}`;
      if (!sourcesChecked.includes(gUrl)) sourcesChecked.push(gUrl);
    }
  }

  // Extract from Google Place
  if (googlePlace) {
    const gSourceUrl = googlePlace.id
      ? `https://maps.google.com/?cid=${googlePlace.id}`
      : place.googleMapsUrl || 'https://maps.google.com';

    // Phone
    if (googlePlace.nationalPhoneNumber && (!place.phone || place.phone.trim().length === 0)) {
      phone = {
        value: googlePlace.nationalPhoneNumber,
        sourceUrl: gSourceUrl,
        collectedAt: now,
      };
    }

    // Website
    if (googlePlace.websiteUri && (!place.website || place.website.trim().length === 0)) {
      website = {
        value: googlePlace.websiteUri,
        sourceUrl: gSourceUrl,
        collectedAt: now,
      };
      if (!sourcesChecked.includes(googlePlace.websiteUri)) {
        sourcesChecked.push(googlePlace.websiteUri);
      }
    }

    // Short Description
    if (googlePlace.editorialSummary?.text) {
      shortDescription = {
        value: cleanText(googlePlace.editorialSummary.text),
        sourceUrl: gSourceUrl,
        collectedAt: now,
      };
    }

    // Google Photos (STRICT: from Google Maps / Google Places photo resource)
    if (maxPhotosPerPlace > 0 && Array.isArray(googlePlace.photos) && googlePlace.photos.length > 0) {
      const photosToFetch = googlePlace.photos.slice(0, maxPhotosPerPlace);
      for (let i = 0; i < photosToFetch.length; i++) {
        const p = photosToFetch[i];
        if (p.name) {
          const photoUri = await resolveGooglePhotoUri(p.name);
          if (photoUri) {
            images.push({
              url: photoUri,
              source: 'google_places',
              sourcePageUrl: p.googleMapsUri || gSourceUrl,
              caption: p.authorAttributions?.[0]?.displayName || place.name,
              isPrimary: images.length === 0,
            });
          }
        }
      }
    }
  }

  // 2. Naver Local Search API + Naver Place images
  const naverQuery = `${place.name} ${place.city || place.region || ''}`.trim();
  const naverCandidates = await searchNaverLocalCandidates(naverQuery, 5);
  const naverItem = pickBestNaverMatch(place.name, place.addressLine, naverCandidates);
  const naverSearchUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(naverQuery)}`;
  if (!sourcesChecked.includes(naverSearchUrl)) sourcesChecked.push(naverSearchUrl);

  if (naverItem) {
    if (naverItem.telephone && !phone) {
      phone = fieldWithSource(cleanText(naverItem.telephone), naverSearchUrl, now);
    }
    if (naverItem.link && !website && !isSocialMediaUrl(naverItem.link)) {
      website = fieldWithSource(naverItem.link, naverSearchUrl, now);
      if (!sourcesChecked.includes(naverItem.link)) sourcesChecked.push(naverItem.link);
    }
    if (naverItem.description && !shortDescription) {
      const desc = cleanText(naverItem.description);
      if (desc.length > 5) {
        shortDescription = fieldWithSource(desc, naverSearchUrl, now);
      }
    }
  }

  const naverSearchPageUrl = resolveNaverPlacePageUrl(
    place.name,
    place.city,
    place.region,
    naverItem,
    place.naverMapUrl,
  );
  const naverDetailUrl = [place.naverMapUrl, naverItem?.link].find(
    (url): url is string => Boolean(url && isNaverPlaceDetailUrl(url)),
  );

  naverPlacePageUrl = naverDetailUrl ?? naverSearchPageUrl;
  if (naverPlacePageUrl && !sourcesChecked.includes(naverPlacePageUrl)) {
    sourcesChecked.push(naverPlacePageUrl);
  }

  if (naverDetailUrl) {
    const naverImages = await collectNaverPlaceImages(place.name, naverDetailUrl, images.length);
    for (const img of naverImages) {
      if (!images.some((existing) => existing.url === img.url)) {
        images.push(img);
      }
    }
  }

  // 3. Official Website Scraping (if valid standalone domain)
  const candidateWebsite = website?.value || place.website || (googlePlace?.websiteUri as string) || (naverItem?.link as string);
  let websiteData: { ogImage?: string; ogDescription?: string; pageTitle?: string; bodyText?: string } | null = null;
  if (candidateWebsite && !isSocialMediaUrl(candidateWebsite)) {
    websiteData = await scrapeOfficialWebsite(candidateWebsite);
    if (!sourcesChecked.includes(candidateWebsite)) sourcesChecked.push(candidateWebsite);

    if (websiteData) {
      if (websiteData.ogDescription && !shortDescription) {
        const desc = cleanText(websiteData.ogDescription);
        if (desc.length > 8) {
          shortDescription = {
            value: desc,
            sourceUrl: candidateWebsite,
            collectedAt: now,
          };
        }
      } else if (websiteData.pageTitle && !shortDescription && websiteData.pageTitle.length > 5) {
        shortDescription = {
          value: cleanText(websiteData.pageTitle),
          sourceUrl: candidateWebsite,
          collectedAt: now,
        };
      }

      // Official Website Image (STRICT: og:image or hero image on official site)
      if (websiteData.ogImage && !isSocialMediaUrl(websiteData.ogImage)) {
        images.push({
          url: websiteData.ogImage,
          source: 'official_website',
          sourcePageUrl: candidateWebsite,
          caption: `${place.name} 공식 웹사이트`,
          isPrimary: images.length === 0,
        });
      }
    }
  }

  // 4. Type-Specific Enrichment
  const combinedText = [
    place.name,
    shortDescription?.value,
    websiteData?.bodyText,
    googlePlace?.displayName?.text,
    JSON.stringify(googlePlace?.regularOpeningHours || ''),
  ].filter(Boolean).join(' ');

  // A. POOL
  if (place.placeType === 'pool') {
    poolEnrichment = {};
    const knownPool = matchKnownPool(place.name, place.nameNormalized);

    if (knownPool) {
      const matchedKey = knownPool.matchKeys.find((key) =>
        `${place.name} ${place.nameNormalized ?? ''}`.toLowerCase().includes(key.toLowerCase()),
      ) ?? knownPool.matchKeys[0];
      knownDataApplied = { profile: 'pool', matchKey: matchedKey, verified: true };

      poolEnrichment.maxDepthM = fieldWithSource(knownPool.maxDepthM, knownPool.sourceUrl, now, true);
      if (knownPool.poolSize) poolEnrichment.poolSize = fieldWithSource(knownPool.poolSize, knownPool.sourceUrl, now, true);
      if (knownPool.operatingHours) {
        poolEnrichment.operatingHours = fieldWithSource(
          normalizeOperatingHoursTable(knownPool.operatingHours),
          knownPool.sourceUrl,
          now,
          true,
        );
      }
      if (knownPool.priceInfo) poolEnrichment.priceInfo = fieldWithSource(knownPool.priceInfo, knownPool.sourceUrl, now, true);
      if (knownPool.reservationMethod) {
        poolEnrichment.reservationMethod = fieldWithSource(knownPool.reservationMethod, knownPool.sourceUrl, now, true);
      }

      const amenities = knownPool.amenities ?? {};
      if (amenities.parking !== undefined) {
        poolEnrichment.parking = fieldWithSource(amenities.parking, knownPool.sourceUrl, now, true);
      }
      if (amenities.shower !== undefined) {
        poolEnrichment.shower = fieldWithSource(amenities.shower, knownPool.sourceUrl, now, true);
      }
      if (amenities.equipmentRental !== undefined) {
        poolEnrichment.equipmentRental = fieldWithSource(amenities.equipmentRental, knownPool.sourceUrl, now, true);
      }
      if (amenities.airFill !== undefined) {
        poolEnrichment.airFill = fieldWithSource(amenities.airFill, knownPool.sourceUrl, now, true);
      }
      if (amenities.scubaAvailable !== undefined) {
        poolEnrichment.scubaAvailable = fieldWithSource(amenities.scubaAvailable, knownPool.sourceUrl, now, true);
      }
      if (amenities.freedivingAvailable !== undefined) {
        poolEnrichment.freedivingAvailable = fieldWithSource(amenities.freedivingAvailable, knownPool.sourceUrl, now, true);
      }
    } else {
      const sourceUrl = candidateWebsite || place.googleMapsUrl || naverSearchUrl;

      const depthMatch =
        combinedText.match(/수심\s*([0-9.]+)\s*m/i) || combinedText.match(/([0-9.]+)\s*m\s*(?:풀|수심|다이빙풀)/i);
      if (depthMatch) {
        const depth = parseFloat(depthMatch[1]);
        if (depth >= 1 && depth <= 50) {
          poolEnrichment.maxDepthM = fieldWithSource(depth, sourceUrl, now);
        }
      }

      if (googlePlace?.regularOpeningHours?.weekdayDescriptions) {
        poolEnrichment.operatingHours = fieldWithSource(
          normalizeOperatingHoursTable(googlePlace.regularOpeningHours.weekdayDescriptions.join('; ')),
          place.googleMapsUrl || 'https://maps.google.com',
          now,
        );
      }

      if (googlePlace?.parkingOptions) {
        const hasParking = Boolean(
          googlePlace.parkingOptions.freeParkingLot ||
            googlePlace.parkingOptions.paidParkingLot ||
            googlePlace.parkingOptions.freeStreetParking,
        );
        poolEnrichment.parking = fieldWithSource(hasParking, place.googleMapsUrl || 'https://maps.google.com', now);
      }

      const isScuba = combinedText.includes('스쿠버') || combinedText.includes('scuba');
      const isFree =
        combinedText.includes('프리다이빙') || combinedText.includes('freediving') || combinedText.includes('숨비');
      if (isScuba) poolEnrichment.scubaAvailable = fieldWithSource(true, sourceUrl, now);
      if (isFree) poolEnrichment.freedivingAvailable = fieldWithSource(true, sourceUrl, now);
      if (combinedText.includes('렌탈') || combinedText.includes('대여') || combinedText.includes('장비')) {
        poolEnrichment.equipmentRental = fieldWithSource(true, sourceUrl, now);
      }
      if (combinedText.includes('샤워') || combinedText.includes('탈의실') || combinedText.includes('샤워실')) {
        poolEnrichment.shower = fieldWithSource(true, sourceUrl, now);
      }
      if (combinedText.includes('공기충전') || combinedText.includes('에어필') || combinedText.includes('탱크충전')) {
        poolEnrichment.airFill = fieldWithSource(true, sourceUrl, now);
      }
    }
  }

  // B. SITE
  else if (place.placeType === 'site') {
    siteEnrichment = {};
    const knownSite = matchKnownSite(place.name);

    if (knownSite) {
      const matchedKey = knownSite.matchKeys.find((key) => place.name.includes(key)) ?? knownSite.matchKeys[0];
      knownDataApplied = { profile: 'site', matchKey: matchedKey, verified: true };

      siteEnrichment.depthRangeM = fieldWithSource(knownSite.depthRangeM, knownSite.sourceUrl, now, true);
      siteEnrichment.difficulty = fieldWithSource(knownSite.difficulty, knownSite.sourceUrl, now, true);
      siteEnrichment.waterTemperature = fieldWithSource(knownSite.waterTemperature, knownSite.sourceUrl, now, true);
      siteEnrichment.visibility = fieldWithSource(knownSite.visibility, knownSite.sourceUrl, now, true);
      siteEnrichment.accessType = fieldWithSource(knownSite.accessType, knownSite.sourceUrl, now, true);
      siteEnrichment.currentInfo = fieldWithSource(knownSite.currentInfo, knownSite.sourceUrl, now, true);
    } else {
      const sourceUrl = candidateWebsite || place.googleMapsUrl || naverSearchUrl;
      const isBoat = combinedText.includes('보트') || combinedText.includes('선박') || combinedText.includes('해상');
      const isBeach = combinedText.includes('비치') || combinedText.includes('연안') || combinedText.includes('해변');
      if (isBoat && isBeach) {
        siteEnrichment.accessType = fieldWithSource('보트 / 비치 다이빙', sourceUrl, now);
      } else if (isBoat) {
        siteEnrichment.accessType = fieldWithSource('보트 다이빙', sourceUrl, now);
      } else if (isBeach) {
        siteEnrichment.accessType = fieldWithSource('비치 다이빙', sourceUrl, now);
      }

      const depthMatch = combinedText.match(/수심\s*([0-9~.\-\s]+m)/i);
      if (depthMatch) {
        siteEnrichment.depthRangeM = fieldWithSource(depthMatch[1].trim(), sourceUrl, now);
      }
    }
  }

  // C. SHOP
  else if (place.placeType === 'shop') {
    shopEnrichment = {};
    const sourceUrl = candidateWebsite || place.googleMapsUrl || naverSearchUrl;

    // Services
    const services: string[] = [];
    if (combinedText.includes('교육') || combinedText.includes('강습') || combinedText.includes('라이센스') || combinedText.includes('아카데미')) {
      services.push('스쿠버다이빙 교육');
      shopEnrichment.trainingAvailable = fieldWithSource(true, sourceUrl, now);
    }
    if (combinedText.includes('렌탈') || combinedText.includes('대여')) {
      services.push('장비 렌탈');
      shopEnrichment.rentalAvailable = fieldWithSource(true, sourceUrl, now);
    }
    if (combinedText.includes('투어') || combinedText.includes('리조트') || combinedText.includes('투어패키지')) {
      services.push('다이빙 투어');
    }
    if (combinedText.includes('판매') || combinedText.includes('용품') || combinedText.includes('샵') || combinedText.includes('장비')) {
      services.push('다이빙 장비 판매');
    }
    if (combinedText.includes('공기충전') || combinedText.includes('탱크충전') || combinedText.includes('에어필')) {
      services.push('공기 충전');
    }
    if (combinedText.includes('나이트록스') || combinedText.includes('nitrox')) {
      shopEnrichment.nitroxAvailable = fieldWithSource(true, sourceUrl, now);
    }

    if (services.length > 0) {
      shopEnrichment.services = fieldWithSource(services, sourceUrl, now);
    }

    if (googlePlace?.regularOpeningHours?.weekdayDescriptions) {
      shopEnrichment.operatingHours = fieldWithSource(
        normalizeOperatingHoursTable(googlePlace.regularOpeningHours.weekdayDescriptions.join('; ')),
        place.googleMapsUrl || 'https://maps.google.com',
        now,
      );
    }
  }

  // Determine enrichment status:
  // complete: description + at least 2 type-specific fields or 1+ image
  // partial: some fields found but sparse
  // not_found: no useful enrichment from allowed sources
  let typeFieldsCount = 0;
  if (poolEnrichment) typeFieldsCount = Object.keys(poolEnrichment).length;
  if (siteEnrichment) typeFieldsCount = Object.keys(siteEnrichment).length;
  if (shopEnrichment) typeFieldsCount = Object.keys(shopEnrichment).length;

  let enrichmentStatus: 'complete' | 'partial' | 'not_found' | 'error' = 'not_found';

  const hasDescription = Boolean(shortDescription?.value);
  const hasImages = images.length > 0;
  const hasPhone = Boolean(phone?.value);
  const hasWebsite = Boolean(website?.value);

  if ((hasDescription && (hasImages || typeFieldsCount >= 2)) || (hasImages && typeFieldsCount >= 1)) {
    enrichmentStatus = 'complete';
  } else if (hasDescription || hasImages || typeFieldsCount > 0 || hasPhone || hasWebsite) {
    enrichmentStatus = 'partial';
  } else {
    enrichmentStatus = 'not_found';
  }

  return {
    id: place.id,
    placeType: place.placeType,
    enrichedAt: now,
    enrichmentStatus,
    shortDescription,
    phone,
    website,
    images,
    pool: poolEnrichment && Object.keys(poolEnrichment).length > 0 ? poolEnrichment : undefined,
    site: siteEnrichment && Object.keys(siteEnrichment).length > 0 ? siteEnrichment : undefined,
    shop: shopEnrichment && Object.keys(shopEnrichment).length > 0 ? shopEnrichment : undefined,
    naverPlacePageUrl,
    knownDataApplied,
    sourcesChecked,
    notes: enrichmentStatus === 'not_found' ? 'No supplemental data found in allowed sources' : undefined,
  };
}

async function main() {
  console.log('=== Starting Place Enrichment Pipeline (v2) ===');
  writeFileSync(progressLogPath, `[${new Date().toISOString()}] Enrichment v2 started\n`, 'utf8');
  const normalizedRaw = readFileSync(normalizedPath, 'utf8');
  const normalizedData = JSON.parse(normalizedRaw);
  const allPlaces: NormalizedPlace[] = normalizedData.places;
  const placeLimit = isGooglePlacesApiEnabled() ? getGooglePlacesMaxPlaces() : allPlaces.length;
  const places = allPlaces.slice(0, placeLimit);
  const total = places.length;

  if (isGooglePlacesApiEnabled()) {
    const estimate = estimateEnrichmentGoogleUsage({
      placeCount: total,
      maxPhotosPerPlace,
      includeFallbackTextSearchRatio: 0.1,
    });
    requireGooglePlacesConfirmation('enrich:places', estimate);
    googleUsageTracker = new GooglePlacesUsageTracker(getGooglePlacesMaxBillableCalls());
  } else {
    console.warn(
      'Google Places API is DISABLED. Running website-only enrichment. Enable MAP_API_ENABLED + GOOGLE_PLACES_API_ENABLED to bill Google again.',
    );
  }

  console.log(`Total places to enrich: ${total}${allPlaces.length > total ? ` (capped from ${allPlaces.length})` : ''}`);

  const BATCH_SIZE = 50;
  const totalBatches = Math.ceil(total / BATCH_SIZE);
  console.log(`Total batches: ${totalBatches} (50 places per batch)`);

  const allEnrichedItems: PlaceEnrichment[] = [];

  for (let b = 0; b < totalBatches; b++) {
    const batchIndex = b + 1;
    const batchNumStr = String(batchIndex).padStart(3, '0');
    const batchFileName = `batch-${batchNumStr}.json`;
    const batchFilePath = resolve(enrichedDir, batchFileName);

    if (skipExistingBatches && existsSync(batchFilePath)) {
      console.log(`Skipping Batch ${batchIndex}/${totalBatches} (${batchFileName} already exists)`);
      const existing = JSON.parse(readFileSync(batchFilePath, 'utf8')) as EnrichmentFile;
      allEnrichedItems.push(...existing.items);
      continue;
    }

    const startIdx = b * BATCH_SIZE;
    const endIdx = Math.min(startIdx + BATCH_SIZE, total);
    const batchPlaces = places.slice(startIdx, endIdx);

    console.log(`\nProcessing Batch ${batchIndex}/${totalBatches} (${batchPlaces.length} places: idx ${startIdx} to ${endIdx - 1})...`);

    const batchItems: PlaceEnrichment[] = [];
    let completeCount = 0;
    let partialCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    // Process concurrently with concurrency limit 5
    const CONCURRENCY = 5;
    for (let i = 0; i < batchPlaces.length; i += CONCURRENCY) {
      const chunk = batchPlaces.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        chunk.map(async p => {
          try {
            return await enrichPlace(p);
          } catch (err) {
            console.error(`Error enriching place ${p.id} (${p.name}):`, err);
            return {
              id: p.id,
              placeType: p.placeType,
              enrichedAt: new Date().toISOString(),
              enrichmentStatus: 'error' as const,
              images: [],
              sourcesChecked: [],
              notes: `Enrichment error: ${err instanceof Error ? err.message : String(err)}`,
            };
          }
        })
      );

      for (const res of results) {
        batchItems.push(res);
        if (res.enrichmentStatus === 'complete') completeCount++;
        else if (res.enrichmentStatus === 'partial') partialCount++;
        else if (res.enrichmentStatus === 'not_found') notFoundCount++;
        else if (res.enrichmentStatus === 'error') errorCount++;
      }

      await sleep(100);
    }

    const batchFileContent: EnrichmentFile = {
      meta: {
        batchIndex,
        batchSize: batchPlaces.length,
        enrichedAt: new Date().toISOString(),
        completeCount,
        partialCount,
        notFoundCount,
        errorCount,
      },
      items: batchItems,
    };

    writeFileSync(batchFilePath, JSON.stringify(batchFileContent, null, 2), 'utf8');

    const logLine = `[${new Date().toISOString()}] Batch ${batchNumStr}/${String(totalBatches).padStart(3, '0')} saved: total=${batchPlaces.length}, complete=${completeCount}, partial=${partialCount}, not_found=${notFoundCount}, error=${errorCount}\n`;
    appendFileSync(progressLogPath, logLine, 'utf8');
    process.stdout.write(logLine);

    allEnrichedItems.push(...batchItems);
  }

  // Merge into places-enriched.json
  console.log('\nMerging all batches into places-enriched.json...');
  const mergedFilePath = resolve(enrichedDir, 'places-enriched.json');
  const reportFilePath = resolve(enrichedDir, 'enrichment-report.json');

  let totalComplete = 0;
  let totalPartial = 0;
  let totalNotFound = 0;
  let totalError = 0;
  let withImagesCount = 0;
  let withDescriptionCount = 0;
  let totalImagesCollected = 0;
  let naverPlaceImagesCount = 0;
  let verifiedKnownDataCount = 0;

  const byPlaceType: Record<'shop' | 'pool' | 'site', {
    total: number;
    complete: number;
    partial: number;
    notFound: number;
    withImages: number;
  }> = {
    shop: { total: 0, complete: 0, partial: 0, notFound: 0, withImages: 0 },
    pool: { total: 0, complete: 0, partial: 0, notFound: 0, withImages: 0 },
    site: { total: 0, complete: 0, partial: 0, notFound: 0, withImages: 0 },
  };

  for (const item of allEnrichedItems) {
    if (item.enrichmentStatus === 'complete') totalComplete++;
    else if (item.enrichmentStatus === 'partial') totalPartial++;
    else if (item.enrichmentStatus === 'not_found') totalNotFound++;
    else if (item.enrichmentStatus === 'error') totalError++;

    if (item.images.length > 0) {
      withImagesCount++;
      totalImagesCollected += item.images.length;
      naverPlaceImagesCount += item.images.filter((img) => img.source === 'naver_place').length;
    }
    if (item.shortDescription?.value) {
      withDescriptionCount++;
    }
    if (item.knownDataApplied?.verified) {
      verifiedKnownDataCount++;
    }

    const t = byPlaceType[item.placeType];
    if (t) {
      t.total++;
      if (item.enrichmentStatus === 'complete') t.complete++;
      else if (item.enrichmentStatus === 'partial') t.partial++;
      else if (item.enrichmentStatus === 'not_found') t.notFound++;
      if (item.images.length > 0) t.withImages++;
    }
  }

  const enrichmentSummary: EnrichmentSummary = {
    meta: {
      totalPlaces: allEnrichedItems.length,
      enrichedAt: new Date().toISOString(),
      completeCount: totalComplete,
      partialCount: totalPartial,
      notFoundCount: totalNotFound,
      errorCount: totalError,
      withImagesCount,
      withDescriptionCount,
      naverPlaceImagesCount,
      verifiedKnownDataCount,
      byPlaceType,
    },
    items: allEnrichedItems,
  };

  writeFileSync(mergedFilePath, JSON.stringify(enrichmentSummary, null, 2), 'utf8');

  const report = {
    enrichedAt: new Date().toISOString(),
    totalPlaces: allEnrichedItems.length,
    batchesProcessed: totalBatches,
    statusCounts: {
      complete: totalComplete,
      partial: totalPartial,
      not_found: totalNotFound,
      error: totalError,
    },
    images: {
      totalImagesCollected,
      placesWithImages: withImagesCount,
      naverPlaceImages: naverPlaceImagesCount,
    },
    verifiedKnownData: {
      count: verifiedKnownDataCount,
    },
    descriptions: {
      placesWithDescription: withDescriptionCount,
    },
    byPlaceType,
    rulesCompliance: {
      strictImageRulesEnforced: true,
      allowedImageSources: ['official_website', 'google_places', 'naver_place'],
      socialMediaHotlinksRejected: true,
      dataAttributionEnforced: true,
    },
  };

  writeFileSync(reportFilePath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n=============================================');
  console.log('ENRICHMENT COMPLETE');
  console.log(`Total places processed: ${allEnrichedItems.length}`);
  console.log(`Complete: ${totalComplete} (${((totalComplete / total) * 100).toFixed(1)}%)`);
  console.log(`Partial: ${totalPartial} (${((totalPartial / total) * 100).toFixed(1)}%)`);
  console.log(`Not found: ${totalNotFound} (${((totalNotFound / total) * 100).toFixed(1)}%)`);
  console.log(`Error: ${totalError} (${((totalError / total) * 100).toFixed(1)}%)`);
  console.log(`Places with images: ${withImagesCount} (Total images: ${totalImagesCollected})`);
  console.log(`Places with description: ${withDescriptionCount}`);
  if (googleUsageTracker) {
    printGooglePlacesEstimate('enrich:places (actual)', googleUsageTracker.snapshot());
  }
  console.log('By Place Type:');
  console.log(JSON.stringify(byPlaceType, null, 2));
  console.log('=============================================');
}

main().catch(err => {
  console.error('Fatal error in enrichment pipeline:', err);
  process.exit(1);
});
