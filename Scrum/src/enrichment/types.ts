/**
 * Place enrichment schema — supplemental data collected via web research.
 * Merged into places by `id`. Image URLs must come only from allowed sources.
 */

import type { OperatingHoursTable } from './operating-hours-table.js';

export type ImageSource = 'official_website' | 'google_places' | 'naver_place';

export type { OperatingHoursDay, OperatingHoursRow, OperatingHoursTable } from './operating-hours-table.js';

export type EnrichedImage = {
  url: string;
  source: ImageSource;
  sourcePageUrl: string;
  caption?: string;
  isPrimary?: boolean;
};

export type FieldWithSource<T> = {
  value: T;
  sourceUrl: string;
  collectedAt: string;
  /** true when sourced from manually verified curated profiles */
  verified?: boolean;
};

export type KnownDataApplied = {
  profile: 'pool' | 'site';
  matchKey: string;
  verified: true;
};

export type PoolEnrichment = {
  maxDepthM?: FieldWithSource<number>;
  poolSize?: FieldWithSource<string>;
  operatingHours?: FieldWithSource<OperatingHoursTable>;
  priceInfo?: FieldWithSource<string>;
  reservationMethod?: FieldWithSource<string>;
  parking?: FieldWithSource<boolean>;
  shower?: FieldWithSource<boolean>;
  equipmentRental?: FieldWithSource<boolean>;
  airFill?: FieldWithSource<boolean>;
  scubaAvailable?: FieldWithSource<boolean>;
  freedivingAvailable?: FieldWithSource<boolean>;
};

export type SiteEnrichment = {
  depthRangeM?: FieldWithSource<string>;
  difficulty?: FieldWithSource<string>;
  waterTemperature?: FieldWithSource<string>;
  visibility?: FieldWithSource<string>;
  accessType?: FieldWithSource<string>;
  currentInfo?: FieldWithSource<string>;
};

export type ShopEnrichment = {
  services?: FieldWithSource<string[]>;
  operatingHours?: FieldWithSource<OperatingHoursTable>;
  rentalAvailable?: FieldWithSource<boolean>;
  trainingAvailable?: FieldWithSource<boolean>;
  nitroxAvailable?: FieldWithSource<boolean>;
};

export type PlaceEnrichment = {
  id: string;
  placeType: 'shop' | 'pool' | 'site';
  enrichedAt: string;
  enrichmentStatus: 'complete' | 'partial' | 'not_found' | 'error';
  /** Short description from official or place page only */
  shortDescription?: FieldWithSource<string>;
  /** Phone if missing or updated from official source */
  phone?: FieldWithSource<string>;
  /** Website if missing or updated from official source */
  website?: FieldWithSource<string>;
  images: EnrichedImage[];
  pool?: PoolEnrichment;
  site?: SiteEnrichment;
  shop?: ShopEnrichment;
  /** Resolved Naver Place page used for enrichment */
  naverPlacePageUrl?: string;
  /** Applied manually verified curated profile, if any */
  knownDataApplied?: KnownDataApplied;
  /** URLs visited during enrichment */
  sourcesChecked: string[];
  notes?: string;
};

export type EnrichmentFile = {
  meta: {
    batchIndex: number;
    batchSize: number;
    placeType?: 'shop' | 'pool' | 'site';
    enrichedAt: string;
    completeCount: number;
    partialCount: number;
    notFoundCount: number;
    errorCount: number;
  };
  items: PlaceEnrichment[];
};

export type EnrichmentSummary = {
  meta: {
    totalPlaces: number;
    enrichedAt: string;
    completeCount: number;
    partialCount: number;
    notFoundCount: number;
    errorCount: number;
    withImagesCount: number;
    withDescriptionCount: number;
    naverPlaceImagesCount: number;
    verifiedKnownDataCount: number;
    byPlaceType: Record<'shop' | 'pool' | 'site', {
      total: number;
      complete: number;
      partial: number;
      notFound: number;
      withImages: number;
    }>;
  };
  items: PlaceEnrichment[];
};
