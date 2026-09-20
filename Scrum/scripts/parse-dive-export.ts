import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseSubsurfaceExport } from '../src/dive-import/parse-subsurface.js';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../..');
const defaultInput = join(repoRoot, 'dive-export.ssrf');
const defaultOutputDir = join(repoRoot, 'Scrum/output/dive-import');

function getArgValue(flag: string): string | null {
  const index = process.argv.indexOf(flag);
  if (index < 0) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function printSummary(output: ReturnType<typeof parseSubsurfaceExport>, outputPath: string) {
  console.log('Subsurface dive import PoC complete.');
  console.log(`- Input: ${output.meta.sourceFile}`);
  console.log(`- Output: ${outputPath}`);
  console.log(`- Device: ${output.device.vendor} ${output.device.model}`);
  console.log(`- Dives parsed: ${output.summary.diveCount}`);
  console.log(
    `- Date range: ${output.summary.dateRange.start ?? 'n/a'} -> ${output.summary.dateRange.end ?? 'n/a'}`,
  );
  console.log(`- Fields present: ${output.summary.fieldsPresent.join(', ')}`);
  console.log(`- Fields missing: ${output.summary.fieldsMissing.join(', ')}`);

  const firstDive = output.dives[0];
  if (firstDive) {
    console.log('');
    console.log('First dive preview:');
    console.log(`  id: ${firstDive.id}`);
    console.log(`  startedAt: ${firstDive.startedAt}`);
    console.log(`  durationSec: ${firstDive.durationSec}`);
    console.log(`  maxDepthM: ${firstDive.maxDepthM}`);
    console.log(`  avgDepthM: ${firstDive.avgDepthM}`);
    console.log(`  waterTempC: ${firstDive.waterTempC}`);
    console.log(`  gas.o2Percent: ${firstDive.gas?.o2Percent ?? 'null'}`);
    console.log(`  profile samples: ${firstDive.profileSampleCount}`);
  }
}

function main() {
  const inputPath = resolve(getArgValue('--input') ?? defaultInput);
  const outputDir = resolve(getArgValue('--output-dir') ?? defaultOutputDir);
  const outputPath = join(outputDir, 'normalized-dives.json');

  const xml = readFileSync(inputPath, 'utf8');
  const parsed = parseSubsurfaceExport(xml, inputPath);

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');

  printSummary(parsed, outputPath);
}

main();
