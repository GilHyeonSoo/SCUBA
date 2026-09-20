export type KnownPoolAmenities = Partial<{
  parking: boolean;
  shower: boolean;
  equipmentRental: boolean;
  airFill: boolean;
  scubaAvailable: boolean;
  freedivingAvailable: boolean;
}>;

export type KnownPoolSpec = {
  matchKeys: string[];
  maxDepthM: number;
  poolSize?: string;
  operatingHours?: string;
  priceInfo?: string;
  reservationMethod?: string;
  amenities?: KnownPoolAmenities;
  sourceUrl: string;
};

export type KnownSiteSpec = {
  matchKeys: string[];
  depthRangeM: string;
  difficulty: string;
  waterTemperature: string;
  visibility: string;
  accessType: string;
  currentInfo: string;
  sourceUrl: string;
};

/** Manually verified facility/site specs — only applied on explicit name match. */
export const KNOWN_POOLS: KnownPoolSpec[] = [
  {
    matchKeys: ['k26', 'k-26'],
    maxDepthM: 26,
    poolSize: '가로 30m, 세로 12m, 수심 1.3m, 2.5m, 5m, 26m 계단식 구조',
    operatingHours: '평일 09:00~22:00, 토/공휴일 06:00~21:00 (일요일 휴무)',
    priceInfo: '평일 33,000원 / 주말 44,000원 (3시간 기준)',
    reservationMethod: '공식 홈페이지 예약 (k-26.com)',
    amenities: {
      parking: true,
      shower: true,
      equipmentRental: true,
      airFill: true,
      scubaAvailable: true,
      freedivingAvailable: true,
    },
    sourceUrl: 'https://k-26.com/about/facility',
  },
  {
    matchKeys: ['딥스테이션'],
    maxDepthM: 36,
    poolSize: '가로 29m, 세로 12m, 최대수심 36m 실내 다이빙풀',
    operatingHours: '매일 08:00~23:00',
    priceInfo: '평일 44,000원 / 주말 66,000원 (3시간 기준)',
    reservationMethod: '네이버 예약 및 공식 홈페이지 예약',
    amenities: {
      parking: true,
      shower: true,
      equipmentRental: true,
      airFill: true,
      scubaAvailable: true,
      freedivingAvailable: true,
    },
    sourceUrl: 'http://deepstation.kr/',
  },
  {
    matchKeys: ['파라다이브'],
    maxDepthM: 35,
    poolSize: '최대수심 35m 다이빙풀',
    operatingHours: '매일 08:00~23:00',
    priceInfo: '평일 44,000원 / 주말 66,000원',
    reservationMethod: '공식 홈페이지 및 네이버 예약',
    amenities: {
      parking: true,
      shower: true,
      equipmentRental: true,
      airFill: true,
      scubaAvailable: true,
      freedivingAvailable: true,
    },
    sourceUrl: 'http://paradive.co.kr/',
  },
  {
    matchKeys: ['올림픽공원', '올림픽수영장'],
    maxDepthM: 5,
    poolSize: '25m x 25m, 수심 5m 다이빙풀',
    operatingHours: '월~토 06:00~21:00, 일/공휴일 09:00~18:00',
    priceInfo: '1일 입장권 15,000원 ~ 20,000원',
    reservationMethod: '온라인 수강신청 및 현장 발권',
    amenities: { parking: true, shower: true, scubaAvailable: true, freedivingAvailable: true },
    sourceUrl: 'https://www.ksponco.or.kr/sports/olympicpool',
  },
  {
    matchKeys: ['잠실종합운동장', '잠실 다이빙', '88다이빙'],
    maxDepthM: 5,
    poolSize: '25m x 25m, 수심 5m',
    operatingHours: '평일 06:00~22:00, 주말 09:00~18:00',
    priceInfo: '입장료 15,000원',
    reservationMethod: '서울시 공공예약 및 현장 발권',
    amenities: { parking: true, shower: true, scubaAvailable: true, freedivingAvailable: true },
    sourceUrl: 'https://stadium.seoul.go.kr',
  },
  {
    matchKeys: ['염주체육관'],
    maxDepthM: 5,
    poolSize: '25m x 25m, 수심 5m 전용풀장',
    operatingHours: '평일 06:00~22:00, 주말 09:00~18:00',
    priceInfo: '입장료 15,000원 (탱크/웨이트 포함 패키지 별도)',
    reservationMethod: '네이버 예약 및 온라인 예약',
    amenities: { parking: true, shower: true, equipmentRental: true, scubaAvailable: true },
    sourceUrl: 'https://scubapool.qshop.ai',
  },
  {
    matchKeys: ['송도종합스포츠센터', '송도스포츠파크'],
    maxDepthM: 5,
    poolSize: '25m x 10m, 수심 5m',
    operatingHours: '화~일 06:00~21:00 (월요일 정기휴관)',
    priceInfo: '입장료 15,000원',
    reservationMethod: '인천환경공단 통합예약시스템',
    amenities: { parking: true, shower: true, scubaAvailable: true },
    sourceUrl: 'https://www.eco-i.or.kr/sports/',
  },
  {
    matchKeys: ['수원월드컵'],
    maxDepthM: 5,
    poolSize: '25m x 25m, 수심 5m',
    operatingHours: '평일 06:00~22:00, 주말 06:00~20:00',
    priceInfo: '스쿠버/프리다이빙 입장권 15,000원',
    reservationMethod: '수원월드컵스포츠센터 현장 및 온라인',
    amenities: { parking: true, shower: true, scubaAvailable: true, freedivingAvailable: true },
    sourceUrl: 'https://suwonworldcup.gg.go.kr/',
  },
  {
    matchKeys: ['7000다이빙풀', '7000스쿠버'],
    maxDepthM: 5,
    poolSize: '수심 5m 다이빙 교육풀',
    operatingHours: '매일 09:00~18:00',
    reservationMethod: '전화 및 사전예약',
    amenities: { scubaAvailable: true, freedivingAvailable: true },
    sourceUrl: 'https://maps.google.com/?cid=17030024357731063299',
  },
];

