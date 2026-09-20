function parseBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value == null || value.trim() === '') {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

/** Master kill switch for Mapbox tile/network usage in the mobile app. Default: off. */
export function isMapApiEnabled(): boolean {
  return parseBoolean(process.env.EXPO_PUBLIC_MAP_API_ENABLED, false);
}

export const MAP_API_DISABLED_MESSAGE =
  '지도 API 호출이 비활성화되어 있습니다. EXPO_PUBLIC_MAP_API_ENABLED=true 로만 Mapbox를 사용합니다.';
