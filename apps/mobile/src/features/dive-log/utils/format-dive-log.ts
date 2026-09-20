import type { DiveGas, DiveImportFormat } from '@/src/features/dive-log/types';

const diveImportFormatLabels: Record<DiveImportFormat, string> = {
  'subsurface-xml': 'Subsurface XML',
  'uddf-xml': 'UDDF XML',
  fit: 'FIT 파일',
};

export function formatDiveDuration(durationSec: number | null): string {
  if (durationSec == null) {
    return '-';
  }

  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  if (seconds === 0) {
    return `${minutes}분`;
  }

  return `${minutes}분 ${seconds}초`;
}

export function formatDepthMeters(depthM: number | null): string {
  if (depthM == null) {
    return '-';
  }

  return `${depthM.toFixed(1)}m`;
}

export function formatDiveDate(startedAt: string): string {
  if (!startedAt) {
    return '-';
  }

  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) {
    return startedAt.slice(0, 10);
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

export function formatWaterTemperature(tempC: number | null): string {
  if (tempC == null) {
    return '-';
  }

  return `${tempC.toFixed(1)}°C`;
}

export function formatDiveGas(gas: DiveGas | null): string {
  if (gas == null) {
    return '-';
  }

  const description = gas.description?.trim() ?? '';
  const oxygenLabel =
    gas.o2Percent == null
      ? ''
      : `O₂ ${Number.isInteger(gas.o2Percent) ? gas.o2Percent : gas.o2Percent.toFixed(1)}%`;

  if (description && oxygenLabel) {
    return `${description} · ${oxygenLabel}`;
  }

  return description || oxygenLabel || '-';
}

export function formatDiveImportSource(format: DiveImportFormat): string {
  return diveImportFormatLabels[format];
}

export function formatDiveLocationLabel(
  vendor: string,
  model: string,
  fallback = '장소 미기록',
): string {
  const label = `${vendor} ${model}`.trim();
  return label.length > 0 ? label : fallback;
}

export function formatPreviousLogDate(startedAt: string): string {
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) {
    return startedAt.slice(5, 10);
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDiveMetadataLine(parts: {
  durationSec: number | null;
  avgDepthM: number | null;
  waterTempC: number | null;
}): string {
  const segments: string[] = [];

  if (parts.durationSec != null) {
    segments.push(formatDiveDuration(parts.durationSec));
  }

  if (parts.avgDepthM != null) {
    segments.push(`평균 ${formatDepthMeters(parts.avgDepthM)}`);
  }

  if (parts.waterTempC != null) {
    segments.push(formatWaterTemperature(parts.waterTempC));
  }

  return segments.join(' · ');
}
