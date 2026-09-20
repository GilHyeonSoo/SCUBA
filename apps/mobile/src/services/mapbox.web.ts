import { isMapApiEnabled } from '@/src/services/map-api-guard';

const mapboxAccessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

export const isMapboxConfigured =
  isMapApiEnabled() &&
  mapboxAccessToken.length > 0 &&
  mapboxAccessToken.startsWith('pk.') &&
  !mapboxAccessToken.includes('your-mapbox');

export function initializeMapbox() {
  // Web uses the placeholder map; Mapbox native SDK is not loaded here.
}

export function getMapboxAccessToken() {
  return mapboxAccessToken;
}
