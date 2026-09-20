import { createHash } from 'node:crypto';

import type { NormalizedDiveImport, NormalizedDiveLog } from './types.js';

export type DiveComputerRow = {
  id: string;
  user_id: string;
  vendor: string;
  model: string;
  fingerprint_model: string | null;
  fingerprint_serial: string | null;
  nickname: string | null;
};

export type DiveLogInsertRow = {
  user_id: string;
  dive_computer_id: string;
  source_format: string;
  source_dive_id: string;
  dive_number: number | null;
  started_at: string;
  ended_at: string | null;
  duration_sec: number;
  max_depth_m: number | null;
  avg_depth_m: number | null;
  water_temp_c: number | null;
  surface_pressure_bar: number | null;
  gas_o2_percent: number | null;
  gas_description: string | null;
  cns_percent: number | null;
  otu: number | null;
  profile: NormalizedDiveLog['profile'];
  profile_sample_count: number;
  profile_duration_sec: number | null;
  missing_fields: string[];
  imported_at: string;
};

export type DiveImportDbPayload = {
  diveComputer: DiveComputerRow;
  diveLogs: DiveLogInsertRow[];
};

function hashToUuid(input: string): string {
  const hash = createHash('sha256').update(input).digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    ((Number.parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') + hash.slice(18, 20),
    hash.slice(20, 32),
  ].join('-');
}

function buildComputerNickname(vendor: string, model: string): string {
  return `${vendor} ${model}`.trim();
}

function buildComputerId(
  userId: string,
  vendor: string,
  model: string,
  fingerprintModel: string | null,
  fingerprintSerial: string | null,
): string {
  return hashToUuid(
    `dive-computer:${userId}:${vendor}:${model}:${fingerprintModel ?? ''}:${fingerprintSerial ?? ''}`,
  );
}

function buildDiveLogId(userId: string, sourceFormat: string, sourceDiveId: string): string {
  return hashToUuid(`dive-log:${userId}:${sourceFormat}:${sourceDiveId}`);
}

export function buildDiveImportDbPayload(
  payload: NormalizedDiveImport,
  userId: string,
): DiveImportDbPayload {
  const diveComputerId = buildComputerId(
    userId,
    payload.device.vendor,
    payload.device.model,
    payload.device.fingerprintModel,
    payload.device.fingerprintSerial,
  );

  const diveComputer: DiveComputerRow = {
    id: diveComputerId,
    user_id: userId,
    vendor: payload.device.vendor,
    model: payload.device.model,
    fingerprint_model: payload.device.fingerprintModel,
    fingerprint_serial: payload.device.fingerprintSerial,
    nickname: buildComputerNickname(payload.device.vendor, payload.device.model),
  };

  const diveLogs = payload.dives.map((dive) =>
    toDiveLogRow(dive, userId, diveComputerId, payload.meta.importedAt),
  );

  return { diveComputer, diveLogs };
}

export function toDiveLogRow(
  dive: NormalizedDiveLog,
  userId: string,
  diveComputerId: string,
  importedAt: string,
): DiveLogInsertRow {
  return {
    user_id: userId,
    dive_computer_id: diveComputerId,
    source_format: dive.source.format,
    source_dive_id: dive.source.diveComputerDiveId,
    dive_number: dive.diveNumber,
    started_at: dive.startedAt,
    ended_at: dive.endedAt,
    duration_sec: dive.durationSec,
    max_depth_m: dive.maxDepthM,
    avg_depth_m: dive.avgDepthM,
    water_temp_c: dive.waterTempC,
    surface_pressure_bar: dive.surfacePressureBar,
    gas_o2_percent: dive.gas?.o2Percent ?? null,
    gas_description: dive.gas?.description ?? null,
    cns_percent: dive.cnsPercent,
    otu: dive.otu,
    profile: dive.profile,
    profile_sample_count: dive.profileSampleCount,
    profile_duration_sec: dive.profileDurationSec,
    missing_fields: dive.missingFields,
    imported_at: importedAt,
  };
}

export function buildDiveLogUpsertRow(
  dive: NormalizedDiveLog,
  userId: string,
  diveComputerId: string,
  importedAt: string,
) {
  return {
    id: buildDiveLogId(userId, dive.source.format, dive.source.diveComputerDiveId),
    ...toDiveLogRow(dive, userId, diveComputerId, importedAt),
  };
}
