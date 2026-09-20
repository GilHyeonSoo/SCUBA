import type { DiveLog, DiveProfileSample } from '@/src/features/dive-log/types';

export type DiveYearStats = {
  diveCount: number;
  totalDurationSec: number;
  deepestDepthM: number | null;
};

export type DiveMonthGroup = {
  monthKey: string;
  label: string;
  dives: DiveLog[];
};

const monthLabelFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
});

const dayLabelFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'short',
  day: 'numeric',
  weekday: 'short',
});

export function getDiveYear(startedAt: string): number | null {
  const year = Number.parseInt(startedAt.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

export function getMostRecentDiveYear(dives: DiveLog[]): number | null {
  let mostRecentStartedAt: string | null = null;

  for (const dive of dives) {
    if (mostRecentStartedAt == null || dive.startedAt.localeCompare(mostRecentStartedAt) > 0) {
      mostRecentStartedAt = dive.startedAt;
    }
  }

  return mostRecentStartedAt == null ? null : getDiveYear(mostRecentStartedAt);
}

export function getAvailableYears(dives: DiveLog[], currentYear = new Date().getFullYear()): number[] {
  const years = new Set<number>([currentYear]);

  for (const dive of dives) {
    const year = getDiveYear(dive.startedAt);
    if (year != null) {
      years.add(year);
    }
  }

  return [...years].sort((left, right) => right - left);
}

export function filterDivesByYear(dives: DiveLog[], year: number): DiveLog[] {
  return dives.filter((dive) => getDiveYear(dive.startedAt) === year);
}

export function computeYearStats(dives: DiveLog[]): DiveYearStats {
  let deepestDepthM: number | null = null;
  let totalDurationSec = 0;

  for (const dive of dives) {
    if (dive.durationSec != null) {
      totalDurationSec += dive.durationSec;
    }

    if (dive.maxDepthM != null) {
      deepestDepthM =
        deepestDepthM == null ? dive.maxDepthM : Math.max(deepestDepthM, dive.maxDepthM);
    }
  }

  return {
    diveCount: dives.length,
    totalDurationSec,
    deepestDepthM,
  };
}

export function groupDivesByMonth(dives: DiveLog[]): DiveMonthGroup[] {
  const groups = new Map<string, DiveLog[]>();

  for (const dive of dives) {
    const monthKey = dive.startedAt.slice(0, 7);
    const existing = groups.get(monthKey);
    if (existing) {
      existing.push(dive);
    } else {
      groups.set(monthKey, [dive]);
    }
  }

  return [...groups.entries()]
    .sort(([leftKey], [rightKey]) => rightKey.localeCompare(leftKey))
    .map(([monthKey, monthDives]) => ({
      monthKey,
      label: formatMonthLabel(monthKey),
      dives: monthDives.sort((left, right) => right.startedAt.localeCompare(left.startedAt)),
    }));
}

export function formatMonthLabel(monthKey: string): string {
  const [yearText, monthText] = monthKey.split('-');
  const year = Number.parseInt(yearText, 10);
  const month = Number.parseInt(monthText, 10);

  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return monthKey;
  }

  return monthLabelFormatter.format(new Date(year, month - 1, 1));
}

export function formatTimelineDate(startedAt: string): string {
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) {
    return startedAt.slice(5, 10);
  }

  return dayLabelFormatter.format(date);
}

export function formatTotalDuration(totalDurationSec: number): string {
  const hours = Math.floor(totalDurationSec / 3600);
  const minutes = Math.floor((totalDurationSec % 3600) / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  return `${minutes}분`;
}

export function downsampleProfile(
  profile: DiveProfileSample[],
  targetCount: number,
): DiveProfileSample[] {
  if (profile.length <= targetCount) {
    return profile;
  }

  const step = profile.length / targetCount;
  const samples: DiveProfileSample[] = [];

  for (let index = 0; index < targetCount; index += 1) {
    const sourceIndex = Math.min(profile.length - 1, Math.floor(index * step));
    samples.push(profile[sourceIndex]);
  }

  return samples;
}

export function canRenderProfile(profile: DiveProfileSample[]): boolean {
  return profile.length >= 2 && profile.some((sample) => sample.depthM > 0);
}
