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

export type DiveMeeting = {
  id: string;
  title: string;
  category: MeetingCategory;
  environment: MeetingEnvironment;
  date: string;
  endDate: string;
  time: string;
  location: string;
  cost: number | null;
  purpose: MeetingPurpose;
  equipmentRental: EquipmentRentalOption;
  hostName: string;
  hostProfileImageUrl: string | null;
  coverImageUrl: string | null;
  maxParticipants: number;
  currentParticipants: number;
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
