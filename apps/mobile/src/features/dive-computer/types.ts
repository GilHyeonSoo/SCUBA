import type { DiveImportResult } from '@/src/features/dive-log/types';

export type MockDiveComputerDevice = {
  id: string;
  brandId: string;
  vendor: string;
  model: string;
  nickname: string;
  serialSuffix: string;
};

export type MockDivePreview = {
  id: string;
  startedAt: string;
  maxDepthM: number;
  durationMin: number;
  siteName: string;
};

export type ConnectStep = 'brand' | 'device' | 'connecting' | 'sync';

export type MockDiveImportResult = DiveImportResult & {
  importFormat: 'mock-ble';
};
