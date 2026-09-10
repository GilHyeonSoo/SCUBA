import type {
  EquipmentRentalOption,
  MeetingCategory,
  MeetingEnvironment,
  MeetingPurpose,
} from '@/src/features/tour/types';

export const meetingCategoryTabs: Array<{ value: MeetingCategory; label: string }> = [
  { value: 'buddy', label: '버디찾기' },
  { value: 'tour', label: '투어모집' },
  { value: 'education', label: '교육목적' },
];

export const meetingCategoryLabels: Record<MeetingCategory, string> = {
  buddy: '버디찾기',
  tour: '투어모집',
  education: '교육목적',
};

export const meetingEnvironmentLabels: Record<MeetingEnvironment, string> = {
  pool: '수영장',
  sea: '바다',
};

export const meetingPurposeOptions: Array<{ value: MeetingPurpose; label: string }> = [
  { value: 'fun', label: '펀다이빙' },
  { value: 'experience', label: '체험/입문' },
  { value: 'practice', label: '연습 및 훈련' },
  { value: 'certification', label: '자격 취득' },
  { value: 'tour', label: '투어 참여' },
  { value: 'photo', label: '사진/기록' },
];

export const meetingPurposeLabels = Object.fromEntries(
  meetingPurposeOptions.map((option) => [option.value, option.label]),
) as Record<MeetingPurpose, string>;

export const equipmentRentalOptions: Array<{ value: EquipmentRentalOption; label: string }> = [
  { value: 'included', label: '포함' },
  { value: 'separate', label: '별도' },
  { value: 'unnecessary', label: '불필요' },
];

export const equipmentRentalLabels = Object.fromEntries(
  equipmentRentalOptions.map((option) => [option.value, option.label]),
) as Record<EquipmentRentalOption, string>;
