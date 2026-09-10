import {
  EXPLORE_DEFAULT_ZOOM,
  EXPLORE_NEARBY_RADIUS_M,
  EXPLORE_VIEWPORT_ZOOM_THRESHOLD,
} from '@/src/features/explore/constants';
import type { ExplorePlace } from '@/src/features/explore/types';
import type { MapBounds, MapViewport } from '@/src/features/map/types';

const EARTH_RADIUS_M = 6_371_000;

export type ExploreVisibilityMode = 'nearby' | 'viewport' | 'zoomed-in';

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

function metersPerPixel(latitude: number, zoomLevel: number): number {
  return (40_075_016.686 * Math.cos((latitude * Math.PI) / 180)) / 2 ** (zoomLevel + 8);
}

export function viewportToBounds(
  viewport: MapViewport,
  screenWidth: number,
  screenHeight: number,
): MapBounds {
  if (viewport.bounds) {
    return viewport.bounds;
  }

  const metersPerPx = metersPerPixel(viewport.centerLatitude, viewport.zoomLevel);
  const halfWidthM = (screenWidth / 2) * metersPerPx;
  const halfHeightM = (screenHeight / 2) * metersPerPx;
  const latDelta = halfHeightM / 111_320;
  const lngDelta =
    halfWidthM / (111_320 * Math.cos((viewport.centerLatitude * Math.PI) / 180));

  return {
    north: viewport.centerLatitude + latDelta,
    south: viewport.centerLatitude - latDelta,
    east: viewport.centerLongitude + lngDelta,
    west: viewport.centerLongitude - lngDelta,
  };
}

function padBounds(bounds: MapBounds, ratio: number): MapBounds {
  const latPad = (bounds.north - bounds.south) * ratio;
  const lngPad = (bounds.east - bounds.west) * ratio;

  return {
    north: bounds.north + latPad,
    south: bounds.south - latPad,
    east: bounds.east + lngPad,
    west: bounds.west - lngPad,
  };
}

function isPointInBounds(latitude: number, longitude: number, bounds: MapBounds): boolean {
  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    longitude >= bounds.west &&
    longitude <= bounds.east
  );
}

export function getExploreVisibilityMode(viewport: MapViewport | null): ExploreVisibilityMode {
  if (!viewport) {
    return 'nearby';
  }

  if (viewport.zoomLevel > EXPLORE_DEFAULT_ZOOM + 0.45) {
    return 'zoomed-in';
  }

  if (viewport.zoomLevel >= EXPLORE_VIEWPORT_ZOOM_THRESHOLD) {
    return 'nearby';
  }

  return 'viewport';
}

export function filterPlacesForExploreMap(
  places: ExplorePlace[],
  viewport: MapViewport | null,
  screenWidth: number,
  screenHeight: number,
  userLocation: { latitude: number; longitude: number } | null,
): ExplorePlace[] {
  if (!viewport) {
    if (!userLocation) {
      return places;
    }

    return places.filter(
      (place) =>
        haversineMeters(
          userLocation.latitude,
          userLocation.longitude,
          place.latitude,
          place.longitude,
        ) <= EXPLORE_NEARBY_RADIUS_M,
    );
  }

  const mode = getExploreVisibilityMode(viewport);
  const bounds = padBounds(viewportToBounds(viewport, screenWidth, screenHeight), 0.04);

  if (mode === 'nearby' && userLocation) {
    return places.filter(
      (place) =>
        haversineMeters(
          userLocation.latitude,
          userLocation.longitude,
          place.latitude,
          place.longitude,
        ) <= EXPLORE_NEARBY_RADIUS_M,
    );
  }

  return places.filter((place) =>
    isPointInBounds(place.latitude, place.longitude, bounds),
  );
}

export function sortPlacesForExploreList(
  places: ExplorePlace[],
  userLocation: { latitude: number; longitude: number } | null,
): ExplorePlace[] {
  if (!userLocation) {
    return places;
  }

  return [...places].sort((left, right) => {
    const leftDistance = haversineMeters(
      userLocation.latitude,
      userLocation.longitude,
      left.latitude,
      left.longitude,
    );
    const rightDistance = haversineMeters(
      userLocation.latitude,
      userLocation.longitude,
      right.latitude,
      right.longitude,
    );

    return leftDistance - rightDistance;
  });
}

export function getExploreListTitle(mode: ExploreVisibilityMode): string {
  switch (mode) {
    case 'nearby':
      return '주변 3km';
    case 'viewport':
      return '이 지도 영역';
    case 'zoomed-in':
      return '주변 장소';
  }
}
