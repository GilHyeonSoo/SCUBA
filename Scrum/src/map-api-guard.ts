function parseBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value == null || value.trim() === '') {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

/** Master kill switch for paid/external map & place APIs in Scrum scripts. Default: off. */
export function isMapApiEnabled(): boolean {
  return parseBoolean(process.env.MAP_API_ENABLED, false);
}

export function isGooglePlacesApiEnabled(): boolean {
  return isMapApiEnabled() && parseBoolean(process.env.GOOGLE_PLACES_API_ENABLED, false);
}

export function isNaverLocalApiEnabled(): boolean {
  return isMapApiEnabled() && parseBoolean(process.env.NAVER_LOCAL_API_ENABLED, false);
}

export function isKakaoLocalApiEnabled(): boolean {
  return isMapApiEnabled() && parseBoolean(process.env.KAKAO_LOCAL_API_ENABLED, false);
}

export function assertMapApiEnabled(scriptName: string): void {
  if (isMapApiEnabled()) {
    return;
  }

  throw new Error(
    `[${scriptName}] Map/place API calls are disabled. Set MAP_API_ENABLED=true in Scrum/.env only when you intentionally want external map API usage.`,
  );
}
