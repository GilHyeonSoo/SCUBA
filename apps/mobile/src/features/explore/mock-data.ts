import type { MapMarkerTone } from '@/src/features/map/types';

export type ExplorePlaceCategory = Exclude<MapMarkerTone, 'buddy'>;

export type ExplorePlace = {
  id: string;
  name: string;
  category: ExplorePlaceCategory;
  categoryLabel: string;
  address: string;
  latitude: number;
  longitude: number;
};

export const exploreFilters = ['전체', '잠수풀', '포인트', '샵', '투어'] as const;

export const exploreFilterCategories: Array<ExplorePlaceCategory | 'all'> = [
  'all',
  'pool',
  'site',
  'shop',
  'tour',
];

export const explorePlaces: ExplorePlace[] = [
  {
    id: 'pool-1',
    name: '잠실 잠수풀',
    category: 'pool',
    categoryLabel: '잠수풀',
    address: '서울 송파구 올림픽로 240',
    latitude: 37.5133,
    longitude: 127.0815,
  },
  {
    id: 'pool-2',
    name: '성남 잠수풀',
    category: 'pool',
    categoryLabel: '잠수풀',
    address: '경기 성남시 분당구',
    latitude: 37.4449,
    longitude: 127.1388,
  },
  {
    id: 'site-1',
    name: '강릉 사천',
    category: 'site',
    categoryLabel: '포인트',
    address: '강원도 강릉시 사천면',
    latitude: 37.8044,
    longitude: 128.8962,
  },
  {
    id: 'shop-1',
    name: '블루다이브샵',
    category: 'shop',
    categoryLabel: '샵',
    address: '서울 중구',
    latitude: 37.5512,
    longitude: 126.9882,
  },
  {
    id: 'tour-1',
    name: '제주 서귀포 투어',
    category: 'tour',
    categoryLabel: '투어',
    address: '제주 서귀포시',
    latitude: 33.2541,
    longitude: 126.5601,
  },
];
