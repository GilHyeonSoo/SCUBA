import { syncDiveImportToSupabase } from '@/src/features/dive-log/api/dive-import.api';
import {
  assertImportFileLimits,
  assertImportPayloadLimits,
} from '@/src/features/dive-log/import/validate-import';
import { parseImportFile } from '@/src/features/dive-log/import/adapter-registry';
import {
  IMPORT_FILE_EXTENSIONS,
  isSupportedImportExtension,
  sniffImportFormat,
  type ImportFileInput,
} from '@/src/features/dive-log/import/file-signature';
import { IMPORT_FORMAT_LABELS } from '@/src/features/dive-log/import/supported-brands';
import { useDiveLogStore } from '@/src/features/dive-log/stores/dive-log-store';
import type { DiveImportFormat, DiveImportResult } from '@/src/features/dive-log/types';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

async function readDocumentBytes(uri: string): Promise<Uint8Array> {
  const file = new File(uri);
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

function buildImportInput(
  fileName: string,
  mimeType: string | null,
  bytes: Uint8Array,
): ImportFileInput {
  return { fileName, mimeType, bytes };
}

export async function importDiveLogFile(
  preferredFormat?: DiveImportFormat,
): Promise<DiveImportResult | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['text/xml', 'application/xml', 'application/octet-stream', 'application/vnd.ant.fit', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const fileName = asset.name ?? 'import.ssrf';
  const bytes = await readDocumentBytes(asset.uri);
  assertImportFileLimits(bytes);

  const input = buildImportInput(fileName, asset.mimeType ?? null, bytes);
  const detectedFormat = preferredFormat ?? sniffImportFormat(input);

  if (!detectedFormat) {
    if (!isSupportedImportExtension(fileName)) {
      throw new Error(
        `지원하지 않는 파일입니다. 허용 확장자: ${IMPORT_FILE_EXTENSIONS.join(', ')}`,
      );
    }

    throw new Error(
      '파일 형식을 확인할 수 없습니다. Subsurface XML, UDDF, FIT 파일인지 확인해 주세요.',
    );
  }

  const payload = await parseImportFile(input, detectedFormat);
  assertImportPayloadLimits(payload);

  const { importedCount, updatedCount, skippedCount } = useDiveLogStore
    .getState()
    .mergeImport(payload);

  let cloudSynced = false;
  try {
    cloudSynced = await syncDiveImportToSupabase(payload);
  } catch {
    cloudSynced = false;
  }

  return {
    fileName,
    importedCount,
    updatedCount,
    skippedCount,
    device: payload.device,
    summary: payload.summary,
    cloudSynced,
    importFormat: detectedFormat,
  };
}

export function formatImportResultMessage(result: DiveImportResult): string {
  const formatLabel = IMPORT_FORMAT_LABELS[result.importFormat];
  const lines = [
    `${formatLabel} · ${result.device.nickname} · ${result.summary.diveCount}개 다이브`,
    `신규 ${result.importedCount} · 업데이트 ${result.updatedCount} · 건너뜀 ${result.skippedCount}`,
  ];

  if (result.cloudSynced) {
    lines.push('클라우드에 동기화했습니다.');
  } else {
    lines.push('현재 세션에 불러왔습니다. (로그인 후 클라우드 동기화 가능)');
  }

  return lines.join('\n');
}
