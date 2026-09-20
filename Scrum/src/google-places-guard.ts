/**
 * Guardrails for billable Google Places API usage in offline Scrum scripts.
 * Default: Google Places calls are BLOCKED unless explicitly enabled.
 */

export type GooglePlacesUsageKind = 'text_search' | 'place_details' | 'place_photo';

export type GooglePlacesUsageEstimate = {
  textSearch: number;
  placeDetails: number;
  placePhotos: number;
  totalBillableCalls: number;
  estimatedUsdMin: number;
  estimatedUsdMax: number;
};

const USD_PER_1000: Record<GooglePlacesUsageKind, { min: number; max: number }> = {
  text_search: { min: 17, max: 32 },
  place_details: { min: 17, max: 25 },
  place_photo: { min: 7, max: 7 },
};

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

export function isGooglePlacesApiEnabled(): boolean {
  const mapEnabled = parseBoolean(process.env.MAP_API_ENABLED);
  const googleEnabled = parseBoolean(process.env.GOOGLE_PLACES_API_ENABLED);
  return mapEnabled && googleEnabled;
}

export function isGooglePlacesDryRun(): boolean {
  return parseBoolean(process.env.GOOGLE_PLACES_DRY_RUN);
}

export function getGooglePlacesMaxPlaces(): number {
  return parsePositiveInt(process.env.GOOGLE_PLACES_MAX_PLACES, 25);
}

export function getGooglePlacesMaxPhotosPerPlace(): number {
  return parsePositiveInt(process.env.GOOGLE_PLACES_MAX_PHOTOS_PER_PLACE, 0);
}

export function getGooglePlacesMaxBillableCalls(): number {
  return parsePositiveInt(process.env.GOOGLE_PLACES_MAX_BILLABLE_CALLS, 100);
}

export function requireGooglePlacesConfirmation(
  scriptName: string,
  estimate: GooglePlacesUsageEstimate,
): void {
  if (!isGooglePlacesApiEnabled()) {
    throw new Error(
      [
        `[${scriptName}] Google Places API calls are disabled.`,
        'Set MAP_API_ENABLED=true and GOOGLE_PLACES_API_ENABLED=true in Scrum/.env only when you intentionally want to spend API quota.',
        'Use GOOGLE_PLACES_DRY_RUN=true to preview counts without billing.',
      ].join(' '),
    );
  }

  if (isGooglePlacesDryRun()) {
    printGooglePlacesEstimate(scriptName, estimate);
    throw new Error(
      `[${scriptName}] Dry run complete. No Google Places API calls were made. Remove GOOGLE_PLACES_DRY_RUN or set it to false to execute.`,
    );
  }

  const maxCalls = getGooglePlacesMaxBillableCalls();
  if (estimate.totalBillableCalls > maxCalls) {
    throw new Error(
      `[${scriptName}] Estimated billable calls (${estimate.totalBillableCalls}) exceed GOOGLE_PLACES_MAX_BILLABLE_CALLS=${maxCalls}. Raise the cap only after reviewing cost.`,
    );
  }

  const confirm = process.env.GOOGLE_PLACES_CONFIRM?.trim();
  if (confirm !== 'I_ACCEPT_GOOGLE_PLACES_COST') {
    printGooglePlacesEstimate(scriptName, estimate);
    throw new Error(
      [
        `[${scriptName}] Missing cost confirmation.`,
        'Set GOOGLE_PLACES_CONFIRM=I_ACCEPT_GOOGLE_PLACES_COST after reviewing the estimate.',
      ].join(' '),
    );
  }
}

export function estimateTextSearchUsage(queryCount: number): GooglePlacesUsageEstimate {
  const textSearch = queryCount;
  const estimatedUsdMin = (textSearch / 1000) * USD_PER_1000.text_search.min;
  const estimatedUsdMax = (textSearch / 1000) * USD_PER_1000.text_search.max;

  return {
    textSearch,
    placeDetails: 0,
    placePhotos: 0,
    totalBillableCalls: textSearch,
    estimatedUsdMin,
    estimatedUsdMax,
  };
}

