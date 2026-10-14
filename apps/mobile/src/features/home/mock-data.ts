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

export type HomeKDivingPulseSpot = {
  id: string;
  name: string;
  region: string;
  visibilityLabel: string;
  waterTempC: number;
  note: string;
};

export type HomeSeaPulse = {
  region: string;
  periodLabel: string;
  logCount7d: number;
  visibilityLabel: string;
  avgTempC: number;
};

export type HomeOnThisDayMemory = {
  id: string;
  yearsAgo: number;
  date: string;
  site: string;
  durationMin: number;
  maxDepthM: number;
  buddy?: string;
};

export type HomeBlueTrajectory = {
  newSitesThisYear: number;
  underwaterHours: number;
  seasonStamp: {
    label: string;
    completed: number;
    total: number;
  };
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
  kDivingPulse: [
    {
      id: 'spot1',
      name: '아야진',
      region: '강원 고성 · 동해',
      visibilityLabel: '12–15m',
      waterTempC: 21,
      note: '오전 입수가 잔잔하고 시야가 깔끔해요.',
    },
    {
      id: 'spot2',
      name: '딥스테이션',
      region: '경기 용인 · 실내',
      visibilityLabel: '맑음',
      waterTempC: 29,
      note: '수심 훈련과 장비 체크를 함께 하기 좋아요.',
    },
  ] as HomeKDivingPulseSpot[],
  seaPulse: {
    region: '속초',
    periodLabel: '최근 7일',
    logCount7d: 38,
    visibilityLabel: '좋음',
    avgTempC: 21.4,
  } as HomeSeaPulse,
  logInsight: '지난 5회보다 평균 다이브 시간이 6분 길었어요.',
  onThisDay: {
    id: 'memory1',
    yearsAgo: 1,
    date: '2025년 9월 21일',
    site: '제주 문섬 한개창',
    durationMin: 51,
    maxDepthM: 24.6,
    buddy: 'Diver Kim',
  } as HomeOnThisDayMemory,
  blueTrajectory: {
    newSitesThisYear: 7,
    underwaterHours: 18.6,
    seasonStamp: {
      label: '가을 동해',
      completed: 2,
      total: 4,
    },
  } as HomeBlueTrajectory,
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
