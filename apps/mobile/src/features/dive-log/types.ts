export type DiveProfileSample = {
  elapsedSec: number;
  depthM: number;
  tempC: number | null;
};

export type DiveGas = {
  o2Percent: number | null;
  description: string | null;
};

export type DiveImportFormat = 'subsurface-xml' | 'uddf-xml' | 'fit';

export type DiveSource = {
  format: DiveImportFormat;
  vendor: string;
  model: string;
  sourceRecordId: string;
  fingerprintModel: string | null;
  fingerprintSerial: string | null;
};

export type DiveLog = {
  id: string;
  diveNumber: number | null;
  startedAt: string;
  endedAt: string | null;
  durationSec: number | null;
  maxDepthM: number | null;
  avgDepthM: number | null;
  waterTempC: number | null;
  surfacePressureBar: number | null;
  gas: DiveGas | null;
  cnsPercent: number | null;
  otu: number | null;
  source: DiveSource;
  profile: DiveProfileSample[];
  profileSampleCount: number;
  profileDurationSec: number | null;
  missingFields: string[];
  importedAt: string;
};

export type DiveComputerInfo = {
  vendor: string;
  model: string;
  fingerprintModel: string | null;
  fingerprintSerial: string | null;
  nickname: string;
};

export type DiveImportSummary = {
  diveCount: number;
  dateRange: { start: string | null; end: string | null };
  fieldsPresent: string[];
  fieldsMissing: string[];
};

export type DiveImportPayload = {
  meta: {
    adapterId: DiveImportFormat;
    adapterVersion: string;
    importedAt: string;
    sourceFile: string;
    subsurfaceProgram: string | null;
    subsurfaceVersion: string | null;
  };
  device: DiveComputerInfo;
  devices: DiveComputerInfo[];
  dives: DiveLog[];
  summary: DiveImportSummary;
};

export type DiveImportResult = {
  fileName: string;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  device: DiveComputerInfo;
  summary: DiveImportSummary;
  cloudSynced: boolean;
  importFormat: DiveImportFormat;
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
  'source.sourceRecordId',
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

export type SupportedBrandRoute = 'direct' | 'subsurface' | 'both';

export type SupportedBrandInfo = {
  id: string;
  name: string;
  route: SupportedBrandRoute;
  directFormats: DiveImportFormat[];
  verified: boolean;
  note: string;
};
