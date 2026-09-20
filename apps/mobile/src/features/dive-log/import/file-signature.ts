import type { DiveImportFormat } from '@/src/features/dive-log/types';

const FIT_HEADER = new Uint8Array([0x0e, 0x10]);

export type ImportFileInput = {
  fileName: string;
  mimeType: string | null;
  bytes: Uint8Array;
};

export function decodeUtf8Text(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

export function detectXmlRoot(text: string): 'divelog' | 'uddf' | null {
  const trimmed = text.trimStart();
  if (/<!DOCTYPE/i.test(trimmed.slice(0, 256))) {
    throw new Error('DOCTYPE가 포함된 XML은 보안상 가져올 수 없습니다.');
  }

  if (/^<\?xml[\s\S]*?<divelog\b/i.test(trimmed) || /^<divelog\b/i.test(trimmed)) {
    return 'divelog';
  }

  if (/^<\?xml[\s\S]*?<uddf\b/i.test(trimmed) || /^<uddf\b/i.test(trimmed)) {
    return 'uddf';
  }

  return null;
}

export function isFitFile(bytes: Uint8Array): boolean {
  return bytes.length >= 12 && bytes[0] === FIT_HEADER[0] && bytes[1] === FIT_HEADER[1];
}

export function sniffImportFormat(input: ImportFileInput): DiveImportFormat | null {
  if (isFitFile(input.bytes)) {
    return 'fit';
  }

  const text = decodeUtf8Text(input.bytes);
  const xmlRoot = detectXmlRoot(text);

  if (xmlRoot === 'divelog') {
    return 'subsurface-xml';
  }

  if (xmlRoot === 'uddf') {
    return 'uddf-xml';
  }

  const lowerName = input.fileName.toLowerCase();
  if (lowerName.endsWith('.fit')) {
    return 'fit';
  }
  if (lowerName.endsWith('.uddf')) {
    return 'uddf-xml';
  }
  if (lowerName.endsWith('.ssrf') || lowerName.endsWith('.xml')) {
    return null;
  }

  return null;
}

export const IMPORT_FILE_EXTENSIONS = ['.ssrf', '.xml', '.uddf', '.fit'] as const;

export function isSupportedImportExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return IMPORT_FILE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}
