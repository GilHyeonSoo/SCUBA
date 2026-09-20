import type { DiveImportPayload } from '@/src/features/dive-log/types';

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_DIVE_COUNT = 5_000;
const MAX_SAMPLES_PER_DIVE = 100_000;
const MAX_TOTAL_SAMPLES = 500_000;

export function assertImportFileLimits(bytes: Uint8Array): void {
  if (bytes.byteLength > MAX_FILE_BYTES) {
    throw new Error('파일 크기가 25MB를 초과합니다.');
  }
}

export function assertImportPayloadLimits(payload: DiveImportPayload): void {
  if (payload.dives.length === 0) {
    throw new Error('가져올 다이빙 로그가 없습니다.');
  }

  if (payload.dives.length > MAX_DIVE_COUNT) {
    throw new Error(`다이빙 로그가 ${MAX_DIVE_COUNT}개를 초과합니다.`);
  }

  let totalSamples = 0;
  for (const dive of payload.dives) {
    if (dive.profileSampleCount > MAX_SAMPLES_PER_DIVE) {
      throw new Error('프로파일 샘플 수가 너무 많습니다.');
    }
    totalSamples += dive.profileSampleCount;
  }

  if (totalSamples > MAX_TOTAL_SAMPLES) {
    throw new Error('전체 프로파일 샘플 수가 너무 많습니다.');
  }
}
