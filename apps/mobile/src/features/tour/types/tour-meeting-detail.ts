export type TourDetailNavSection = 'date' | 'intro' | 'schedule' | 'terms' | 'map';

export type TourContentBlock =
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'body'; text: string }
  | { type: 'image'; uri: string; caption?: string }
  | { type: 'bulletList'; title?: string; items: string[] };

export type TourDetailTermsBlock = {
  title: string;
  paragraphs: string[];
};

export type TourScheduleRow = {
  time: string;
  activity: string;
};

export type TourScheduleDay = {
  dayLabel: string;
  rows: TourScheduleRow[];
};

export type TourScheduleTable = {
  days: TourScheduleDay[];
};

export type TourMeetingDetailMock = {
  meetingId: string;
  profileTagline: string;
  profileHighlights: string[];
  introBlocks: TourContentBlock[];
  scheduleTable: TourScheduleTable;
  terms: TourDetailTermsBlock[];
};

export const TOUR_DETAIL_TERMS_COLLAPSED_PARAGRAPH_COUNT = 3;
