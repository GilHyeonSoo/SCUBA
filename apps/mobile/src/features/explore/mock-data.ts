import type { ExplorePlace } from '@/src/features/explore/types';

/** Offline / Supabase 미설정 시 폴백 데이터 */
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
];
