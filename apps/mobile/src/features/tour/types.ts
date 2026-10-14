export type MeetingCategory = 'buddy' | 'tour' | 'education';

export type MeetingEnvironment = 'pool' | 'sea';

export type MeetingPurpose =
  | 'fun'
  | 'experience'
  | 'practice'
  | 'certification'
  | 'tour'
  | 'photo';

export type EquipmentRentalOption = 'included' | 'separate' | 'unnecessary';

/** 투어모집 리스트 카드용 mock·표시 메타 (투어 카테고리) */
export type TourListingBadge = {
  label: string;
  showInfoIcon?: boolean;
};

export type TourMeetingListing = {
  badges: TourListingBadge[];
  hashtags: string[];
  /** 달력 줄: 예) 1박 2일 · 보트 포함 패키지 */
  durationPackageLine: string;
  /** 비행기 줄: 예) 항공불포함 — 없으면 생략 */
  transportLine?: string | null;
  /** 가격 뒤 ~ 표시 */
  priceFrom?: boolean;
};

export type DiveMeeting = {
  id: string;
  title: string;
  category: MeetingCategory;
  environment: MeetingEnvironment;
  date: string;
  endDate: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  cost: number | null;
  purpose: MeetingPurpose;
  equipmentRental: EquipmentRentalOption;
  hostName: string;
  hostProfileImageUrl: string | null;
  coverImageUrl: string | null;
  maxParticipants: number;
  currentParticipants: number;
  tourListing?: TourMeetingListing;
};

export type MeetingDraft = {
  title: string;
  category: MeetingCategory;
  environment: MeetingEnvironment;
  date: string;
  endDate: string;
  time: string;
  location: string;
  isFree: boolean;
  cost: string;
  purpose: MeetingPurpose;
  equipmentRental: EquipmentRentalOption;
  maxParticipants: string;
};
