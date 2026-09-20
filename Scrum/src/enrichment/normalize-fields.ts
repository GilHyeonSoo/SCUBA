import {
  normalizeOperatingHoursTable,
  type OperatingHoursTable,
} from './operating-hours-table.js';
import type {
  EnrichedImage,
  FieldWithSource,
  PlaceEnrichment,
  PoolEnrichment,
  ShopEnrichment,
  SiteEnrichment,
} from './types.js';

// --- Services Constants & Mapping ---

export const CANONICAL_SERVICES = [
  '스쿠버 교육',
  '프리다이빙 교육',
  '장비 렌탈',
  '다이빙 투어',
  '장비 판매',
  '공기 충전',
  '나이트록스',
] as const;

export type CanonicalService = typeof CANONICAL_SERVICES[number];

const SERVICE_SYNONYMS: Record<string, CanonicalService> = {
  '스쿠버다이빙 교육': '스쿠버 교육',
  '스쿠버다이빙 강습': '스쿠버 교육',
  '스쿠버 교육': '스쿠버 교육',
  '스쿠버 강습': '스쿠버 교육',
  '스킨스쿠버 교육': '스쿠버 교육',
  '스킨스쿠버 강습': '스쿠버 교육',
  '스쿠버다이빙': '스쿠버 교육',
  '프리다이빙 교육': '프리다이빙 교육',
  '프리다이빙 강습': '프리다이빙 교육',
  '프리다이빙': '프리다이빙 교육',
  '장비 렌탈': '장비 렌탈',
  '장비 대여': '장비 렌탈',
  '다이빙 장비 대여': '장비 렌탈',
  '다이빙 장비 렌탈': '장비 렌탈',
  '렌탈': '장비 렌탈',
  '다이빙 투어': '다이빙 투어',
  '투어': '다이빙 투어',
  '국내외 투어': '다이빙 투어',
  '해외 투어': '다이빙 투어',
  '장비 판매': '장비 판매',
  '다이빙 장비 판매': '장비 판매',
  '다이빙 장비': '장비 판매',
  '공기 충전': '공기 충전',
  '공기통 충전': '공기 충전',
  '탱크 충전': '공기 충전',
  '공기충전': '공기 충전',
  '나이트록스': '나이트록스',
  '나이트록스 충전': '나이트록스',
  'nitrox': '나이트록스',
  'Nitrox': '나이트록스',
};

// --- Difficulty Mapping ---

const DIFFICULTY_MAP: Record<string, string> = {
  초급: '초급',
  초급자: '초급',
  초보: '초급',
  beginner: '초급',
  'open water': '초급',
  오픈워터: '초급',
  중급: '중급',
  중급자: '중급',
  intermediate: '중급',
  'advanced open water': '중급',
  어드밴스드: '중급',
  고급: '고급',
  고급자: '고급',
  advanced: '고급',
  상급: '고급',
  상급자: '고급',
  전문가: '전문가',
  expert: '전문가',
  마스터: '전문가',
};

// --- Operating Hours Days Definition ---

const DAY_NAMES = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'] as const;
const DAY_SHORT = ['월', '화', '수', '목', '금', '토', '일'] as const;

/**
 * Normalizes an ISO 8601 timestamp to UTC `YYYY-MM-DDTHH:mm:ssZ` without milliseconds.
 */
