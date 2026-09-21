import type { DiveProfileSample } from '@/src/features/dive-log/types';

export function createMockDiveProfile(maxDepthM: number, durationMin: number): DiveProfileSample[] {
  const durationSec = durationMin * 60;
  const sampleCount = 28;
  const samples: DiveProfileSample[] = [];

  for (let index = 0; index <= sampleCount; index += 1) {
    const progress = index / sampleCount;
    const elapsedSec = Math.round(progress * durationSec);
    let depthM = 0;

    if (progress < 0.18) {
      depthM = (progress / 0.18) * maxDepthM;
    } else if (progress < 0.72) {
      const wobble = Math.sin(index * 0.65) * 0.04;
      depthM = maxDepthM * (0.96 + wobble);
    } else {
      depthM = maxDepthM * (1 - (progress - 0.72) / 0.28);
    }

    samples.push({
      elapsedSec,
      depthM: Math.max(0, Number(depthM.toFixed(1))),
      tempC: 22,
    });
  }

  return samples;
}
