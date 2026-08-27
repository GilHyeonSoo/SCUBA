import { DEFAULT_MAP_CENTER } from '@/src/features/map/constants';

/** 웹 플레이스홀더 지도에서 lat/lng를 % 좌표로 변환 */
export function toPlaceholderPercent(
  latitude: number,
  longitude: number,
  center = DEFAULT_MAP_CENTER,
  span = 0.12,
) {
  const x = 50 + ((longitude - center.longitude) / span) * 50;
  const y = 50 - ((latitude - center.latitude) / span) * 50;

  return {
    x: Math.min(92, Math.max(8, x)),
    y: Math.min(88, Math.max(12, y)),
  };
}
