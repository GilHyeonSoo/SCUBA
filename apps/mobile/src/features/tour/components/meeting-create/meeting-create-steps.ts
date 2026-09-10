import {
  equipmentRentalLabels,
  getMeetingPurposeOptions,
  meetingCategoryLabels,
  meetingEnvironmentLabels,
} from '@/src/features/tour/constants';
import type { MeetingCategory, MeetingDraft } from '@/src/features/tour/types';
import { formatMeetingCost, formatMeetingDateRange } from '@/src/features/tour/utils';

export type MeetingCreatePhase = 'category' | 'details';

export type MeetingWizardStepId =
  | 'environment'
  | 'date'
  | 'time'
  | 'location'
  | 'cost'
  | 'purpose'
  | 'equipmentRental'
  | 'maxParticipants';

export const meetingCreateCategoryOptions: Array<{ value: MeetingCategory; label: string }> = [
  { value: 'buddy', label: meetingCategoryLabels.buddy },
  { value: 'tour', label: meetingCategoryLabels.tour },
  { value: 'education', label: meetingCategoryLabels.education },
];

const COMMON_STEPS: MeetingWizardStepId[] = [
  'date',
  'time',
  'location',
  'cost',
  'purpose',
  'equipmentRental',
  'maxParticipants',
];

export function getWizardSteps(category: MeetingCategory): MeetingWizardStepId[] {
  if (category === 'buddy') {
    return ['environment', ...COMMON_STEPS];
  }

  return COMMON_STEPS;
}

export function getWizardStepTitle(stepId: MeetingWizardStepId): string {
  switch (stepId) {
    case 'environment':
      return '다이빙 환경을 선택하세요';
    case 'date':
      return '날짜를 선택하세요';
    case 'time':
      return '시간을 선택하세요';
    case 'location':
      return '장소를 입력하세요';
    case 'cost':
      return '비용을 선택하세요';
    case 'purpose':
      return '목적을 선택하세요';
    case 'equipmentRental':
      return '장비렌탈을 선택하세요';
    case 'maxParticipants':
      return '모집인원을 입력하세요';
    default:
      return '';
  }
}

export function getWizardStepLabel(stepId: MeetingWizardStepId): string {
  switch (stepId) {
    case 'environment':
      return '환경';
    case 'date':
      return '날짜';
    case 'time':
      return '시간';
    case 'location':
      return '장소';
    case 'cost':
      return '비용';
    case 'purpose':
      return '목적';
    case 'equipmentRental':
      return '장비렌탈';
    case 'maxParticipants':
      return '모집인원';
    default:
      return '';
  }
}

export function getWizardStepSummary(draft: MeetingDraft, stepId: MeetingWizardStepId): string {
  switch (stepId) {
    case 'environment':
      return meetingEnvironmentLabels[draft.environment];
    case 'date':
      return formatMeetingDateRange(draft.date, draft.endDate);
    case 'time':
      return draft.time;
    case 'location':
      return draft.location;
    case 'cost':
      return formatMeetingCost(draft.isFree ? null : Number(draft.cost));
    case 'purpose': {
      const option = getMeetingPurposeOptions(draft.category).find(
        (item) => item.value === draft.purpose,
      );
      return option?.label ?? draft.purpose;
    }
    case 'equipmentRental':
      return equipmentRentalLabels[draft.equipmentRental];
    case 'maxParticipants':
      return `${draft.maxParticipants}명`;
    default:
      return '';
  }
}