export function normalizeIsoTimestamp(isoString: string): string {
  if (!isoString || typeof isoString !== 'string') return isoString;
  const trimmed = isoString.trim();
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return trimmed;
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Normalizes free text by collapsing excessive whitespace and trimming.
 */
export function normalizeFreeText(raw: string): string {
  if (!raw || typeof raw !== 'string') return raw;
  return raw.replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes an image URL by decoding HTML entities (&amp; -> &) and trimming whitespace.
 */
export function normalizeImageUrl(raw: string): string {
  if (!raw || typeof raw !== 'string') return raw;
  return raw.replace(/&amp;/g, '&').trim();
}

/**
 * Normalizes an EnrichedImage object.
 */
export function normalizeEnrichedImage(image: EnrichedImage): EnrichedImage {
  return {
    ...image,
    url: normalizeImageUrl(image.url),
    sourcePageUrl: normalizeImageUrl(image.sourcePageUrl),
    ...(image.caption ? { caption: normalizeFreeText(image.caption) } : {}),
  };
}

/**
 * Parses an individual time token (e.g. "오전 10:00", "오후 9:00", "8:00") into 24h "HH:mm".
 */
function parseTimeToken(
  token: string,
  defaultPeriod?: 'AM' | 'PM' | null,
): { h: number; min: string; str: string } | null {
  token = token.trim();
  let period: 'AM' | 'PM' | null = defaultPeriod ?? null;

  if (token.includes('오전')) {
    period = 'AM';
    token = token.replace('오전', '').trim();
  } else if (token.includes('오후')) {
    period = 'PM';
    token = token.replace('오후', '').trim();
  }

  const m = token.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;

  let h = parseInt(m[1], 10);
  const min = m[2];

  if (period === 'PM') {
    if (h < 12) h += 12;
  } else if (period === 'AM') {
    if (h === 12) h = 0;
  }

  return { h, min, str: String(h).padStart(2, '0') + ':' + min };
}

/**
 * Parses an interval string for a single day (e.g. "오전 10:00 ~ 오후 9:00", "휴무일", "24시간 영업").
 */
function parseDayInterval(str: string): string {
  str = str.trim();
  if (str === '휴무일' || str.includes('휴무') || str.includes('정기휴관')) return '휴무';
  if (str === '24시간 영업' || str === '24시간 운영') return '24시간 운영';

  const intervals = str.split(',').map((x) => x.trim());
  const parsedIntervals: string[] = [];

  for (const sub of intervals) {
    const parts = sub.split(/~|-/).map((x) => x.trim());
    if (parts.length === 2) {
      const p1 = parseTimeToken(parts[0]);
      const defPeriod: 'AM' | 'PM' | null = parts[0].includes('오후')
        ? 'PM'
        : parts[0].includes('오전')
          ? 'AM'
          : null;
      const p2 = parseTimeToken(parts[1], defPeriod);

      if (p1 && p2) {
        // Special case: "오후 6:00 ~ 오전 12:00" -> 18:00~24:00
        if (p2.str === '00:00' && p1.h >= 12) {
          p2.str = '24:00';
        }
        parsedIntervals.push(`${p1.str}~${p2.str}`);
      } else {
        return str;
      }
    } else {
      return str;
    }
  }

  return parsedIntervals.join(', ');
}

function formatDaysList(indices: number[]): string {
  if (indices.length === 2 && indices[0] === 5 && indices[1] === 6) return '주말';
  if (indices.length === 5 && indices.every((v, i) => v === i)) return '평일';
  if (indices.length === 2 && indices[0] === 0 && indices[1] === 6) return '일·월요일';
  return indices.map((i) => DAY_SHORT[i] + '요일').join(', ');
}

function formatDaysRange(indices: number[]): string {
  if (indices.length === 5 && indices.every((v, i) => v === i)) return '평일';
  if (indices.length === 2 && indices[0] === 5 && indices[1] === 6) return '주말';
  if (indices.length === 1) return DAY_SHORT[indices[0]] + '요일';

  let contiguous = true;
  for (let k = 1; k < indices.length; k++) {
    if (indices[k] !== indices[k - 1] + 1) {
      contiguous = false;
      break;
    }
  }
  if (contiguous) {
    return `${DAY_SHORT[indices[0]]}~${DAY_SHORT[indices[indices.length - 1]]}`;
  }
  return indices.map((i) => DAY_SHORT[i]).join('·');
}

/**
 * Collapses 7-day schedule array (from Mon to Sun) into compact Korean format.
 */
function collapseWeeklySchedule(daysArr: string[]): string {
  const uniqueTimes = [...new Set(daysArr)];

  // Case 1: All 7 days are identical
  if (uniqueTimes.length === 1) {
    if (uniqueTimes[0] === '24시간 운영') return '24시간 운영';
    if (uniqueTimes[0] === '휴무') return '휴무';
    return `매일 ${uniqueTimes[0]}`;
  }

  const closedDays: number[] = [];
  const openDays: number[] = [];
  for (let i = 0; i < 7; i++) {
    if (daysArr[i] === '휴무') closedDays.push(i);
    else openDays.push(i);
  }

  const openTimes = [...new Set(openDays.map((i) => daysArr[i]))];

  // Case 2: All open days have identical schedule
  if (openTimes.length === 1 && closedDays.length > 0) {
    const time = openTimes[0];
    const closedStr = `${formatDaysList(closedDays)} 휴무`;
    const openRangeStr = formatDaysRange(openDays);
    const timeDisplay = time === '24시간 운영' ? '24시간 운영' : time;
    return `${openRangeStr} ${timeDisplay} (${closedStr})`;
  }

  const weekdaysSame = daysArr.slice(0, 5).every((t) => t === daysArr[0]);
  const weekendSame = daysArr[5] === daysArr[6];

  // Case 3: Weekdays same, weekends same
  if (weekdaysSame && weekendSame) {
    const wdTime = daysArr[0];
    const weTime = daysArr[5];
    if (weTime === '휴무') return `평일 ${wdTime} (주말 휴무)`;
    if (wdTime === '휴무') return `주말 ${weTime} (평일 휴무)`;
    return `평일 ${wdTime}, 주말 ${weTime}`;
  }

  // Case 4: Mon closed, Tue..Fri same, weekends same
  if (daysArr[0] === '휴무' && daysArr.slice(1, 5).every((t) => t === daysArr[1]) && weekendSame) {
    return `화~금 ${daysArr[1]}, 주말 ${daysArr[5]} (월요일 휴무)`;
  }

  // Case 5: Weekdays same, Saturday and Sunday differ
  if (weekdaysSame && !weekendSame) {
    const wdTime = daysArr[0];
    const satTime = daysArr[5];
    const sunTime = daysArr[6];
    const parts: string[] = [];
    if (wdTime !== '휴무') parts.push(`평일 ${wdTime}`);
    if (satTime !== '휴무') parts.push(`토요일 ${satTime}`);
    if (sunTime !== '휴무') parts.push(`일요일 ${sunTime}`);
    if (closedDays.length > 0) {
      return `${parts.join(', ')} (${formatDaysList(closedDays)} 휴무)`;
    }
    return parts.join(', ');
  }

  // Case 6: Mon..Sat same, Sun differs
  const monSatSame = daysArr.slice(0, 6).every((t) => t === daysArr[0]);
  if (monSatSame) {
    const msTime = daysArr[0];
    const sunTime = daysArr[6];
    if (sunTime === '휴무') return `월~토 ${msTime} (일요일 휴무)`;
    if (msTime === '휴무') return `일요일 ${sunTime} (월~토 휴무)`;
    return `월~토 ${msTime}, 일요일 ${sunTime}`;
  }

  // Case 7: Mon closed, Tue..Sat same, Sun differs
  if (daysArr[0] === '휴무' && daysArr.slice(1, 6).every((t) => t === daysArr[1])) {
    const tsTime = daysArr[1];
    const sunTime = daysArr[6];
    if (sunTime === '휴무') return `화~토 ${tsTime} (일·월요일 휴무)`;
    return `화~토 ${tsTime}, 일요일 ${sunTime} (월요일 휴무)`;
  }

  // General contiguous groups
  const groups: { days: number[]; time: string }[] = [];
  let currentGroup = { days: [0], time: daysArr[0] };
  for (let i = 1; i < 7; i++) {
    if (daysArr[i] === currentGroup.time) {
      currentGroup.days.push(i);
    } else {
      groups.push(currentGroup);
      currentGroup = { days: [i], time: daysArr[i] };
    }
  }
  groups.push(currentGroup);

  const parts: string[] = [];
  const closed: number[] = [];
  for (const g of groups) {
    if (g.time === '휴무') {
      closed.push(...g.days);
    } else {
      const dayLabel = formatDaysRange(g.days);
      parts.push(`${dayLabel} ${g.time}`);
    }
  }

  if (closed.length > 0) {
    return `${parts.join(', ')} (${formatDaysList(closed)} 휴무)`;
  }
  return parts.join(', ');
}

/**
 * Normalizes operating hours into a 7-day table (요일 | 오픈 | 마감).
 */
export function normalizeOperatingHours(
  raw: string | OperatingHoursTable,
): OperatingHoursTable {
  return normalizeOperatingHoursTable(raw);
}

/** @deprecated Use normalizeOperatingHours for table output. */
export function normalizeOperatingHoursSummary(raw: string): string {
  if (!raw || typeof raw !== 'string') return raw;
  const str = raw.trim();
  if (!str) return str;

  // Exact 24시간 variants
  if (/^24시간\s*(영업|운영)$/.test(str)) return '24시간 운영';

  // Google semicolon-separated format: e.g. "월요일: ...; 화요일: ...;"
  if (str.includes(';')) {
    const parts = str.split(';').map((x) => x.trim()).filter(Boolean);
    const dayMap: Record<string, string> = {};
    for (const part of parts) {
      const idx = part.indexOf(':');
      if (idx !== -1) {
        const d = part.slice(0, idx).trim();
        const t = parseDayInterval(part.slice(idx + 1).trim());
        dayMap[d] = t;
      }
    }

    const hasAllDays = DAY_NAMES.every((dn) => dayMap[dn]);
    if (hasAllDays) {
      const daysArr = DAY_NAMES.map((dn) => dayMap[dn]);
      return collapseWeeklySchedule(daysArr);
    }
  }

  // Already Korean format: normalize spaces around ~, zero pad times, replace 24시간 영업 -> 24시간 운영
  let cleaned = str
    .replace(/24시간\s*영업/g, '24시간 운영')
    .replace(/\s*~\s*/g, '~')
    .replace(/(\d{1,2}):(\d{2})/g, (_, h, m) => String(h).padStart(2, '0') + ':' + m);

  // Normalize spaces after commas
  cleaned = cleaned.replace(/,\s*/g, ', ');

  return cleaned;
}

/**
 * Normalizes price information for pool/shop display.
 * - Adds thousands comma separators (e.g. 15,000원)
 * - Normalizes "입장료", "입장권" -> "입장"
 * - Formats price ranges (e.g. 15,000~20,000원)
 * - Formats slash separations (e.g. 평일 33,000원 / 주말 44,000원)
 */
export function normalizePriceInfo(raw: string): string {
  if (!raw || typeof raw !== 'string') return raw;
  let str = raw.trim();
  if (!str) return str;

  // Add commas to unformatted numbers >= 1000
  str = str.replace(/\b(\d{4,})\b/g, (match) => Number(match).toLocaleString('en-US'));

  // Normalize 입장료, 입장권 -> 입장
  str = str.replace(/입장료/g, '입장').replace(/입장권/g, '입장');

  // Normalize tilde between prices: 15,000원 ~ 20,000원 -> 15,000~20,000원
  str = str.replace(/([\d,]+)원?\s*~\s*([\d,]+원)/g, '$1~$2');

  // Space around slashes after currency: 원/주말 -> 원 / 주말
  str = str.replace(/(원)\s*\/\s*/g, '$1 / ');

  // Collapse spaces
  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

/**
 * Normalizes site depth range to standard formats like "5~30m", "최대 30m", "약 20m", "24m".
 */
export function normalizeDepthRange(raw: string): string {
  if (!raw || typeof raw !== 'string') return raw;
  let str = raw.trim();
  if (!str) return str;

  // Convert uppercase M to lowercase m
  str = str.replace(/M\b/g, 'm');

  // Range with m: "10m ~ 25m", "10 ~ 25m", "10-25m" -> "10~25m"
  const rangeMatch = str.match(/^(\d+(?:\.\d+)?)\s*m?\s*(?:~|-)\s*(\d+(?:\.\d+)?)\s*m?$/i);
  if (rangeMatch) {
    return `${rangeMatch[1]}~${rangeMatch[2]}m`;
  }

  // Prefix forms: "최대 30m", "약 20m", "수심 20m"
  const prefixMatch = str.match(/^(최대|약|수심|평균)\s*(\d+(?:\.\d+)?)\s*m?$/i);
  if (prefixMatch) {
    const prefix = prefixMatch[1] === '수심' ? '' : `${prefixMatch[1]} `;
    return `${prefix}${prefixMatch[2]}m`.trim();
  }

  // Single number: "24m", "30" -> "24m", "30m"
  const singleMatch = str.match(/^(\d+(?:\.\d+)?)\s*m?$/i);
  if (singleMatch) {
    return `${singleMatch[1]}m`;
  }

  // Fallback: normalize ~ and collapse spaces
  return str.replace(/\s*~\s*/g, '~').replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes water temperature to standard format like "10~21°C" or "약 20°C".
 */
export function normalizeWaterTemperature(raw: string): string {
  if (!raw || typeof raw !== 'string') return raw;
  let str = raw.trim();
  if (!str) return str;

  // Normalize temperature units
  str = str.replace(/℃/g, '°C').replace(/도\b/g, '°C');

  // Range pattern: "10°C ~ 21°C", "10~21°C", "10 - 21 °C" -> "10~21°C"
  const rangeMatch = str.match(
    /^(\d+(?:\.\d+)?)\s*(?:°C|도)?\s*(?:~|-)\s*(\d+(?:\.\d+)?)\s*(?:°C|도)?$/,
  );
  if (rangeMatch) {
    return `${rangeMatch[1]}~${rangeMatch[2]}°C`;
  }

  // Prefix pattern: "약 20°C", "약20도" -> "약 20°C"
  const prefixMatch = str.match(/^(약|평균)\s*(\d+(?:\.\d+)?)\s*(?:°C|도)?$/);
  if (prefixMatch) {
    return `${prefixMatch[1]} ${prefixMatch[2]}°C`;
  }

  // Single temperature: "22°C", "22도", "22" -> "22°C"
  const singleMatch = str.match(/^(\d+(?:\.\d+)?)\s*(?:°C|도)?$/);
  if (singleMatch) {
    return `${singleMatch[1]}°C`;
  }

  return str.replace(/\s*~\s*/g, '~').replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes visibility to standard format like "5~15m" or descriptive Korean short form.
 */
export function normalizeVisibility(raw: string): string {
  if (!raw || typeof raw !== 'string') return raw;
  let str = raw.trim();
  if (!str) return str;

  str = str.replace(/M\b/g, 'm');

  // Range with m: "5m ~ 15m", "5 ~ 15m", "5-15m" -> "5~15m"
  const rangeMatch = str.match(/^(\d+(?:\.\d+)?)\s*m?\s*(?:~|-)\s*(\d+(?:\.\d+)?)\s*m?$/i);
  if (rangeMatch) {
    return `${rangeMatch[1]}~${rangeMatch[2]}m`;
  }

  // Prefix: "약 10m"
  const prefixMatch = str.match(/^(최대|약|평균)\s*(\d+(?:\.\d+)?)\s*m?$/i);
  if (prefixMatch) {
    return `${prefixMatch[1]} ${prefixMatch[2]}m`;
  }

  // Single number: "10m", "10" -> "10m"
  const singleMatch = str.match(/^(\d+(?:\.\d+)?)\s*m?$/i);
  if (singleMatch) {
    return `${singleMatch[1]}m`;
  }

  // Descriptive text
  return str.replace(/\s*~\s*/g, '~').replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes difficulty to standard terms: '초급', '중급', '고급', '전문가' or ranges like '초급~고급'.
 */
export function normalizeDifficulty(raw: string): string {
  if (!raw || typeof raw !== 'string') return raw;
  let str = raw.trim();
  if (!str) return str;

  const lower = str.toLowerCase();
  if (DIFFICULTY_MAP[lower]) return DIFFICULTY_MAP[lower];

  // Range pattern: "초급 ~ 중급", "초급 ~ 고급", "중급 ~ 고급" -> "초급~중급"
  const rangeMatch = str.match(/^(.+?)\s*(?:~|-)\s*(.+?)$/);
  if (rangeMatch) {
    const p1 = rangeMatch[1].trim().toLowerCase();
    const p2 = rangeMatch[2].trim().toLowerCase();
    const n1 = DIFFICULTY_MAP[p1] || rangeMatch[1].trim();
    const n2 = DIFFICULTY_MAP[p2] || rangeMatch[2].trim();
    return `${n1}~${n2}`;
  }

  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes services list to canonical labels, maps synonyms, dedupes, and sorts in canonical order.
 */
export function normalizeServices(raw: string[]): string[] {
  if (!Array.isArray(raw)) return raw;
  const canonicalIndex = new Map(CANONICAL_SERVICES.map((s, i) => [s, i]));

  const mapped = raw
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean)
    .map((s) => SERVICE_SYNONYMS[s] || s);

  const unique = [...new Set(mapped)];

  return unique.sort((a, b) => {
    const idxA = canonicalIndex.has(a as CanonicalService)
      ? canonicalIndex.get(a as CanonicalService)!
      : 999;
    const idxB = canonicalIndex.has(b as CanonicalService)
      ? canonicalIndex.get(b as CanonicalService)!
      : 999;
    if (idxA !== idxB) return idxA - idxB;
    return a.localeCompare(b, 'ko');
  });
}

/**
 * Normalizes a FieldWithSource<T> object.
 * Preserves sourceUrl and verified flags unchanged.
 */
export function normalizeFieldWithSource<T>(
  field: FieldWithSource<T> | undefined,
  normalizer: (val: T) => T,
): FieldWithSource<T> | undefined {
  if (!field) return undefined;
  return {
    ...field,
    value: normalizer(field.value),
    collectedAt: normalizeIsoTimestamp(field.collectedAt),
  };
}

/**
 * Normalizes a PoolEnrichment object.
 */
function normalizePoolEnrichment(pool: PoolEnrichment | undefined): PoolEnrichment | undefined {
  if (!pool) return undefined;
  return {
    ...pool,
    maxDepthM: normalizeFieldWithSource(pool.maxDepthM, (v) => v),
    poolSize: normalizeFieldWithSource(pool.poolSize, normalizeFreeText),
    operatingHours: normalizeFieldWithSource(pool.operatingHours, normalizeOperatingHours),
    priceInfo: normalizeFieldWithSource(pool.priceInfo, normalizePriceInfo),
    reservationMethod: normalizeFieldWithSource(pool.reservationMethod, normalizeFreeText),
    parking: normalizeFieldWithSource(pool.parking, (v) => v),
    shower: normalizeFieldWithSource(pool.shower, (v) => v),
    equipmentRental: normalizeFieldWithSource(pool.equipmentRental, (v) => v),
    airFill: normalizeFieldWithSource(pool.airFill, (v) => v),
    scubaAvailable: normalizeFieldWithSource(pool.scubaAvailable, (v) => v),
    freedivingAvailable: normalizeFieldWithSource(pool.freedivingAvailable, (v) => v),
  };
}

/**
 * Normalizes a SiteEnrichment object.
 */
function normalizeSiteEnrichment(site: SiteEnrichment | undefined): SiteEnrichment | undefined {
  if (!site) return undefined;
  return {
    ...site,
    depthRangeM: normalizeFieldWithSource(site.depthRangeM, normalizeDepthRange),
    difficulty: normalizeFieldWithSource(site.difficulty, normalizeDifficulty),
    waterTemperature: normalizeFieldWithSource(site.waterTemperature, normalizeWaterTemperature),
    visibility: normalizeFieldWithSource(site.visibility, normalizeVisibility),
    accessType: normalizeFieldWithSource(site.accessType, normalizeFreeText),
    currentInfo: normalizeFieldWithSource(site.currentInfo, normalizeFreeText),
  };
}

/**
 * Normalizes a ShopEnrichment object.
 */
function normalizeShopEnrichment(shop: ShopEnrichment | undefined): ShopEnrichment | undefined {
  if (!shop) return undefined;
  return {
    ...shop,
    services: normalizeFieldWithSource(shop.services, normalizeServices),
    operatingHours: normalizeFieldWithSource(shop.operatingHours, normalizeOperatingHours),
    rentalAvailable: normalizeFieldWithSource(shop.rentalAvailable, (v) => v),
    trainingAvailable: normalizeFieldWithSource(shop.trainingAvailable, (v) => v),
    nitroxAvailable: normalizeFieldWithSource(shop.nitroxAvailable, (v) => v),
  };
}

/**
 * Normalizes a complete PlaceEnrichment item.
 * Preserves id, placeType, enrichmentStatus, sourcesChecked, knownDataApplied, naverPlacePageUrl.
 */
export function normalizeEnrichmentItem(item: PlaceEnrichment): PlaceEnrichment {
  return {
    ...item,
    enrichedAt: normalizeIsoTimestamp(item.enrichedAt),
    shortDescription: normalizeFieldWithSource(item.shortDescription, normalizeFreeText),
    phone: normalizeFieldWithSource(item.phone, normalizeFreeText),
    website: normalizeFieldWithSource(item.website, (v) => v.trim()),
    images: Array.isArray(item.images) ? item.images.map(normalizeEnrichedImage) : [],
    pool: normalizePoolEnrichment(item.pool),
    site: normalizeSiteEnrichment(item.site),
    shop: normalizeShopEnrichment(item.shop),
    ...(item.notes ? { notes: normalizeFreeText(item.notes) } : {}),
  };
}
