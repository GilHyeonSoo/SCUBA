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
  readAttr,
  readChild,
  type XmlRecord,
} from '@/src/features/dive-log/import/xml-utils';
import type { DiveImportPayload, DiveLog } from '@/src/features/dive-log/types';

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

function parseProfileSamples(diveComputer: XmlRecord | undefined): DiveLog['profile'] {
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

function collectSubsurfaceDiveNodes(divesRoot: XmlRecord | undefined): XmlRecord[] {
  if (!divesRoot) {
    return [];
  }

  const fromTrips = ensureArray(divesRoot.trip).flatMap((trip) => {
    if (!trip || typeof trip !== 'object') {
      return [];
    }

    return ensureArray((trip as XmlRecord).dive);
  });

  const directDives = ensureArray(divesRoot.dive);

  return [...fromTrips, ...directDives].filter(
    (node): node is XmlRecord => Boolean(node) && typeof node === 'object',
  );
}

async function parseDiveNode(
  diveNode: XmlRecord,
  fingerprint: { model: string | null; serial: string | null },
  importedAt: string,
): Promise<DiveLog | null> {
  const diveComputer = readChild(diveNode, 'divecomputer');
  const cylinders = ensureArray(diveNode.cylinder);
  const cylinder = cylinders[0] as XmlRecord | undefined;
  const depth = readChild(diveComputer, 'depth');
  const temperature = readChild(diveComputer, 'temperature');
  const surface = readChild(diveComputer, 'surface');

  const date = readAttr(diveNode, 'date');
  const time = readAttr(diveNode, 'time');
  const startedAt = date && time ? combineDateAndTime(date, time) : '';

  if (!startedAt) {
    return null;
  }

  const durationSec = parseDurationToSeconds(readAttr(diveNode, 'duration'));
  const endedAt = durationSec != null ? addSecondsToIsoLocal(startedAt, durationSec) : null;
  const model = readAttr(diveComputer, 'model');
  const { vendor, model: deviceModel } = splitVendorModel(model);
  const nativeDiveId = readAttr(diveComputer, 'diveid');
  const profile = parseProfileSamples(diveComputer);
  const profileDurationSec =
    profile.length > 0 ? profile[profile.length - 1]?.elapsedSec ?? null : null;
  const maxDepthM = parseDepthMeters(readAttr(depth, 'max'));

  const sourceRecordId = await buildSourceRecordId({
    format: 'subsurface-xml',
    nativeId: nativeDiveId,
    startedAt,
    durationSec,
    maxDepthM,
    vendor,
    model: deviceModel,
  });

  const source = {
    format: 'subsurface-xml' as const,
    vendor,
    model: deviceModel,
    sourceRecordId,
    fingerprintModel: fingerprint.model,
    fingerprintSerial: fingerprint.serial,
  };

  const normalized: DiveLog = {
    id: buildLocalDiveLogId(source.format, source.sourceRecordId),
    diveNumber: parseInteger(readAttr(diveNode, 'number')),
    startedAt,
    endedAt,
    durationSec,
    maxDepthM,
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

export async function parseSubsurfaceExport(
  xml: string,
  sourceFile: string,
): Promise<DiveImportPayload> {
  const importedAt = new Date().toISOString();
  const parser = createSafeXmlParser();
  const parsed = parser.parse(xml) as XmlRecord;
  const divelog = readChild(parsed, 'divelog');
  const settings = readChild(divelog, 'settings');
  const fingerprint = readChild(settings, 'fingerprint');
  const divesRoot = readChild(divelog, 'dives');

  const fingerprintModel = readAttr(fingerprint, 'model');
  const fingerprintSerial = readAttr(fingerprint, 'serial');

  const diveNodes = collectSubsurfaceDiveNodes(divesRoot);
  const dives = (
    await Promise.all(
      diveNodes.map((node) =>
        parseDiveNode(
          node,
          {
            model: fingerprintModel,
            serial: fingerprintSerial,
          },
          importedAt,
        ),
      ),
    )
  ).filter((dive): dive is DiveLog => dive != null);

  if (dives.length === 0) {
    throw new Error('파일에서 다이빙 로그를 찾을 수 없습니다.');
  }

  return {
    meta: {
      adapterId: 'subsurface-xml',
      adapterVersion: '0.2.0',
      importedAt,
      sourceFile,
      subsurfaceProgram: readAttr(divelog, 'program'),
      subsurfaceVersion: readAttr(divelog, 'version'),
    },
    device: buildPrimaryDevice(dives),
    devices: collectDevices(dives),
    dives,
    summary: summarizeImport(dives),
  };
}
