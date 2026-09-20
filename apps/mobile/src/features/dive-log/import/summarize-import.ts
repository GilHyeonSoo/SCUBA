import {
  OPTIONAL_IMPORT_FIELDS,
  SUPPORTED_IMPORT_FIELDS,
  type DiveImportPayload,
  type DiveLog,
} from '@/src/features/dive-log/types';

export function collectMissingFields(dive: DiveLog): string[] {
  const missing: string[] = [...OPTIONAL_IMPORT_FIELDS];

  if (dive.cnsPercent == null) {
    missing.push('cnsPercent');
  }

  if (dive.otu == null) {
    missing.push('otu');
  }

  if (dive.gas?.o2Percent == null) {
    missing.push('gas.o2Percent');
  }

  return [...new Set(missing)].sort();
}

export function summarizeImport(dives: DiveLog[]): DiveImportPayload['summary'] {
  const startedDates = dives
    .map((dive) => dive.startedAt)
    .filter(Boolean)
    .sort();

  const fieldsPresent = new Set<string>();
  const fieldsMissing = new Set<string>();

  for (const dive of dives) {
    if (dive.startedAt) fieldsPresent.add('startedAt');
    if (dive.durationSec != null) fieldsPresent.add('durationSec');
    if (dive.maxDepthM != null) fieldsPresent.add('maxDepthM');
    if (dive.avgDepthM != null) fieldsPresent.add('avgDepthM');
    if (dive.waterTempC != null) fieldsPresent.add('waterTempC');
    if (dive.gas?.o2Percent != null) fieldsPresent.add('gas.o2Percent');
    if (dive.cnsPercent != null) fieldsPresent.add('cnsPercent');
    if (dive.otu != null) fieldsPresent.add('otu');
    if (dive.profile.length > 0) fieldsPresent.add('profile');
    if (dive.source.sourceRecordId) fieldsPresent.add('source.sourceRecordId');

    for (const field of dive.missingFields) {
      fieldsMissing.add(field);
    }
  }

  for (const field of SUPPORTED_IMPORT_FIELDS) {
    if (!fieldsPresent.has(field)) {
      fieldsMissing.add(field);
    }
  }

  return {
    diveCount: dives.length,
    dateRange: {
      start: startedDates[0] ?? null,
      end: startedDates[startedDates.length - 1] ?? null,
    },
    fieldsPresent: [...fieldsPresent].sort(),
    fieldsMissing: [...fieldsMissing].sort(),
  };
}

export function buildPrimaryDevice(dives: DiveLog[]): DiveImportPayload['device'] {
  const first = dives[0];
  if (!first) {
    return {
      vendor: 'Unknown',
      model: 'Unknown',
      fingerprintModel: null,
      fingerprintSerial: null,
      nickname: 'Unknown',
    };
  }

  const vendor = first.source.vendor;
  const model = first.source.model;

  return {
    vendor,
    model,
    fingerprintModel: first.source.fingerprintModel,
    fingerprintSerial: first.source.fingerprintSerial,
    nickname: `${vendor} ${model}`.trim(),
  };
}

export function collectDevices(dives: DiveLog[]): DiveImportPayload['devices'] {
  const devices = new Map<string, DiveImportPayload['devices'][number]>();

  for (const dive of dives) {
    const key = `${dive.source.vendor}|${dive.source.model}|${dive.source.fingerprintModel ?? ''}|${dive.source.fingerprintSerial ?? ''}`;
    if (!devices.has(key)) {
      devices.set(key, {
        vendor: dive.source.vendor,
        model: dive.source.model,
        fingerprintModel: dive.source.fingerprintModel,
        fingerprintSerial: dive.source.fingerprintSerial,
        nickname: `${dive.source.vendor} ${dive.source.model}`.trim(),
      });
    }
  }

  return [...devices.values()];
}
