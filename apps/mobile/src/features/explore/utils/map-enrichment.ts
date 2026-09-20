import type {
  ExplorePlaceEnrichment,
  ExplorePlaceHighlight,
  FieldWithSource,
  PoolEnrichmentData,
  ShopEnrichmentData,
  SiteEnrichmentData,
} from '@/src/features/explore/types';

function readField<T>(field?: FieldWithSource<T> | null): T | undefined {
  return field?.value;
}

function formatBooleanLabel(label: string, value?: boolean): string | null {
  if (value !== true) return null;
  return label;
}

export function buildExplorePlaceEnrichment(
  placeType: 'shop' | 'pool' | 'site',
  enrichment?: {
    enrichmentStatus?: string;
    enrichedAt?: string;
    naverPlacePageUrl?: string;
    knownDataApplied?: ExplorePlaceEnrichment['knownDataApplied'];
    poolData?: PoolEnrichmentData | null;
    siteData?: SiteEnrichmentData | null;
    shopData?: ShopEnrichmentData | null;
    notes?: string | null;
  } | null,
): ExplorePlaceEnrichment | undefined {
  if (!enrichment) return undefined;

  return {
    status: enrichment.enrichmentStatus,
    enrichedAt: enrichment.enrichedAt,
    naverPlacePageUrl: enrichment.naverPlacePageUrl,
    knownDataApplied: enrichment.knownDataApplied,
    pool: enrichment.poolData ?? undefined,
    site: enrichment.siteData ?? undefined,
    shop: enrichment.shopData ?? undefined,
    notes: enrichment.notes ?? undefined,
  };
}

export function buildPlaceHighlights(
  category: 'shop' | 'pool' | 'site',
  enrichment?: ExplorePlaceEnrichment,
): ExplorePlaceHighlight[] {
  if (!enrichment) return [];

  const highlights: ExplorePlaceHighlight[] = [];

  if (category === 'pool' && enrichment.pool) {
    const pool = enrichment.pool;
    const depth = readField(pool.maxDepthM);
    if (depth != null) highlights.push({ label: '최대 수심', value: `${depth}m` });
    if (readField(pool.poolSize)) highlights.push({ label: '풀 규격', value: readField(pool.poolSize)! });
    if (readField(pool.priceInfo)) highlights.push({ label: '이용 요금', value: readField(pool.priceInfo)! });
    if (readField(pool.reservationMethod)) {
      highlights.push({ label: '예약 방법', value: readField(pool.reservationMethod)! });
    }

    const amenities = [
      formatBooleanLabel('스쿠버 가능', readField(pool.scubaAvailable)),
      formatBooleanLabel('프리다이빙 가능', readField(pool.freedivingAvailable)),
      formatBooleanLabel('주차 가능', readField(pool.parking)),
      formatBooleanLabel('샤워실', readField(pool.shower)),
      formatBooleanLabel('장비 렌탈', readField(pool.equipmentRental)),
      formatBooleanLabel('공기 충전', readField(pool.airFill)),
    ].filter(Boolean) as string[];

    if (amenities.length > 0) {
      highlights.push({ label: '시설', value: amenities.join(' · ') });
    }
  }

  if (category === 'site' && enrichment.site) {
    const site = enrichment.site;
    if (readField(site.depthRangeM)) highlights.push({ label: '수심', value: readField(site.depthRangeM)! });
    if (readField(site.difficulty)) highlights.push({ label: '난이도', value: readField(site.difficulty)! });
    if (readField(site.waterTemperature)) {
      highlights.push({ label: '수온', value: readField(site.waterTemperature)! });
    }
    if (readField(site.visibility)) highlights.push({ label: '시야', value: readField(site.visibility)! });
    if (readField(site.accessType)) highlights.push({ label: '접근', value: readField(site.accessType)! });
    if (readField(site.currentInfo)) highlights.push({ label: '조류', value: readField(site.currentInfo)! });
  }

  if (category === 'shop' && enrichment.shop) {
    const shop = enrichment.shop;
    const services = readField(shop.services);
    if (services?.length) highlights.push({ label: '서비스', value: services.join(' · ') });

    const features = [
      formatBooleanLabel('장비 렌탈', readField(shop.rentalAvailable)),
      formatBooleanLabel('교육/강습', readField(shop.trainingAvailable)),
      formatBooleanLabel('나이트록스', readField(shop.nitroxAvailable)),
    ].filter(Boolean) as string[];

    if (features.length > 0) {
      highlights.push({ label: '제공', value: features.join(' · ') });
    }
  }

  return highlights;
}
