import type {
  ExplorePlaceEnrichment,
  OperatingHoursRow,
  OperatingHoursTable,
} from '@/src/features/explore/types';

function isOperatingHoursTable(value: unknown): value is OperatingHoursTable {
  if (!value || typeof value !== 'object' || !('rows' in value)) {
    return false;
  }

  const rows = (value as OperatingHoursTable).rows;
  return Array.isArray(rows);
}

export function readOperatingHoursRows(
  value: OperatingHoursTable | string | null | undefined,
): OperatingHoursRow[] | undefined {
  if (!value) {
    return undefined;
  }

  if (isOperatingHoursTable(value)) {
    return value.rows;
  }

  if (typeof value === 'string' && value.trim()) {
    return undefined;
  }

  return undefined;
}

export function extractOperatingHoursFromEnrichment(
  enrichment?: ExplorePlaceEnrichment,
): OperatingHoursRow[] | undefined {
  const poolHours = enrichment?.pool?.operatingHours?.value;
  const shopHours = enrichment?.shop?.operatingHours?.value;
  return readOperatingHoursRows(poolHours) ?? readOperatingHoursRows(shopHours);
}
