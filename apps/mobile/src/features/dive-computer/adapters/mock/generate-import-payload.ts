import type {
  MockDiveComputerDevice,
  MockDivePreview,
} from '@/src/features/dive-computer/types';
import { buildDiveLogDbId } from '@/src/features/dive-log/import/hash-id';
import {
  collectMissingFields,
  summarizeImport,
} from '@/src/features/dive-log/import/summarize-import';
import type { DiveImportPayload, DiveLog } from '@/src/features/dive-log/types';
import { createMockDiveProfile } from '@/src/features/home/utils/mock-dive-profile';
import { CURRENT_USER_ID } from '@/src/features/social/constants';

const MOCK_SITE_NAMES = [
  '제주 문섬',
  '제주 섭섬',
  '부산 태종대',
  '강릉 사천',
  '울진 왕돌초',
  '거제 외도',
  '포항 구룡포',
] as const;

const MOCK_DIVE_COUNT = 5;
const MOCK_BASE_TIME_MS = Date.UTC(2026, 7, 28, 0, 30);
const DAY_MS = 24 * 60 * 60 * 1000;

function hashSeed(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededFraction(seed: number): number {
  let value = seed + 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

export function generateMockDivePreviews(device: MockDiveComputerDevice): MockDivePreview[] {
  const deviceSeed = hashSeed(device.id);

  return Array.from({ length: MOCK_DIVE_COUNT }, (_, index) => {
    const diveSeed = deviceSeed + index * 997;
    const depth = 12 + seededFraction(diveSeed) * 26;
    const duration = 35 + Math.floor(seededFraction(diveSeed + 1) * 21);
    const dayOffset = index * 9 + (deviceSeed % 6);
    const hourOffset = 9 + Math.floor(seededFraction(diveSeed + 2) * 5);
    const startedAt = new Date(
      MOCK_BASE_TIME_MS - dayOffset * DAY_MS + hourOffset * 60 * 60 * 1000,
    ).toISOString();

    return {
      id: `mock-ble:${device.id}:${index + 1}`,
      startedAt,
      maxDepthM: roundToTenth(depth),
      durationMin: duration,
      siteName: MOCK_SITE_NAMES[(deviceSeed + index * 3) % MOCK_SITE_NAMES.length],
    };
  });
}

function buildMockDive(
  device: MockDiveComputerDevice,
  preview: MockDivePreview,
  index: number,
  importedAt: string,
  id: string,
): DiveLog {
  const durationSec = preview.durationMin * 60;
  const endedAt = new Date(new Date(preview.startedAt).getTime() + durationSec * 1000).toISOString();
  const waterTempC = roundToTenth(15 + seededFraction(hashSeed(`${preview.id}:temp`)) * 9);
  const profile = createMockDiveProfile(preview.maxDepthM, preview.durationMin).map((sample) => ({
    ...sample,
    tempC: waterTempC,
  }));
  const useNitrox = hashSeed(preview.id) % 3 === 0;

  const dive: DiveLog = {
    id,
    diveNumber: 201 + index,
    startedAt: preview.startedAt,
    endedAt,
    durationSec,
    maxDepthM: preview.maxDepthM,
    avgDepthM: roundToTenth(preview.maxDepthM * (0.61 + seededFraction(index + 11) * 0.1)),
    waterTempC,
    surfacePressureBar: null,
    gas: {
      o2Percent: useNitrox ? 32 : 21,
      description: useNitrox ? 'Nitrox' : 'Air',
    },
    cnsPercent: null,
    otu: null,
    source: {
      format: 'mock-ble',
      vendor: device.vendor,
      model: device.model,
      sourceRecordId: preview.id,
      fingerprintModel: device.model,
      fingerprintSerial: device.serialSuffix,
    },
    profile,
    profileSampleCount: profile.length,
    profileDurationSec: durationSec,
    missingFields: [],
    importedAt,
  };

  dive.missingFields = collectMissingFields(dive);
  return dive;
}

export async function generateMockDiveImportPayload(
  brandId: string,
  device: MockDiveComputerDevice,
  selectedDivePreviewIds: string[],
): Promise<DiveImportPayload> {
  if (device.brandId !== brandId) {
    throw new Error('선택한 브랜드와 기기 정보가 일치하지 않습니다.');
  }

  const selectedIds = new Set(selectedDivePreviewIds);
  const selectedPreviews = generateMockDivePreviews(device)
    .map((preview, originalIndex) => ({ preview, originalIndex }))
    .filter(({ preview }) => selectedIds.has(preview.id));
  const importedAt = new Date().toISOString();
  const dives = await Promise.all(
    selectedPreviews.map(async ({ preview, originalIndex }) =>
      buildMockDive(
        device,
        preview,
        originalIndex,
        importedAt,
        await buildDiveLogDbId(CURRENT_USER_ID, 'mock-ble', preview.id),
      ),
    ),
  );
  const deviceInfo = {
    vendor: device.vendor,
    model: device.model,
    fingerprintModel: device.model,
    fingerprintSerial: device.serialSuffix,
    nickname: `${device.model} · ${device.serialSuffix}`,
  };

  return {
    meta: {
      adapterId: 'mock-ble',
      adapterVersion: '1.0.0',
      importedAt,
      sourceFile: `mock-ble://${device.id}`,
      subsurfaceProgram: null,
      subsurfaceVersion: null,
    },
    device: deviceInfo,
    devices: [deviceInfo],
    dives,
    summary: summarizeImport(dives),
  };
}
