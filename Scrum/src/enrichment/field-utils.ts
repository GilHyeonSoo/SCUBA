import type { FieldWithSource } from './types.js';

export function fieldWithSource<T>(
  value: T,
  sourceUrl: string,
  collectedAt: string,
  verified = false,
): FieldWithSource<T> {
  return verified ? { value, sourceUrl, collectedAt, verified: true } : { value, sourceUrl, collectedAt };
}
