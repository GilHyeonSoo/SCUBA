export const OPERATING_DAYS = [
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
  '일요일',
] as const;

export type OperatingHoursDay = (typeof OPERATING_DAYS)[number];

export type OperatingHoursRow = {
  day: OperatingHoursDay;
  open: string | null;
  close: string | null;
};

export type OperatingHoursTable = {
  rows: OperatingHoursRow[];
};

const DAY_SHORT_TO_INDEX: Record<string, number> = {
  월: 0,
  화: 1,
  수: 2,
  목: 3,
  금: 4,
  토: 5,
  일: 6,
};

function padTime(hour: string, minute = '00'): string {
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

function normalizeTimeToken(token: string): string {
  const trimmed = token.trim();
  const withColon = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (withColon) {
    return padTime(withColon[1], withColon[2]);
  }

  const hourOnly = trimmed.match(/^(\d{1,2})$/);
  if (hourOnly) {
    return padTime(hourOnly[1]);
  }

  return trimmed;
}

function parseInterval(interval: string): { open: string | null; close: string | null } {
  const value = interval.trim();
  if (!value || value === '휴무' || value.includes('휴무') || value.includes('정기휴관')) {
    return { open: null, close: null };
  }

  if (value === '24시간 운영' || value === '24시간 영업') {
    return { open: '00:00', close: '24:00' };
  }

  const segments = value.split(',').map((part) => part.trim()).filter(Boolean);
  const opens: string[] = [];
  const closes: string[] = [];

  for (const segment of segments) {
    const rangeMatch = segment.match(/^(\d{1,2}(?::\d{2})?)\s*~\s*(\d{1,2}(?::\d{2})?)$/);
    if (!rangeMatch) {
      continue;
    }

    opens.push(normalizeTimeToken(rangeMatch[1]));
    closes.push(normalizeTimeToken(rangeMatch[2]));
  }

  if (opens.length === 0) {
    return { open: null, close: null };
  }

  return {
    open: opens.join(', '),
    close: closes.join(', '),
  };
}

function createEmptyWeek(): string[] {
  return Array.from({ length: 7 }, () => '휴무');
}

function setDay(schedule: string[], dayIndex: number, value: string) {
  schedule[dayIndex] = value;
}

function setDayRange(schedule: string[], start: number, end: number, value: string) {
  for (let index = start; index <= end; index += 1) {
    schedule[index] = value;
  }
}

function expandDayRangeLabel(label: string): number[] {
  const trimmed = label.replace(/요일/g, '').trim();

  if (trimmed === '매일') {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  if (trimmed === '평일') {
    return [0, 1, 2, 3, 4];
  }

  if (trimmed === '주말') {
    return [5, 6];
  }

  if (trimmed.includes('~')) {
    const [start, end] = trimmed.split('~');
    const startIndex = DAY_SHORT_TO_INDEX[start.trim()];
    const endIndex = DAY_SHORT_TO_INDEX[end.trim()];
    if (startIndex == null || endIndex == null) {
      return [];
    }

    const indices: number[] = [];
    if (startIndex <= endIndex) {
      for (let index = startIndex; index <= endIndex; index += 1) {
        indices.push(index);
      }
      return indices;
    }

    for (let index = startIndex; index < 7; index += 1) {
      indices.push(index);
    }
    for (let index = 0; index <= endIndex; index += 1) {
      indices.push(index);
    }
    return indices;
  }

  const singleIndex = DAY_SHORT_TO_INDEX[trimmed];
  return singleIndex == null ? [] : [singleIndex];
}

function parseGoogleWeeklySchedule(raw: string): string[] | null {
  if (!raw.includes(';') || !raw.includes('월요일')) {
    return null;
  }

  const schedule = createEmptyWeek();
  const parts = raw.split(';').map((part) => part.trim()).filter(Boolean);

  for (const part of parts) {
    const separatorIndex = part.indexOf(':');
    if (separatorIndex === -1) {
      continue;
    }

    const dayLabel = part.slice(0, separatorIndex).trim();
    const timeLabel = part.slice(separatorIndex + 1).trim();
    const dayIndex = OPERATING_DAYS.indexOf(dayLabel as OperatingHoursDay);
    if (dayIndex === -1) {
      continue;
    }

    if (timeLabel.includes('휴무') || timeLabel.includes('정기휴관')) {
      schedule[dayIndex] = '휴무';
      continue;
    }

    if (timeLabel.includes('24시간')) {
      schedule[dayIndex] = '24시간 운영';
      continue;
    }

    const amPmMatch = timeLabel.match(
      /(?:오전|오후)?\s*(\d{1,2}):(\d{2})\s*~\s*(?:오전|오후)?\s*(\d{1,2}):(\d{2})/,
    );
    if (amPmMatch) {
      const startHour = Number(amPmMatch[1]);
      const startMinute = amPmMatch[2];
      const endHour = Number(amPmMatch[3]);
      const endMinute = amPmMatch[4];
      const startIsPm = timeLabel.slice(0, timeLabel.indexOf('~')).includes('오후');
      const endIsPm = timeLabel.slice(timeLabel.indexOf('~')).includes('오후');

      const openHour = startIsPm && startHour < 12 ? startHour + 12 : startHour;
      const closeHour = endIsPm && endHour < 12 ? endHour + 12 : endHour;
      schedule[dayIndex] = `${padTime(String(openHour), startMinute)}~${padTime(String(closeHour), endMinute)}`;
      continue;
    }

    schedule[dayIndex] = timeLabel.replace(/\s*~\s*/g, '~');
  }

  return schedule.some((value) => value !== '휴무') ? schedule : null;
}

function expandCollapsedSchedule(raw: string): string[] {
  const schedule = createEmptyWeek();
  const value = raw.trim();

  if (!value) {
    return schedule;
  }

  if (value === '24시간 운영' || value === '24시간 영업') {
    return Array.from({ length: 7 }, () => '24시간 운영');
  }

  if (value === '휴무') {
    return schedule;
  }

  const closedMatch = value.match(/\(([^)]+)\s*휴무\)/);
  const closedDays = new Set<number>();
  if (closedMatch) {
    const closedLabel = closedMatch[1];
    for (const token of closedLabel.split(/[·,]/).map((part) => part.trim())) {
      for (const index of expandDayRangeLabel(token)) {
        closedDays.add(index);
      }
    }
  }

  const body = value.replace(/\([^)]+\)/g, '').trim();
  const segments = body.split(',').map((part) => part.trim()).filter(Boolean);

  for (const segment of segments) {
    const match = segment.match(/^(.+?)\s+(\d{1,2}(?::\d{2})?\s*~\s*\d{1,2}(?::\d{2})?|24시간\s*운영)$/);
    if (!match) {
      continue;
    }

    const dayLabel = match[1].trim();
    const timeLabel = match[2].replace(/\s*~\s*/g, '~');
    for (const index of expandDayRangeLabel(dayLabel)) {
      if (!closedDays.has(index)) {
        schedule[index] = timeLabel;
      }
    }
  }

  for (const closedIndex of closedDays) {
    schedule[closedIndex] = '휴무';
  }

  return schedule;
}

