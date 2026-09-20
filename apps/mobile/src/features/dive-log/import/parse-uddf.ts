import {
  parseDepthMeters,
  parseDurationToSeconds,
  parseInteger,
  parseO2Percent,
  parseTemperatureCelsius,
} from '@/src/features/dive-log/import/parse-values';
import {
  buildLocalDiveLogId,
  buildSourceRecordId,
} from '@/src/features/dive-log/import/source-record-id';
import {
  buildPrimaryDevice,
  collectDevices,
  collectMissingFields,
  summarizeImport,
} from '@/src/features/dive-log/import/summarize-import';
import {
  createSafeXmlParser,
  ensureArray,
  findRootByLocalName,
  readAttr,
  readChild,
  readChildren,
  type XmlRecord,
} from '@/src/features/dive-log/import/xml-utils';
import type { DiveImportPayload, DiveLog } from '@/src/features/dive-log/types';

function parseUddfDuration(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const numeric = Number.parseFloat(value);
  if (Number.isFinite(numeric)) {
    return Math.max(0, Math.round(numeric));
  }

  return parseDurationToSeconds(value);
}

function parseKelvinTemperature(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const kelvin = Number.parseFloat(value);
  if (!Number.isFinite(kelvin)) {
    return parseTemperatureCelsius(value);
  }

  return kelvin - 273.15;
}

function parsePascalDepth(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const pascal = Number.parseFloat(value);
  if (!Number.isFinite(pascal)) {
    return parseDepthMeters(value);
  }

  return pascal / 10_000;
}

function parseProfileSamples(samplesRoot: XmlRecord | undefined): DiveLog['profile'] {
  const waypoints = readChildren(samplesRoot, 'waypoint');

  return waypoints.flatMap((waypoint) => {
    const elapsedSec = parseUddfDuration(readAttr(waypoint, 'time'));
    const depthM = parsePascalDepth(readAttr(waypoint, 'depth'));

    if (elapsedSec == null || depthM == null) {
      return [];
    }

    return [
      {
        elapsedSec,
        depthM,
        tempC: parseKelvinTemperature(readAttr(waypoint, 'temperature')),
      },
    ];
  });
}

function readDeviceInfo(record: XmlRecord): {
  vendor: string;
  model: string;
  serial: string | null;
} {
  const equipment = readChild(record, 'equipmentused');
  const diveComputer = readChild(equipment, 'divecomputer');

  const vendor =
    readAttr(diveComputer, 'manufacturer') ??
    readAttr(diveComputer, 'vendor') ??
    readAttr(equipment, 'manufacturer') ??
    'Unknown';
  const model = readAttr(diveComputer, 'model') ?? readAttr(equipment, 'model') ?? 'Unknown';
  const serial = readAttr(diveComputer, 'serialnumber') ?? readAttr(diveComputer, 'serial');

  return { vendor, model, serial };
}

async function parseDiveRecord(record: XmlRecord, importedAt: string): Promise<DiveLog | null> {
  const before = readChild(record, 'informationbeforedive');
  const after = readChild(record, 'informationafterdive');
  const startedAt =
    readAttr(before, 'datetime') ??
    readAttr(before, 'entrydate') ??
    readAttr(record, 'datetime') ??
    '';

  if (!startedAt) {
    return null;
  }

  const durationSec = parseUddfDuration(readAttr(after, 'duration'));
  const maxDepthM = parsePascalDepth(readAttr(after, 'greatestdepth'));
  const avgDepthM = parsePascalDepth(readAttr(after, 'averagedepth'));
  const { vendor, model, serial } = readDeviceInfo(record);
  const nativeId = readAttr(record, 'id');
  const profile = parseProfileSamples(readChild(record, 'samples'));
  const profileDurationSec =
    profile.length > 0 ? profile[profile.length - 1]?.elapsedSec ?? null : null;

  const gasMix = readChild(readChild(record, 'gasconsumption'), 'mix');
  const sourceRecordId = await buildSourceRecordId({
    format: 'uddf-xml',
    nativeId: nativeId,
    startedAt,
    durationSec,
    maxDepthM,
    vendor,
    model,
  });

  const source = {
    format: 'uddf-xml' as const,
    vendor,
    model,
    sourceRecordId,
    fingerprintModel: model,
    fingerprintSerial: serial,
  };

  const normalized: DiveLog = {
    id: buildLocalDiveLogId(source.format, source.sourceRecordId),
    diveNumber: parseInteger(readAttr(record, 'diveNumber')),
    startedAt,
    endedAt: durationSec != null ? new Date(Date.parse(startedAt) + durationSec * 1000).toISOString() : null,
    durationSec,
    maxDepthM,
    avgDepthM,
    waterTempC: parseKelvinTemperature(readAttr(after, 'lowesttemperature')),
    surfacePressureBar: null,
    gas: gasMix
      ? {
          o2Percent: parseO2Percent(readAttr(gasMix, 'o2')),
          description: readAttr(gasMix, 'name'),
        }
      : null,
    cnsPercent: null,
    otu: null,
    source,
    profile,
    profileSampleCount: profile.length,
    profileDurationSec,
    missingFields: [],
    importedAt,
  };

  normalized.missingFields = collectMissingFields(normalized);
  return normalized;
}

export async function parseUddfExport(xml: string, sourceFile: string): Promise<DiveImportPayload> {
  const importedAt = new Date().toISOString();
  const parser = createSafeXmlParser();
  const parsed = parser.parse(xml) as XmlRecord;
  const uddf = findRootByLocalName(parsed, 'uddf') ?? readChild(parsed, 'uddf');

  if (!uddf) {
    throw new Error('UDDF 파일 형식이 아닙니다.');
  }

  const diveRecords = [
    ...readChildren(uddf, 'diverecord'),
    ...readChildren(readChild(uddf, 'dives'), 'diverecord'),
  ];

  const dives = (
    await Promise.all(diveRecords.map((record) => parseDiveRecord(record, importedAt)))
  ).filter((dive): dive is DiveLog => dive != null);

  if (dives.length === 0) {
    throw new Error('UDDF 파일에서 다이빙 로그를 찾을 수 없습니다.');
  }

  return {
    meta: {
      adapterId: 'uddf-xml',
      adapterVersion: '0.1.0',
      importedAt,
      sourceFile,
      subsurfaceProgram: readAttr(readChild(uddf, 'generator'), 'name'),
      subsurfaceVersion: readAttr(readChild(uddf, 'generator'), 'version'),
    },
    device: buildPrimaryDevice(dives),
    devices: collectDevices(dives),
    dives,
    summary: summarizeImport(dives),
  };
}
