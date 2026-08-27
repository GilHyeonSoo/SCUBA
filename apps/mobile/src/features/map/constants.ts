export const DEFAULT_MAP_CENTER = {
  latitude: 37.5665,
  longitude: 126.978,
} as const;

export const DEFAULT_MAP_ZOOM = 10.5;

/** 내 위치 중심 지도 줌 */
export const USER_LOCATION_ZOOM = 13.5;

/** Mapbox light style — SCUBA white + blue 톤과 잘 맞음 */
export const MAPBOX_STYLE_URL = 'mapbox://styles/mapbox/outdoors-v12';

/** Mapbox 지도 라벨 언어 (ISO 639-1) */
export const MAPBOX_LABEL_LOCALE = 'ko';

/** iOS 시뮬레이터·터치패드·핀치 등 지도 제스처 활성화 */
export const MAP_GESTURE_SETTINGS = {
  panEnabled: true,
  pinchZoomEnabled: true,
  pinchPanEnabled: true,
  rotateEnabled: true,
  pitchEnabled: false,
  doubleTapToZoomInEnabled: true,
  doubleTouchToZoomOutEnabled: true,
  quickZoomEnabled: true,
  simultaneousRotateAndPinchZoomEnabled: true,
} as const;