export const KNOWN_SITES: KnownSiteSpec[] = [
  {
    matchKeys: ['문섬'],
    depthRangeM: '5m ~ 35m',
    difficulty: '초급 ~ 고급',
    waterTemperature: '16°C ~ 25°C',
    visibility: '10m ~ 25m',
    accessType: '보트 다이빙',
    currentInfo: '조류 강함 (물때 확인 필수)',
    sourceUrl: 'https://www.visitjeju.net',
  },
  {
    matchKeys: ['범섬'],
    depthRangeM: '10m ~ 30m',
    difficulty: '중급 ~ 고급',
    waterTemperature: '16°C ~ 25°C',
    visibility: '10m ~ 20m',
    accessType: '보트 다이빙',
    currentInfo: '조류 보통 ~ 강함',
    sourceUrl: 'https://www.visitjeju.net',
  },
  {
    matchKeys: ['섶섬'],
    depthRangeM: '5m ~ 25m',
    difficulty: '초급 ~ 중급',
    waterTemperature: '16°C ~ 25°C',
    visibility: '10m ~ 20m',
    accessType: '보트 다이빙',
    currentInfo: '조류 보통',
    sourceUrl: 'https://www.visitjeju.net',
  },
  {
    matchKeys: ['우도'],
    depthRangeM: '5m ~ 20m',
    difficulty: '초급 ~ 중급',
    waterTemperature: '15°C ~ 24°C',
    visibility: '8m ~ 18m',
    accessType: '보트 / 비치 다이빙',
    currentInfo: '조류 보통',
    sourceUrl: 'https://www.visitjeju.net',
  },
  {
    matchKeys: ['해중공원'],
    depthRangeM: '15m ~ 30m',
    difficulty: '중급 ~ 고급',
    waterTemperature: '10°C ~ 22°C',
    visibility: '5m ~ 15m',
    accessType: '보트 다이빙',
    currentInfo: '조류 약함 ~ 보통',
    sourceUrl: 'https://www.gn.go.kr',
  },
  {
    matchKeys: ['남애'],
    depthRangeM: '10m ~ 25m',
    difficulty: '초급 ~ 중급',
    waterTemperature: '10°C ~ 21°C',
    visibility: '5m ~ 15m',
    accessType: '보트 다이빙',
    currentInfo: '조류 보통',
    sourceUrl: 'https://www.yangyang.go.kr',
  },
  {
    matchKeys: ['울릉도'],
    depthRangeM: '10m ~ 40m',
    difficulty: '중급 ~ 고급',
    waterTemperature: '12°C ~ 23°C',
    visibility: '15m ~ 30m',
    accessType: '보트 다이빙',
    currentInfo: '조류 강함',
    sourceUrl: 'https://www.ulleung.go.kr',
  },
  {
    matchKeys: ['독도'],
    depthRangeM: '10m ~ 40m',
    difficulty: '고급',
    waterTemperature: '12°C ~ 23°C',
    visibility: '15m ~ 30m',
    accessType: '보트 다이빙',
    currentInfo: '조류 강함',
    sourceUrl: 'https://dokdo.mofa.go.kr',
  },
  {
    matchKeys: ['미조'],
    depthRangeM: '10m ~ 30m',
    difficulty: '중급 ~ 고급',
    waterTemperature: '14°C ~ 24°C',
    visibility: '8m ~ 18m',
    accessType: '보트 다이빙',
    currentInfo: '조류 보통 ~ 강함',
    sourceUrl: 'https://www.tournamhae.net',
  },
  {
    matchKeys: ['홍도'],
    depthRangeM: '10m ~ 35m',
    difficulty: '중급 ~ 고급',
    waterTemperature: '14°C ~ 24°C',
    visibility: '10m ~ 22m',
    accessType: '보트 다이빙',
    currentInfo: '조류 강함',
    sourceUrl: 'https://www.tongyeong.go.kr',
  },
  {
    matchKeys: ['백도', '거문도'],
    depthRangeM: '10m ~ 35m',
    difficulty: '중급 ~ 고급',
    waterTemperature: '15°C ~ 25°C',
    visibility: '10m ~ 25m',
    accessType: '보트 다이빙',
    currentInfo: '조류 강함',
    sourceUrl: 'https://www.yeosu.go.kr',
  },
];

export function matchKnownPool(name: string, nameNormalized?: string): KnownPoolSpec | undefined {
  const haystack = `${name} ${nameNormalized ?? ''}`.toLowerCase();
  return KNOWN_POOLS.find((pool) =>
    pool.matchKeys.some((key) => haystack.includes(key.toLowerCase())),
  );
}

export function matchKnownSite(name: string): KnownSiteSpec | undefined {
  return KNOWN_SITES.find((site) => site.matchKeys.some((key) => name.includes(key)));
}
