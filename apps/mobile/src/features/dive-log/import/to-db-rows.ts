import {
  buildComputerId,
  buildDiveLogDbId,
} from '@/src/features/dive-log/import/hash-id';
import type { DiveComputerInfo, DiveImportPayload, DiveLog } from '@/src/features/dive-log/types';

export type DiveComputerInsertRow = {
  id: string;
  user_id: string;
  vendor: string;
  model: string;
  fingerprint_model: string | null;
  fingerprint_serial: string | null;
  nickname: string | null;
};

export type DiveLogInsertRow = {
  id: string;
  user_id: string;
  dive_computer_id: string | null;
  source_format: string;
  source_dive_id: string;
  dive_number: number | null;
  started_at: string;
  ended_at: string | null;
  duration_sec: number | null;
  max_depth_m: number | null;
  avg_depth_m: number | null;
  water_temp_c: number | null;
  surface_pressure_bar: number | null;
  gas_o2_percent: number | null;
  gas_description: string | null;
  cns_percent: number | null;
  otu: number | null;
  profile: DiveLog['profile'];
  profile_sample_count: number;
  profile_duration_sec: number | null;
  missing_fields: string[];
  imported_at: string;
};

export type DiveImportDbPayload = {
  diveComputers: DiveComputerInsertRow[];
  diveLogs: DiveLogInsertRow[];
};

function deviceKey(device: DiveComputerInfo): string {
  return `${device.vendor}|${device.model}|${device.fingerprintModel ?? ''}|${device.fingerprintSerial ?? ''}`;
}

function diveDeviceInfo(dive: DiveLog): DiveComputerInfo {
  return {
    vendor: dive.source.vendor,
    model: dive.source.model,
    fingerprintModel: dive.source.fingerprintModel,
    fingerprintSerial: dive.source.fingerprintSerial,
    nickname: `${dive.source.vendor} ${dive.source.model}`.trim(),
  };
}

function toDiveLogRow(
  dive: DiveLog,
  userId: string,
  diveComputerId: string | null,
  diveLogId: string,
): DiveLogInsertRow {
  return {
    id: diveLogId,
    user_id: userId,
    dive_computer_id: diveComputerId,
    source_format: dive.source.format,
    source_dive_id: dive.source.sourceRecordId,
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
    imported_at: dive.importedAt,
  };
}

export async function buildDiveImportDbPayload(
  payload: DiveImportPayload,
  userId: string,
): Promise<DiveImportDbPayload> {
  const deviceRows = new Map<string, DiveComputerInsertRow>();

  for (const device of payload.devices) {
    const key = deviceKey(device);
    if (deviceRows.has(key)) {
      continue;
    }

    const isUnknown = device.vendor === 'Unknown' && device.model === 'Unknown';
    if (isUnknown) {
      continue;
    }

    deviceRows.set(key, {
      id: await buildComputerId(
        userId,
        device.vendor,
        device.model,
        device.fingerprintModel,
        device.fingerprintSerial,
      ),
      user_id: userId,
      vendor: device.vendor,
      model: device.model,
      fingerprint_model: device.fingerprintModel,
      fingerprint_serial: device.fingerprintSerial,
      nickname: device.nickname,
    });
  }

  const diveLogs = await Promise.all(
    payload.dives.map(async (dive) => {
      const device = diveDeviceInfo(dive);
      const key = deviceKey(device);
      const computerRow = deviceRows.get(key);
      const diveLogId = await buildDiveLogDbId(
        userId,
        dive.source.format,
        dive.source.sourceRecordId,
      );

      return toDiveLogRow(dive, userId, computerRow?.id ?? null, diveLogId);
    }),
  );

  return {
    diveComputers: [...deviceRows.values()],
    diveLogs,
  };
}
