import * as Crypto from 'expo-crypto';

import type { DiveImportFormat } from '@/src/features/dive-log/types';

type BuildSourceRecordIdInput = {
  format: DiveImportFormat;
  nativeId: string | null;
  startedAt: string;
  durationSec: number | null;
  maxDepthM: number | null;
  vendor: string;
  model: string;
};

export function buildLocalDiveLogId(format: DiveImportFormat, sourceRecordId: string): string {
  return `${format}:${sourceRecordId}`;
}

export async function buildSourceRecordId(input: BuildSourceRecordIdInput): Promise<string> {
  const trimmedNativeId = input.nativeId?.trim();
  if (trimmedNativeId && trimmedNativeId.toLowerCase() !== 'unknown') {
    return `${input.vendor}:${input.model}:${trimmedNativeId}`;
  }

  const canonical = [
    input.format,
    input.vendor,
    input.model,
    input.startedAt,
    input.durationSec ?? '',
    input.maxDepthM ?? '',
  ].join('|');

  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, canonical);
  return `hash:${hash.slice(0, 32)}`;
}
