export type NormalizedDiveProfileSample = {
  elapsedSec: number;
  depthM: number;
  tempC: number | null;
};

export type NormalizedDiveGas = {
  o2Percent: number | null;
  description: string | null;
};

export type NormalizedDiveSource = {
  format: 'subsurface-xml';
  vendor: string;
  model: string;
  diveComputerDiveId: string;
  fingerprintModel: string | null;
  fingerprintSerial: string | null;
};

export type NormalizedDiveLog = {
  id: string;
  diveNumber: number | null;
  startedAt: string;
  endedAt: string | null;
  durationSec: number;
  maxDepthM: number | null;
  avgDepthM: number | null;
  waterTempC: number | null;
  surfacePressureBar: number | null;
  gas: NormalizedDiveGas | null;
  cnsPercent: number | null;
  otu: number | null;
  source: NormalizedDiveSource;
  profile: NormalizedDiveProfileSample[];
  profileSampleCount: number;
  profileDurationSec: number | null;
  missingFields: string[];
};

export type NormalizedDiveImport = {
  meta: {
    parser: 'scuba-subsurface-import-poc';
    parserVersion: '0.1.0';
    importedAt: string;
    sourceFile: string;
    subsurfaceProgram: string | null;
    subsurfaceVersion: string | null;
  };
  device: {
    vendor: string;
    model: string;
    fingerprintModel: string | null;
    fingerprintSerial: string | null;
  };
  dives: NormalizedDiveLog[];
  summary: {
    diveCount: number;
    dateRange: { start: string | null; end: string | null };
    fieldsPresent: string[];
    fieldsMissing: string[];
  };
};

export const SUPPORTED_IMPORT_FIELDS = [
  'startedAt',
  'durationSec',
  'maxDepthM',
  'avgDepthM',
  'waterTempC',
  'gas.o2Percent',
  'cnsPercent',
  'otu',
  'profile',
  'source.diveComputerDiveId',
] as const;

export const OPTIONAL_IMPORT_FIELDS = [
  'tankPressure',
  'sac',
  'ndl',
  'deco',
  'ascentRate',
  'location',
  'buddy',
  'notes',
] as const;
