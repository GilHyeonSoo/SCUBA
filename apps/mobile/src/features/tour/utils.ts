import { meetingCategoryLabels } from '@/src/features/tour/constants';
import type { MeetingCategory } from '@/src/features/tour/types';
import type { DiveMeeting, MeetingDraft } from '@/src/features/tour/types';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function formatMeetingDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()];

  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} (${weekday})`;
}

export function formatMeetingDateRange(date: string, endDate: string): string {
  if (date === endDate) {
    return formatMeetingDate(date);
  }

  return `${formatMeetingDate(date)} ~ ${formatMeetingDate(endDate)}`;
}

export function formatMeetingDateRangeCompact(date: string, endDate: string): string {
  if (date === endDate) {
    return formatMeetingDateCompact(date);
  }

  return `${formatMeetingDateCompact(date)} ~ ${formatMeetingDateCompact(endDate)}`;
}

export function formatMeetingDateCompact(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()];
  const currentYear = new Date().getFullYear();

  if (year === currentYear) {
    return `${month}.${day} (${weekday})`;
  }

  return `${String(year).slice(2)}.${month}.${day} (${weekday})`;
}

export function formatMeetingCost(cost: number | null): string {
  if (cost === null || cost === 0) {
    return '무료';
  }

  return `₩${cost.toLocaleString('ko-KR')}`;
}

export function formatMeetingParticipants(meeting: DiveMeeting): string {
  return `${meeting.currentParticipants}/${meeting.maxParticipants}`;
}

export function formatMeetingScheduleLine(meeting: DiveMeeting): string {
  return `${formatMeetingDateRangeCompact(meeting.date, meeting.endDate)} ${meeting.time} · ${meeting.location}`;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function formatDraftDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatDraftTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function parseDraftDate(value: string): Date {
  if (!DATE_PATTERN.test(value.trim())) {
    return new Date();
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function parseDraftTime(value: string, baseDate = new Date()): Date {
  if (!TIME_PATTERN.test(value.trim())) {
    return baseDate;
  }

  const [hours, minutes] = value.split(':').map(Number);
  const next = new Date(baseDate);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function filterMeetings(
  meetings: DiveMeeting[],
  category: MeetingCategory,
): DiveMeeting[] {
  return meetings.filter((meeting) => meeting.category === category);
}

export function validateMeetingDraft(draft: MeetingDraft): string | null {
  if (!DATE_PATTERN.test(draft.date.trim())) {
    return '시작 날짜는 YYYY-MM-DD 형식으로 입력해 주세요.';
  }

  if (!DATE_PATTERN.test(draft.endDate.trim())) {
    return '종료 날짜는 YYYY-MM-DD 형식으로 입력해 주세요.';
  }

  if (parseDraftDate(draft.endDate) < parseDraftDate(draft.date)) {
    return '종료 날짜는 시작 날짜보다 빠를 수 없습니다.';
  }

  if (!TIME_PATTERN.test(draft.time.trim())) {
    return '시간은 HH:MM 형식으로 입력해 주세요.';
  }

  if (draft.location.trim().length < 2) {
    return '장소를 입력해 주세요.';
  }

  if (!draft.isFree) {
    const cost = Number(draft.cost);
    if (!Number.isFinite(cost) || cost < 0) {
      return '비용을 올바르게 입력해 주세요.';
    }
  }

  const maxParticipants = Number(draft.maxParticipants);
  if (!Number.isInteger(maxParticipants) || maxParticipants < 2) {
    return '모집 인원은 2명 이상으로 입력해 주세요.';
  }

  return null;
}

export function meetingDraftToMeeting(
  draft: MeetingDraft,
  host: { displayName: string; profileImageUrl: string | null },
): DiveMeeting {
  const cost = draft.isFree ? null : Number(draft.cost);

  const location = draft.location.trim();
  const title =
    draft.title.trim() ||
    `${meetingCategoryLabels[draft.category]} · ${location}`;

  return {
    id: `meeting-${Date.now()}`,
    title,
    category: draft.category,
    environment: draft.environment,
    date: draft.date.trim(),
    endDate: draft.endDate.trim(),
    time: draft.time.trim(),
    location: draft.location.trim(),
    cost: Number.isFinite(cost) ? cost : null,
    purpose: draft.purpose,
    equipmentRental: draft.equipmentRental,
    hostName: host.displayName,
    hostProfileImageUrl: host.profileImageUrl,
    coverImageUrl: null,
    maxParticipants: Number(draft.maxParticipants),
    currentParticipants: 1,
  };
}
