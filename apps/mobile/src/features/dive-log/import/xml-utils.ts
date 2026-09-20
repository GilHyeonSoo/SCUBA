import { XMLParser } from 'fast-xml-parser';

import type { DiveImportFormat } from '@/src/features/dive-log/types';

export type XmlRecord = Record<string, unknown>;

export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function readAttr(node: XmlRecord | undefined, key: string): string | null {
  if (!node) {
    return null;
  }

  const value = node[`@_${key}`];
  return typeof value === 'string' ? value : null;
}

export function readChild(node: XmlRecord | undefined, key: string): XmlRecord | undefined {
  const value = node?.[key];
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as XmlRecord;
  }

  return undefined;
}

export function readChildren(node: XmlRecord | undefined, key: string): XmlRecord[] {
  const value = node?.[key];
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is XmlRecord => Boolean(item) && typeof item === 'object');
  }

  if (typeof value === 'object') {
    return [value as XmlRecord];
  }

  return [];
}

export function findRootByLocalName(parsed: XmlRecord, localName: string): XmlRecord | undefined {
  if (parsed[localName] && typeof parsed[localName] === 'object') {
    return parsed[localName] as XmlRecord;
  }

  for (const value of Object.values(parsed)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      continue;
    }

    const record = value as XmlRecord;
    const key = Object.keys(record).find((candidate) => candidate.endsWith(`:${localName}`));
    if (key && typeof record[key] === 'object') {
      return record[key] as XmlRecord;
    }
  }

  return undefined;
}

export function createSafeXmlParser(): XMLParser {
  return new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
    removeNSPrefix: true,
    processEntities: false,
    ignoreDeclaration: true,
  });
}
