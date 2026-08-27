import type { MapMarker } from '@/src/features/map/types';

export const mockCurrentUserMapMarker: MapMarker = {
  id: 'me',
  label: '나',
  latitude: 37.5665,
  longitude: 126.978,
  tone: 'buddy',
  variant: 'profile',
  isCurrentUser: true,
  profileImageUrl: null,
};

export const exploreMapMarkers: MapMarker[] = [
  {
    id: 'pool-1',
    label: '잠실 잠수풀',
    latitude: 37.5133,
    longitude: 127.0815,
    tone: 'pool',
  },
  {
    id: 'pool-2',
    label: '성남 잠수풀',
    latitude: 37.4449,
    longitude: 127.1388,
    tone: 'pool',
  },
  {
    id: 'site-1',
    label: '강릉 사천',
    latitude: 37.8044,
    longitude: 128.8962,
    tone: 'site',
  },
  {
    id: 'shop-1',
    label: '다이브샵',
    latitude: 37.5512,
    longitude: 126.9882,
    tone: 'shop',
  },
  {
    id: 'tour-1',
    label: '제주 투어',
    latitude: 33.2541,
    longitude: 126.5601,
    tone: 'tour',
  },
];

export const buddyMapMarkers: MapMarker[] = [
  {
    id: 'buddy-1',
    label: 'Diver Kim',
    latitude: 37.572,
    longitude: 126.991,
    tone: 'buddy',
    variant: 'profile',
    profileImageUrl: null,
  },
  {
    id: 'buddy-2',
    label: 'BlueFin',
    latitude: 37.548,
    longitude: 127.02,
    tone: 'buddy',
    variant: 'profile',
    profileImageUrl: null,
  },
  {
    id: 'buddy-3',
    label: 'DeepSea',
    latitude: 37.561,
    longitude: 126.952,
    tone: 'buddy',
    variant: 'profile',
    profileImageUrl: null,
  },
];

export const buddyScreenMarkers: MapMarker[] = [
  mockCurrentUserMapMarker,
  ...buddyMapMarkers,
];

export const mockUserMapLocation = {
  latitude: mockCurrentUserMapMarker.latitude,
  longitude: mockCurrentUserMapMarker.longitude,
  zoomLevel: 13.5,
} as const;
