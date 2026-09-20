import { decodeUtf8Text, type ImportFileInput } from '@/src/features/dive-log/import/file-signature';
import { parseFitExport } from '@/src/features/dive-log/import/parse-fit';
import { parseSubsurfaceExport } from '@/src/features/dive-log/import/parse-subsurface';
import { parseUddfExport } from '@/src/features/dive-log/import/parse-uddf';
import type { DiveImportFormat, DiveImportPayload } from '@/src/features/dive-log/types';

export type DiveImportAdapter = {
  id: DiveImportFormat;
  extensions: readonly string[];
  parse: (input: ImportFileInput) => Promise<DiveImportPayload>;
};

const subsurfaceAdapter: DiveImportAdapter = {
  id: 'subsurface-xml',
  extensions: ['.ssrf', '.xml'],
  parse: async (input) => parseSubsurfaceExport(decodeUtf8Text(input.bytes), input.fileName),
};

const uddfAdapter: DiveImportAdapter = {
  id: 'uddf-xml',
  extensions: ['.uddf', '.xml'],
  parse: async (input) => parseUddfExport(decodeUtf8Text(input.bytes), input.fileName),
};

const fitAdapter: DiveImportAdapter = {
  id: 'fit',
  extensions: ['.fit'],
  parse: async (input) => parseFitExport(input.bytes, input.fileName),
};

const ADAPTERS: DiveImportAdapter[] = [subsurfaceAdapter, uddfAdapter, fitAdapter];

export function getImportAdapter(format: DiveImportFormat): DiveImportAdapter {
  const adapter = ADAPTERS.find((candidate) => candidate.id === format);
  if (!adapter) {
    throw new Error('지원하지 않는 import 형식입니다.');
  }

  return adapter;
}

export async function parseImportFile(
  input: ImportFileInput,
  format: DiveImportFormat,
): Promise<DiveImportPayload> {
  return getImportAdapter(format).parse(input);
}