function weeklyScheduleToTable(schedule: string[]): OperatingHoursTable {
  return {
    rows: OPERATING_DAYS.map((day, index) => {
      const interval = schedule[index] ?? '휴무';
      const { open, close } = parseInterval(interval);
      return { day, open, close };
    }),
  };
}

export function isOperatingHoursTable(value: unknown): value is OperatingHoursTable {
  if (!value || typeof value !== 'object' || !('rows' in value)) {
    return false;
  }

  const rows = (value as OperatingHoursTable).rows;
  return Array.isArray(rows) && rows.every((row) => typeof row.day === 'string');
}

export function normalizeOperatingHoursTable(
  raw: string | OperatingHoursTable,
): OperatingHoursTable {
  if (isOperatingHoursTable(raw)) {
    return {
      rows: raw.rows.map((row) => {
        if (row.open == null && row.close == null) {
          return { day: row.day, open: null, close: null };
        }

        const open = row.open ?? '';
        const close = row.close ?? '';
        if (open === '00:00' && close === '24:00') {
          return { day: row.day, open: '00:00', close: '24:00' };
        }

        return {
          day: row.day,
          open: open ? normalizeTimeToken(open) : null,
          close: close ? normalizeTimeToken(close) : null,
        };
      }),
    };
  }

  if (typeof raw !== 'string') {
    return weeklyScheduleToTable(createEmptyWeek());
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return weeklyScheduleToTable(createEmptyWeek());
  }

  const googleSchedule = parseGoogleWeeklySchedule(trimmed);
  if (googleSchedule) {
    return weeklyScheduleToTable(googleSchedule);
  }

  if (trimmed.startsWith('매일 ')) {
    const time = trimmed.replace(/^매일\s+/, '');
    return weeklyScheduleToTable(Array.from({ length: 7 }, () => time));
  }

  const perDaySchedule = createEmptyWeek();
  const perDayPattern = /(월|화|수|목|금|토|일)요일?\s+([^,]+)/g;
  let perDayMatch: RegExpExecArray | null = perDayPattern.exec(trimmed);
  let perDayHits = 0;

  while (perDayMatch) {
    const dayIndex = DAY_SHORT_TO_INDEX[perDayMatch[1]];
    if (dayIndex != null) {
      perDaySchedule[dayIndex] = perDayMatch[2].trim().replace(/\s*~\s*/g, '~');
      perDayHits += 1;
    }
    perDayMatch = perDayPattern.exec(trimmed);
  }

  if (perDayHits > 0) {
    return weeklyScheduleToTable(perDaySchedule);
  }

  return weeklyScheduleToTable(expandCollapsedSchedule(trimmed));
}