export function estimateEnrichmentGoogleUsage(input: {
  placeCount: number;
  maxPhotosPerPlace: number;
  includeFallbackTextSearchRatio?: number;
}): GooglePlacesUsageEstimate {
  const placeDetails = input.placeCount;
  const textSearch = Math.ceil(input.placeCount * (input.includeFallbackTextSearchRatio ?? 0.1));
  const placePhotos = input.placeCount * input.maxPhotosPerPlace;

  const textSearchUsd =
    (textSearch / 1000) *
    ((USD_PER_1000.text_search.min + USD_PER_1000.text_search.max) / 2);
  const detailsUsd =
    (placeDetails / 1000) *
    ((USD_PER_1000.place_details.min + USD_PER_1000.place_details.max) / 2);
  const photosUsd = (placePhotos / 1000) * USD_PER_1000.place_photo.min;

  const estimatedUsdMin =
    (textSearch / 1000) * USD_PER_1000.text_search.min +
    (placeDetails / 1000) * USD_PER_1000.place_details.min +
    (placePhotos / 1000) * USD_PER_1000.place_photo.min;
  const estimatedUsdMax =
    (textSearch / 1000) * USD_PER_1000.text_search.max +
    (placeDetails / 1000) * USD_PER_1000.place_details.max +
    (placePhotos / 1000) * USD_PER_1000.place_photo.max;

  return {
    textSearch,
    placeDetails,
    placePhotos,
    totalBillableCalls: textSearch + placeDetails + placePhotos,
    estimatedUsdMin,
    estimatedUsdMax: Math.max(estimatedUsdMax, textSearchUsd + detailsUsd + photosUsd),
  };
}

export function printGooglePlacesEstimate(scriptName: string, estimate: GooglePlacesUsageEstimate): void {
  const krwMin = Math.round(estimate.estimatedUsdMin * 1400);
  const krwMax = Math.round(estimate.estimatedUsdMax * 1400);

  console.warn(`\n=== Google Places cost estimate (${scriptName}) ===`);
  console.warn(`Text Search:     ${estimate.textSearch}`);
  console.warn(`Place Details:   ${estimate.placeDetails}`);
  console.warn(`Place Photos:    ${estimate.placePhotos}`);
  console.warn(`Total calls:     ${estimate.totalBillableCalls}`);
  console.warn(`Estimated cost:  $${estimate.estimatedUsdMin.toFixed(2)} – $${estimate.estimatedUsdMax.toFixed(2)} (~₩${krwMin.toLocaleString()} – ₩${krwMax.toLocaleString()})`);
  console.warn('================================================\n');
}

export class GooglePlacesBudgetExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GooglePlacesBudgetExceededError';
  }
}

export class GooglePlacesUsageTracker {
  private textSearch = 0;
  private placeDetails = 0;
  private placePhotos = 0;

  constructor(private readonly maxBillableCalls: number) {}

  record(kind: GooglePlacesUsageKind, count = 1): void {
    if (kind === 'text_search') this.textSearch += count;
    if (kind === 'place_details') this.placeDetails += count;
    if (kind === 'place_photo') this.placePhotos += count;

    if (this.total() > this.maxBillableCalls) {
      throw new GooglePlacesBudgetExceededError(
        `Google Places billable call budget exceeded (${this.total()} > ${this.maxBillableCalls}). Stopping to prevent further charges.`,
      );
    }
  }

  total(): number {
    return this.textSearch + this.placeDetails + this.placePhotos;
  }

  snapshot(): GooglePlacesUsageEstimate {
    const estimatedUsdMin =
      (this.textSearch / 1000) * USD_PER_1000.text_search.min +
      (this.placeDetails / 1000) * USD_PER_1000.place_details.min +
      (this.placePhotos / 1000) * USD_PER_1000.place_photo.min;
    const estimatedUsdMax =
      (this.textSearch / 1000) * USD_PER_1000.text_search.max +
      (this.placeDetails / 1000) * USD_PER_1000.place_details.max +
      (this.placePhotos / 1000) * USD_PER_1000.place_photo.max;

    return {
      textSearch: this.textSearch,
      placeDetails: this.placeDetails,
      placePhotos: this.placePhotos,
      totalBillableCalls: this.total(),
      estimatedUsdMin,
      estimatedUsdMax,
    };
  }
}
