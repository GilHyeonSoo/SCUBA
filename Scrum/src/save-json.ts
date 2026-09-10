import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { CollectionFile } from './types.js';

export function ensureOutputDir(apiName: string, outputDir: string) {
  const dir = join(outputDir, apiName);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function saveCollectionFile<TItem>(
  apiName: string,
  category: CollectionFile<TItem>['meta']['category'],
  payload: CollectionFile<TItem>,
  outputDir: string,
) {
  const dir = ensureOutputDir(apiName, outputDir);
  const filePath = join(dir, `${category}.json`);
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return filePath;
}

export async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function uniqueBy<T>(items: T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const key = getKey(item);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}
