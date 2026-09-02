export type BuddyDiveType = 'scuba' | 'freediving' | 'both';

export type BuddyProfile = {
  id: string;
  nickname: string;
  certification: string;
  diveType: BuddyDiveType;
  distanceKm: number;
  region: string;
  latitude: number;
  longitude: number;
  profileImageUrl: string | null;
  status: string;
};

export const buddyFilters = ['5km', '10km', '30km', '스쿠버', '프리다이빙'] as const;

export const buddyProfiles: BuddyProfile[] = [
  {
    id: 'buddy-1',
    nickname: 'Diver Kim',
    certification: 'AOW',
    diveType: 'scuba',
    distanceKm: 3.2,
    region: '동해 / 제주',
    latitude: 37.572,
    longitude: 126.991,
    profileImageUrl: null,
    status: '이번 주말 강릉 버디 찾는 중',
  },
  {
    id: 'buddy-2',
    nickname: 'BlueFin',
    certification: 'OW',
    diveType: 'both',
    distanceKm: 8.4,
    region: '서울 / 인천',
    latitude: 37.548,
    longitude: 127.02,
    profileImageUrl: null,
    status: '펀다이빙 동행 가능',
  },
  {
    id: 'buddy-3',
    nickname: 'DeepSea',
    certification: 'Freediver L2',
    diveType: 'freediving',
    distanceKm: 14.6,
    region: '한강 / 잠실',
    latitude: 37.561,
    longitude: 126.952,
    profileImageUrl: null,
    status: '프리다이빙 훈련 파트너 구함',
  },
  {
    id: 'buddy-4',
    nickname: 'WaveRider',
    certification: 'Rescue',
    diveType: 'scuba',
    distanceKm: 5.8,
    region: '서울 / 강남',
    latitude: 37.558,
    longitude: 127.005,
    profileImageUrl: null,
    status: '주말 딥 다이빙 동행',
  },
  {
    id: 'buddy-5',
    nickname: 'AquaMia',
    certification: 'AIDA 3',
    diveType: 'freediving',
    distanceKm: 22.1,
    region: '경기 남부',
    latitude: 37.535,
    longitude: 126.89,
    profileImageUrl: null,
    status: '풀 세션 함께할 버디',
  },
];

const distanceLimitsKm = [5, 10, 30] as const;

export function filterBuddyProfiles(
  buddies: BuddyProfile[],
  selectedFilterIndex: number,
): BuddyProfile[] {
  if (selectedFilterIndex <= 2) {
    const maxDistance = distanceLimitsKm[selectedFilterIndex];
    return buddies.filter((buddy) => buddy.distanceKm <= maxDistance);
  }

  if (selectedFilterIndex === 3) {
    return buddies.filter((buddy) => buddy.diveType === 'scuba' || buddy.diveType === 'both');
  }

  return buddies.filter(
    (buddy) => buddy.diveType === 'freediving' || buddy.diveType === 'both',
  );
}
