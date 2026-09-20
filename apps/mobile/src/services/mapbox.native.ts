import Mapbox from '@rnmapbox/maps';

import { isMapApiEnabled } from '@/src/services/map-api-guard';

const mapboxAccessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

export const isMapboxConfigured =
  isMapApiEnabled() &&
  mapboxAccessToken.length > 0 &&
  mapboxAccessToken.startsWith('pk.') &&
  !mapboxAccessToken.includes('your-mapbox');

let initialized = false;

export function initializeMapbox() {
  if (!isMapboxConfigured || initialized) {
    return;
  }

  Mapbox.setAccessToken(mapboxAccessToken);
  initialized = true;
}

export function getMapboxAccessToken() {
  return mapboxAccessToken;
}
