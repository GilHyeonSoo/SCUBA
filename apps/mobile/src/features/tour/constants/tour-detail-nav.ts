import type { TourDetailNavSection } from '@/src/features/tour/types/tour-meeting-detail';

export const TOUR_DETAIL_NAV_ITEMS: Array<{ id: TourDetailNavSection; label: string }> = [
  { id: 'date', label: '날짜' },
  { id: 'intro', label: '투어소개' },
  { id: 'schedule', label: '일정표' },
  { id: 'terms', label: '상세정보' },
  { id: 'map', label: '지도' },
];

export const TOUR_DETAIL_STICKY_NAV_HEIGHT = 48;
