import { homeAdImages } from '@/src/features/home/mock-data/home-ad-images';

export type HomeDivePlan = {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  diveType: 'scuba' | 'freediving';
};

export type HomeBuddy = {
  id: string;
  nickname: string;
  certification: string;
  diveCount: number;
  region: string;
  status: string;
};

export type HomeTour = {
  id: string;
  title: string;
  location: string;
  date: string;
  participants: string;
  type: 'community' | 'official';
};

export type HomeMaintenance = {
  id: string;
  equipmentName: string;
  status: 'due' | 'upcoming' | 'ok';
  message: string;
};

export type HomeRecentDive = {
  id: string;
  site: string;
  date: string;
  maxDepth: number;
  duration: number;
};

export type HomeAdBanner = {
  id: string;
  title: string;
  subtitle: string;
  cta?: string;
  badge?: string;
  sponsor: string;
  imageUri: string;
  gradient: readonly [string, string, ...string[]];
};

export const mockHomeData = {
  region: '서울',
  country: '대한민국',
  locationLabel: '서울, 대한민국',
  nextDive: {
    id: '1',
    title: '강릉 사천 포인트',
    location: '강원도 강릉시',
    date: '9월 12일 (토)',
    time: '08:00',
    diveType: 'scuba' as const,
  },
  nearbyBuddies: [
    {
      id: 'b1',
      nickname: 'Diver Kim',
      certification: 'AOW',
      diveCount: 63,
      region: '동해 / 제주',
      status: '이번 주말 강릉 버디 찾는 중',
    },
    {
      id: 'b2',
      nickname: 'BlueFin',
      certification: 'OW',
      diveCount: 28,
      region: '서울 / 인천',
      status: '펀다이빙 동행 가능',
    },
  ] as HomeBuddy[],
  upcomingTour: {
    id: 't1',
    title: '제주 서귀포 보트 다이빙',
    location: '제주 서귀포',
    date: '9월 20일',
    participants: '6/8명',
    type: 'official' as const,
  },
  maintenance: [
    {
      id: 'm1',
      equipmentName: 'Regulator (Scubapro MK25)',
      status: 'due' as const,
      message: '점검 예정 · 12개월 또는 100다이브',
    },
  ] as HomeMaintenance[],
  recentDive: {
    id: 'd1',
    site: '속초 대포항',
    date: '8월 18일',
    maxDepth: 18,
    duration: 42,
  },
  adBanners: [
    {
      id: 'ad1',
      badge: '공식 투어',
      sponsor: '제주 마린다이브',
      title: '제주 서귀포 보트 다이빙',
      subtitle: '가을 시즌 얼리버드 · 잔여 2석',
      cta: '투어 보기',
      imageUri: homeAdImages.jejuBoatTour,
      gradient: ['rgba(0, 46, 88, 0.72)', 'rgba(0, 92, 150, 0.35)'],
    },
    {
      id: 'ad2',
      badge: '장비 특가',
      sponsor: 'Shearwater Korea',
      title: '다이브 컴퓨터 업그레이드',
      subtitle: 'Teric · 펌웨어 업데이트 가이드 포함',
      cta: '추천 보기',
      imageUri: homeAdImages.diveComputer,
      gradient: ['rgba(0, 80, 130, 0.78)', 'rgba(83, 131, 230, 0.28)'],
    },
    {
      id: 'ad3',
      badge: '다이브 풀',
      sponsor: '잠실 잠수풀',
      title: '서울 실내 다이브 풀 예약',
      subtitle: '스쿠버 · 프리다이빙 연습 공간',
      cta: '풀 찾기',
      imageUri: homeAdImages.seoulDivePool,
      gradient: ['rgba(6, 31, 66, 0.82)', 'rgba(0, 92, 150, 0.32)'],
    },
  ] as HomeAdBanner[],
};
