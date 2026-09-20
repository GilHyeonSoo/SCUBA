const DURATION_PATTERN = /^(\d+):(\d{2})(?:\s*min)?$/;
const DEPTH_PATTERN = /^(-?\d+(?:\.\d+)?)\s*m$/i;
const TEMPERATURE_PATTERN = /^(-?\d+(?:\.\d+)?)\s*C$/i;
const PRESSURE_PATTERN = /^(-?\d+(?:\.\d+)?)\s*bar$/i;
const O2_PATTERN = /^(-?\d+(?:\.\d+)?)%$/;
const PERCENT_PATTERN = /^(-?\d+(?:\.\d+)?)%$/;

export function parseDurationToSeconds(value: string | undefined | null): number | null {
  if (!value) {
    return null;
  }

  const match = value.trim().match(DURATION_PATTERN);
  if (!match) {
    return null;
  }

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return null;
  }

  return minutes * 60 + seconds;
}

export function parseDepthMeters(value: string | undefined | null): number | null {
  if (!value) {
    return null;
  }

  const match = value.trim().match(DEPTH_PATTERN);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseTemperatureCelsius(value: string | undefined | null): number | null {
  if (!value) {
    return null;
  }

  const match = value.trim().match(TEMPERATURE_PATTERN);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parsePressureBar(value: string | undefined | null): number | null {
  if (!value) {
    return null;
  }

  const match = value.trim().match(PRESSURE_PATTERN);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parsePercent(value: string | undefined | null): number | null {
  if (!value) {
    return null;
  }

  const match = value.trim().match(PERCENT_PATTERN);
  if (!match) {
    return null;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseO2Percent(value: string | undefined | null): number | null {
  return parsePercent(value);
}

export function parseInteger(value: string | undefined | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export function combineDateAndTime(date: string, time: string): string {
  return `${date}T${time}`;
}

export function addSecondsToIsoLocal(isoLocal: string, seconds: number): string | null {
  const match = isoLocal.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const base = new Date(
    Number(match[1].slice(0, 4)),
    Number(match[1].slice(5, 7)) - 1,
    Number(match[1].slice(8, 10)),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
  );

  base.setSeconds(base.getSeconds() + seconds);
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}T${pad(base.getHours())}:${pad(base.getMinutes())}:${pad(base.getSeconds())}`;
}
