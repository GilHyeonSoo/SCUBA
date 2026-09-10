/** Explore 기본 반경 — 사용자 위치 중심 */
export const EXPLORE_NEARBY_RADIUS_M = 3000;

/** 약 3km 반경이 보이도록 맞춘 기본 줌 (일반 폰 폭 기준) */
export const EXPLORE_DEFAULT_ZOOM = 13;

/** 이보다 줌아웃되면 지도 영역(viewport) 기준으로 마커 표시 */
export const EXPLORE_VIEWPORT_ZOOM_THRESHOLD = EXPLORE_DEFAULT_ZOOM - 0.35;

/** 장소 상세 보기 시 지도 줌 */
export const EXPLORE_PLACE_DETAIL_ZOOM = 14.5;

export const EXPLORE_SHEET_PEEK_RATIO = 0.14;
export const EXPLORE_SHEET_HALF_VISIBLE_RATIO = 0.5;
export const EXPLORE_SHEET_FULL_VISIBLE_RATIO = 0.92;
export const EXPLORE_SHEET_HEIGHT_RATIO = 0.92;

/** 진입 탱탱볼 애니메이션 — 화면 높이 대비 오프셋 비율 */
export const exploreSheetEntranceBounce = {
  /** peek 상태에서 살짝 위로 올라가는 높이 */
  lift: 0.042,
  /** peek 아래로 살짝 눌렸다 튀어 오르는 오버슈트 */
  squash: 0.016,
  /** 두 번째 작은 리바운드 */
  rebound: 0.008,
} as const;

export const exploreSheetEntranceSpring = {
  lift: {
    damping: 15,
    stiffness: 300,
    mass: 0.8,
  },
  drop: {
    damping: 10,
    stiffness: 290,
    mass: 0.8,
  },
  rebound: {
    damping: 11,
    stiffness: 310,
    mass: 0.8,
  },
  settle: {
    damping: 14,
    stiffness: 340,
    mass: 0.85,
  },
} as const;

export type ExploreSheetSnap = 'peek' | 'half' | 'full';

export type ExploreSheetOffsets = {
  peek: number;
  half: number;
  full: number;
};

export function getExploreSheetOffsets(
  screenHeight: number,
  bottomChrome = 0,
  peekRatio = EXPLORE_SHEET_PEEK_RATIO,
): ExploreSheetOffsets {
  const mapAreaHeight = Math.max(screenHeight - bottomChrome, screenHeight * 0.55);
  const sheetHeight = mapAreaHeight * EXPLORE_SHEET_HEIGHT_RATIO;

  return {
    peek: sheetHeight - mapAreaHeight * peekRatio,
    half: sheetHeight - mapAreaHeight * EXPLORE_SHEET_HALF_VISIBLE_RATIO,
    full: sheetHeight - mapAreaHeight * EXPLORE_SHEET_FULL_VISIBLE_RATIO,
  };
}

export function getMapSheetMetrics(
  screenHeight: number,
  bottomChrome = 0,
  peekRatio = EXPLORE_SHEET_PEEK_RATIO,
) {
  const mapAreaHeight = Math.max(screenHeight - bottomChrome, screenHeight * 0.55);
  const sheetHeight = mapAreaHeight * EXPLORE_SHEET_HEIGHT_RATIO;

  return {
    mapAreaHeight,
    sheetHeight,
    offsets: getExploreSheetOffsets(screenHeight, bottomChrome, peekRatio),
  };
}

export function getNearestSheetSnap(
  currentOffset: number,
  velocityY: number,
  offsets: ExploreSheetOffsets,
  allowedSnaps: ExploreSheetSnap[] = ['peek', 'half', 'full'],
): number {
  const projected = currentOffset + velocityY * 40;
  const snaps = allowedSnaps.map((snap) => offsets[snap]);

  let nearest = snaps[0];
  let nearestDistance = Math.abs(projected - snaps[0]);

  for (const snap of snaps.slice(1)) {
    const distance = Math.abs(projected - snap);
    if (distance < nearestDistance) {
      nearest = snap;
      nearestDistance = distance;
    }
  }

  return nearest;
}

/** 상세 패널 half 상태일 때 지도 카메라 하단 패딩 — 마커가 패널 위 영역 중앙에 오도록 */
export function getExploreDetailMapBottomPadding(
  screenHeight: number,
  bottomChrome = 0,
): number {
  const { mapAreaHeight } = getMapSheetMetrics(screenHeight, bottomChrome);
  return mapAreaHeight * EXPLORE_SHEET_HALF_VISIBLE_RATIO;
}

/** 내 위치 버튼 bottom 오프셋 — 바텀시트 peek 높이 + 선택적 하단 크롬(탭바) */
export function getMapMyLocationButtonBottom(
  screenHeight: number,
  bottomInset: number,
  bottomChrome = 0,
): number {
  const spacingAbovePeek = Math.max(bottomInset, 8) + 16;

  return bottomChrome + screenHeight * EXPLORE_SHEET_PEEK_RATIO + spacingAbovePeek;
}
