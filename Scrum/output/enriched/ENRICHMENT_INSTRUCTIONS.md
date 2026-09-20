# Place Enrichment Task

## Input
- `/Users/apple/Desktop/SCUBA/Scrum/output/normalized/places.json` (1103 places)

## Output directory
- `/Users/apple/Desktop/SCUBA/Scrum/output/enriched/`

## Schema
- See `/Users/apple/Desktop/SCUBA/Scrum/src/enrichment/types.ts`

## Rules

### Image URL sources (STRICT)
Only collect image URLs from:
1. **Official website** of the business/facility
2. **Google Maps / Google Places** page photos
3. **Naver Place** (map.naver.com / place.naver.com) page photos

Do NOT use:
- Random image search results
- Instagram, Facebook, blog hotlinks
- Stock photo sites
- Fabricated or guessed URLs

### Data integrity
- Never fabricate data. Use `null` / omit field if not found.
- Every populated field must have `sourceUrl` and `collectedAt` (ISO 8601).
- Each image must have `url`, `source`, `sourcePageUrl`.
- Mark one image as `isPrimary: true` when possible.

### enrichmentStatus
- `complete`: description + at least 2 type-specific fields or 1+ image
- `partial`: some fields found but sparse
- `not_found`: no useful enrichment from allowed sources
- `error`: lookup failed

### Batch files
Process ALL 1103 places in batches of 50:
- `batch-001.json` … `batch-023.json` (last batch may be smaller)
- After all batches: merge into `places-enriched.json`
- Write `enrichment-report.json` summary

### Lookup priority per place
1. Existing `website`, `googleMapsUrl`, `naverMapUrl`, `kakaoMapUrl`
2. Naver search for place name + address → Naver Place page
3. Google search for place name + address → official site or Google Maps

### Type-specific fields

**pool**: maxDepthM, poolSize, operatingHours, priceInfo, reservationMethod, parking, shower, equipmentRental, airFill, scubaAvailable, freedivingAvailable

**site**: depthRangeM, difficulty, waterTemperature, visibility, accessType, currentInfo

**shop**: services, operatingHours, rentalAvailable, trainingAvailable, nitroxAvailable
