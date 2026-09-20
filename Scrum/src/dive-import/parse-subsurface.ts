import { XMLParser } from 'fast-xml-parser';

import {
  addSecondsToIsoLocal,
  combineDateAndTime,
  parseDepthMeters,
  parseDurationToSeconds,
  parseInteger,
  parseO2Percent,
  parsePercent,
  parsePressureBar,
  parseTemperatureCelsius,
} from './parse-values.js';
import {
  OPTIONAL_IMPORT_FIELDS,
  SUPPORTED_IMPORT_FIELDS,
  type NormalizedDiveImport,
  type NormalizedDiveLog,
  type NormalizedDiveProfileSample,
} from './types.js';

type XmlRecord = Record<string, unknown>;

function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function readAttr(node: XmlRecord | undefined, key: string): string | null {
  if (!node) {
    return null;
  }

  const value = node[`@_${key}`];
  return typeof value === 'string' ? value : null;
}

function readChild(node: XmlRecord | undefined, key: string): XmlRecord | undefined {
  const value = node?.[key];
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as XmlRecord;
  }

  return undefined;
}

function splitVendorModel(model: string | null): { vendor: string; model: string } {
  if (!model) {
    return { vendor: 'Unknown', model: 'Unknown' };
  }

  const spaceIndex = model.indexOf(' ');
  if (spaceIndex <= 0) {
    return { vendor: model, model };
  }

  return {
    vendor: model.slice(0, spaceIndex),
    model: model.slice(spaceIndex + 1),
  };
}

function collectMissingFields(dive: NormalizedDiveLog): string[] {
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

function parseProfileSamples(diveComputer: XmlRecord | undefined): NormalizedDiveProfileSample[] {
  return ensureArray(diveComputer?.sample).flatMap((sample) => {
    if (!sample || typeof sample !== 'object') {
      return [];
    }

    const record = sample as XmlRecord;
    const elapsedSec = parseDurationToSeconds(readAttr(record, 'time'));
    const depthM = parseDepthMeters(readAttr(record, 'depth'));

    if (elapsedSec == null || depthM == null) {
      return [];
    }

    return [
      {
        elapsedSec,
        depthM,
        tempC: parseTemperatureCelsius(readAttr(record, 'temp')),
      },
    ];
  });
}

function parseDiveNode(
  diveNode: XmlRecord,
  fingerprint: { model: string | null; serial: string | null },
): NormalizedDiveLog {
  const diveComputer = readChild(diveNode, 'divecomputer');
  const cylinder = readChild(diveNode, 'cylinder');
  const depth = readChild(diveComputer, 'depth');
  const temperature = readChild(diveComputer, 'temperature');
  const surface = readChild(diveComputer, 'surface');

  const date = readAttr(diveNode, 'date');
  const time = readAttr(diveNode, 'time');
  const startedAt = date && time ? combineDateAndTime(date, time) : '';
  const durationSec = parseDurationToSeconds(readAttr(diveNode, 'duration')) ?? 0;
  const endedAt = startedAt ? addSecondsToIsoLocal(startedAt, durationSec) : null;
  const model = readAttr(diveComputer, 'model');
  const { vendor, model: deviceModel } = splitVendorModel(model);
  const diveComputerDiveId = readAttr(diveComputer, 'diveid') ?? 'unknown';
  const profile = parseProfileSamples(diveComputer);
  const profileDurationSec =
    profile.length > 0 ? profile[profile.length - 1]?.elapsedSec ?? null : null;

  const normalized: NormalizedDiveLog = {
    id: diveComputerDiveId,
    diveNumber: parseInteger(readAttr(diveNode, 'number')),
    startedAt,
    endedAt,
    durationSec,
    maxDepthM: parseDepthMeters(readAttr(depth, 'max')),
    avgDepthM: parseDepthMeters(readAttr(depth, 'mean')),
    waterTempC: parseTemperatureCelsius(readAttr(temperature, 'water')),
    surfacePressureBar: parsePressureBar(readAttr(surface, 'pressure')),
    gas: cylinder
      ? {
          o2Percent: parseO2Percent(readAttr(cylinder, 'o2')),
          description: readAttr(cylinder, 'description'),
        }
      : null,
    cnsPercent: parsePercent(readAttr(diveNode, 'cns')),
    otu: parseInteger(readAttr(diveNode, 'otu')),
    source: {
      format: 'subsurface-xml',
      vendor,
      model: deviceModel,
      diveComputerDiveId,
      fingerprintModel: fingerprint.model,
      fingerprintSerial: fingerprint.serial,
    },
    profile,
    profileSampleCount: profile.length,
    profileDurationSec,
    missingFields: [],
  };

  normalized.missingFields = collectMissingFields(normalized);
  return normalized;
}

function summarizeImport(dives: NormalizedDiveLog[]): NormalizedDiveImport['summary'] {
  const startedDates = dives
    .map((dive) => dive.startedAt)
    .filter(Boolean)
    .sort();

  const fieldsPresent = new Set<string>();
  const fieldsMissing = new Set<string>();

  for (const dive of dives) {
    if (dive.startedAt) fieldsPresent.add('startedAt');
    if (dive.durationSec > 0) fieldsPresent.add('durationSec');
    if (dive.maxDepthM != null) fieldsPresent.add('maxDepthM');
    if (dive.avgDepthM != null) fieldsPresent.add('avgDepthM');
    if (dive.waterTempC != null) fieldsPresent.add('waterTempC');
    if (dive.gas?.o2Percent != null) fieldsPresent.add('gas.o2Percent');
    if (dive.cnsPercent != null) fieldsPresent.add('cnsPercent');
    if (dive.otu != null) fieldsPresent.add('otu');
    if (dive.profile.length > 0) fieldsPresent.add('profile');
    if (dive.source.diveComputerDiveId) fieldsPresent.add('source.diveComputerDiveId');

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

export function parseSubsurfaceExport(xml: string, sourceFile: string): NormalizedDiveImport {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
  });

  const parsed = parser.parse(xml) as XmlRecord;
  const divelog = readChild(parsed, 'divelog');
  const settings = readChild(divelog, 'settings');
  const fingerprint = readChild(settings, 'fingerprint');
  const divesRoot = readChild(divelog, 'dives');

  const fingerprintModel = readAttr(fingerprint, 'model');
  const fingerprintSerial = readAttr(fingerprint, 'serial');

  const diveNodes = ensureArray(divesRoot?.trip).flatMap((trip) => {
    if (!trip || typeof trip !== 'object') {
      return [];
    }

    return ensureArray((trip as XmlRecord).dive);
  });

  const dives = diveNodes
    .filter((node): node is XmlRecord => Boolean(node) && typeof node === 'object')
    .map((node) =>
      parseDiveNode(node, {
        model: fingerprintModel,
        serial: fingerprintSerial,
      }),
    );

  const firstDive = dives[0];
  const deviceVendor = firstDive?.source.vendor ?? 'Unknown';
  const deviceModel = firstDive?.source.model ?? 'Unknown';

  return {
    meta: {
      parser: 'scuba-subsurface-import-poc',
      parserVersion: '0.1.0',
      importedAt: new Date().toISOString(),
      sourceFile,
      subsurfaceProgram: readAttr(divelog, 'program'),
      subsurfaceVersion: readAttr(divelog, 'version'),
    },
    device: {
      vendor: deviceVendor,
      model: deviceModel,
      fingerprintModel,
      fingerprintSerial,
    },
    dives,
    summary: summarizeImport(dives),
  };
}
