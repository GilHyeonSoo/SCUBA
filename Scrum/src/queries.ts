import type { PlaceCategory, SearchQuery } from './types.js';

const regions = [
  '서울',
  '경기',
  '인천',
  '강원',
  '충북',
  '충남',
  '대전',
  '세종',
  '전북',
  '전남',
  '광주',
  '경북',
  '경남',
  '대구',
  '울산',
  '부산',
  '제주',
];

const categoryQueries: Record<PlaceCategory, string[]> = {
  'dive-shops': [
    '다이브샵',
    '다이빙샵',
    '스쿠버다이빙',
    '다이빙센터',
    '스쿠버 센터',
    '프리다이빙 센터',
  ],
  'dive-pools': ['잠수풀', '다이빙풀', '스쿠버 풀', '프리다이빙 풀', '실내 다이빙'],
  'dive-sites': [
    '다이빙 포인트',
    '다이빙포인트',
    '스쿠버다이빙 포인트',
    '다이빙 장소',
    '스쿠버 포인트',
  ],
};

export function buildRegionalQueries(category: PlaceCategory): SearchQuery[] {
  const baseQueries = categoryQueries[category];

  return baseQueries.flatMap((query) =>
    regions.map((region) => ({
      query: `${region} ${query}`,
      category,
      region,
    })),
  );
}

export function buildNationalQueries(category: PlaceCategory): SearchQuery[] {
  return categoryQueries[category].map((query) => ({
    query,
    category,
  }));
}

export const allCategories: PlaceCategory[] = ['dive-shops', 'dive-pools', 'dive-sites'];
