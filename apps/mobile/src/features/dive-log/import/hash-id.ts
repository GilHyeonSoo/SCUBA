import * as Crypto from 'expo-crypto';

export async function hashToUuid(input: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    ((Number.parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') +
      hash.slice(18, 20),
    hash.slice(20, 32),
  ].join('-');
}

export async function buildComputerId(
  userId: string,
  vendor: string,
  model: string,
  fingerprintModel: string | null,
  fingerprintSerial: string | null,
): Promise<string> {
  return hashToUuid(
    `dive-computer:${userId}:${vendor}:${model}:${fingerprintModel ?? ''}:${fingerprintSerial ?? ''}`,
  );
}

export async function buildDiveLogDbId(
  userId: string,
  sourceFormat: string,
  sourceDiveId: string,
): Promise<string> {
  return hashToUuid(`dive-log:${userId}:${sourceFormat}:${sourceDiveId}`);
}
