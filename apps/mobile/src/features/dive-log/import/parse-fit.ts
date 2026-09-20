import { Decoder, Stream } from '@garmin/fitsdk';

import {
  parseInteger,
} from '@/src/features/dive-log/import/parse-values';
import {
  buildLocalDiveLogId,
  buildSourceRecordId,
} from '@/src/features/dive-log/import/source-record-id';
import {
  buildPrimaryDevice,
  collectDevices,
  collectMissingFields,
  summarizeImport,
} from '@/src/features/dive-log/import/summarize-import';
import type { DiveImportPayload, DiveLog } from '@/src/features/dive-log/types';

type FitMessage = Record<string, unknown>;

const DIVE_SPORT_VALUES = new Set(['diving', 'freediving', 'apnea', 'snorkeling']);

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readFitSeconds(value: unknown): number | null {
  if (value instanceof Date) {
    const fitEpochMs = Date.UTC(1989, 11, 31, 0, 0, 0);
    return Math.max(0, Math.round((value.getTime() - fitEpochMs) / 1000));
  }

  const numeric = readNumber(value);
  return numeric != null ? Math.max(0, Math.round(numeric)) : null;
}

function fitValueToIso(value: unknown): string | null {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return fitTimestampToIso(readNumber(value));
}

function fitTimestampToIso(timestamp: number | null): string | null {
  if (timestamp == null) {
    return null;
  }

  const fitEpochMs = Date.UTC(1989, 11, 31, 0, 0, 0);
  return new Date(fitEpochMs + timestamp * 1000).toISOString();
}

function buildProfileFromRecords(
  records: FitMessage[],
  sessionStartSec: number | null,
): DiveLog['profile'] {
  return records.flatMap((record) => {
    const recordTimeSec = readFitSeconds(record.timestamp);
    const depthRaw = readNumber(record.depth) ?? readNumber(record.enhancedDepth);
    const depthM = depthRaw != null ? depthRaw / 1000 : null;

    if (recordTimeSec == null || depthM == null) {
      return [];
    }

    const elapsedSec =
      sessionStartSec != null ? Math.max(0, recordTimeSec - sessionStartSec) : recordTimeSec;

    return [
      {
        elapsedSec,
        depthM,
        tempC: readNumber(record.temperature),
      },
    ];
  });
}

function isDiveSession(session: FitMessage): boolean {
  const sport = readString(session.sport)?.toLowerCase();
  const subSport = readString(session.subSport)?.toLowerCase();

  if (sport && DIVE_SPORT_VALUES.has(sport)) {
    return true;
  }

  if (subSport && DIVE_SPORT_VALUES.has(subSport)) {
    return true;
  }

  const maxDepth = readNumber(session.maxDepth) ?? readNumber(session.enhancedMaxDepth);
  return maxDepth != null && maxDepth > 0;
}

async function parseFitSession(
  session: FitMessage,
  records: FitMessage[],
  deviceInfo: FitMessage | null,
  importedAt: string,
): Promise<DiveLog | null> {
  const startTimestamp = readFitSeconds(session.startTime);
  const startedAt = fitValueToIso(session.startTime);
  if (!startedAt) {
    return null;
  }

  const totalElapsed = readNumber(session.totalElapsedTime);
  const totalTimer = readNumber(session.totalTimerTime);
  const durationSec =
    totalElapsed != null
      ? Math.max(0, Math.round(totalElapsed))
      : totalTimer != null
        ? Math.max(0, Math.round(totalTimer))
        : null;

  const maxDepthRaw = readNumber(session.maxDepth) ?? readNumber(session.enhancedMaxDepth);
  const maxDepthM = maxDepthRaw != null ? maxDepthRaw / 1000 : null;
  const avgDepthRaw = readNumber(session.avgDepth) ?? readNumber(session.enhancedAvgDepth);
  const avgDepthM = avgDepthRaw != null ? avgDepthRaw / 1000 : null;

  const vendor = readString(deviceInfo?.manufacturer) ?? 'Unknown';
  const model =
    readString(deviceInfo?.productName) ??
    (readNumber(deviceInfo?.product) != null ? String(readNumber(deviceInfo?.product)) : null) ??
    'Unknown';
  const serial = readString(deviceInfo?.serialNumber);

  const nativeId =
    readString(session.uuid) ??
    (startTimestamp != null ? String(startTimestamp) : null);

  const sourceRecordId = await buildSourceRecordId({
    format: 'fit',
    nativeId,
    startedAt,
    durationSec,
    maxDepthM,
    vendor,
    model,
  });

  const profile = buildProfileFromRecords(records, startTimestamp);
  const profileDurationSec =
    profile.length > 0 ? profile[profile.length - 1]?.elapsedSec ?? null : null;

  const source = {
    format: 'fit' as const,
    vendor,
    model,
    sourceRecordId,
    fingerprintModel: model,
    fingerprintSerial: serial,
  };

  const normalized: DiveLog = {
    id: buildLocalDiveLogId(source.format, source.sourceRecordId),
    diveNumber: parseInteger(readString(session.messageIndex)),
    startedAt,
    endedAt:
      durationSec != null
        ? new Date(Date.parse(startedAt) + durationSec * 1000).toISOString()
        : null,
    durationSec,
    maxDepthM,
    avgDepthM,
    waterTempC: readNumber(session.avgTemperature),
    surfacePressureBar: null,
    gas: null,
    cnsPercent: null,
    otu: null,
    source,
    profile,
    profileSampleCount: profile.length,
    profileDurationSec,
    missingFields: [],
    importedAt,
  };

  normalized.missingFields = collectMissingFields(normalized);
  return normalized;
}

export async function parseFitExport(bytes: Uint8Array, sourceFile: string): Promise<DiveImportPayload> {
  const importedAt = new Date().toISOString();
  const stream = Stream.fromByteArray(bytes);
  const decoder = new Decoder(stream);
  const { messages, errors } = decoder.read();

  if (errors.length > 0) {
    throw new Error('FIT 파일을 읽지 못했습니다.');
  }

  const sessions = (messages.sessionMesgs ?? []) as FitMessage[];
  const records = (messages.recordMesgs ?? []) as FitMessage[];
  const deviceInfo = ((messages.deviceInfoMesgs ?? [])[0] ?? null) as FitMessage | null;

  const diveSessions = sessions.filter(isDiveSession);
  if (diveSessions.length === 0) {
    throw new Error('FIT 파일에서 다이빙 세션을 찾을 수 없습니다.');
  }

  const dives = (
    await Promise.all(
      diveSessions.map((session) => parseFitSession(session, records, deviceInfo, importedAt)),
    )
  ).filter((dive): dive is DiveLog => dive != null);

  if (dives.length === 0) {
    throw new Error('FIT 파일에서 유효한 다이빙 로그를 찾을 수 없습니다.');
  }

  return {
    meta: {
      adapterId: 'fit',
      adapterVersion: '0.1.0',
      importedAt,
      sourceFile,
      subsurfaceProgram: null,
      subsurfaceVersion: null,
    },
    device: buildPrimaryDevice(dives),
    devices: collectDevices(dives),
    dives,
    summary: summarizeImport(dives),
  };
}
