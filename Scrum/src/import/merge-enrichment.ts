import type { NormalizedPlace } from '../pipeline/types.js';
import type { PlaceEnrichment } from '../enrichment/types.js';

export function mergePlaceWithEnrichment(
  place: NormalizedPlace,
  enrichment?: PlaceEnrichment,
): NormalizedPlace {
  if (!enrichment) return place;

  return {
    ...place,
    phone: enrichment.phone?.value ?? place.phone,
    website: enrichment.website?.value ?? place.website,
    naverMapUrl: enrichment.naverPlacePageUrl ?? place.naverMapUrl,
    // short_description lives on DB row only; keep on enrichment for import mapper
  };
}

export type ImportEnrichmentBundle = {
  place: NormalizedPlace;
  enrichment: PlaceEnrichment;
};

export function buildImportBundles(
  places: NormalizedPlace[],
  enrichments: PlaceEnrichment[],
): ImportEnrichmentBundle[] {
  const enrichmentById = new Map(enrichments.map((item) => [item.id, item]));

  return places.map((place) => {
    const enrichment = enrichmentById.get(place.id);
    if (!enrichment) {
      throw new Error(`Missing enrichment for place ${place.id} (${place.name})`);
    }
    return {
      place: mergePlaceWithEnrichment(place, enrichment),
      enrichment,
    };
  });
}
