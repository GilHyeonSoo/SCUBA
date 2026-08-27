import { getFallbackGearCatalog } from '@/src/features/gear/api/gear-catalog-fallback';
import type { GearCatalogResponse, GearDiveTypeFilter } from '@/src/features/gear/types';
import {
  getSupabaseAnonKey,
  getSupabaseFunctionUrl,
  isSupabaseConfigured,
} from '@/src/services/supabase';

export type FetchGearCatalogParams = {
  diveType?: GearDiveTypeFilter;
  query?: string;
  limit?: number;
  pageToken?: string;
};

export type GearCatalogErrorCode =
  | 'NOT_CONFIGURED'
  | 'FUNCTION_NOT_FOUND'
  | 'CHANNEL3_NOT_CONFIGURED'
  | 'API_ERROR';

export class GearCatalogError extends Error {
  readonly code: GearCatalogErrorCode;

  constructor(message: string, code: GearCatalogErrorCode) {
    super(message);
    this.name = 'GearCatalogError';
    this.code = code;
  }
}

type FunctionErrorBody = {
  error?: string;
  message?: string;
  code?: string;
};

function mapHttpError(status: number, body: FunctionErrorBody): GearCatalogError {
  const message = body.error ?? body.message ?? `HTTP ${status}`;

  if (
    status === 404 ||
    body.code === 'NOT_FOUND' ||
    message.toLowerCase().includes('not found')
  ) {
    return new GearCatalogError(
      'search-gear-products Edge Function이 배포되지 않았습니다. 터미널에서 supabase login 후 pnpm deploy:gear-function을 실행해 주세요.',
      'FUNCTION_NOT_FOUND',
    );
  }

  if (message.toLowerCase().includes('channel3') && message.toLowerCase().includes('not configured')) {
    return new GearCatalogError(
      'Supabase에 Channel3 API 키 시크릿이 설정되지 않았습니다. (CHANNEL3_API_KEY 또는 channel3_api_key)',
      'CHANNEL3_NOT_CONFIGURED',
    );
  }

  if (message.includes('CHANNEL3_API_KEY') || message.includes('channel3_api_key')) {
    return new GearCatalogError(
      'Supabase에 Channel3 API 키 시크릿이 설정되지 않았습니다. (CHANNEL3_API_KEY 또는 channel3_api_key)',
      'CHANNEL3_NOT_CONFIGURED',
    );
  }

  return new GearCatalogError(message, 'API_ERROR');
}

export async function fetchGearCatalog(
  params: FetchGearCatalogParams = {},
): Promise<GearCatalogResponse> {
  const diveType = params.diveType ?? 'all';
  const limit = params.limit ?? 30;
  const query = params.query?.trim();
  const pageToken = params.pageToken?.trim();

  if (!isSupabaseConfigured) {
    return getFallbackGearCatalog(diveType, query);
  }

  const functionUrl = getSupabaseFunctionUrl('search-gear-products');
  const anonKey = getSupabaseAnonKey();

  if (!functionUrl) {
    return getFallbackGearCatalog(diveType, query);
  }

  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify({ diveType, query, limit, pageToken }),
  });

  let body: (GearCatalogResponse & FunctionErrorBody) | null = null;
  try {
    body = (await response.json()) as GearCatalogResponse & FunctionErrorBody;
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw mapHttpError(response.status, body ?? {});
  }

  if (body?.error) {
    throw mapHttpError(response.status, body);
  }

  if (!body) {
    throw new GearCatalogError('카탈로그 응답이 비어 있습니다.', 'API_ERROR');
  }

  return {
    products: body.products ?? [],
    total: body.total ?? body.products?.length ?? 0,
    source: body.source ?? 'channel3',
    nextPageToken: body.nextPageToken ?? null,
    hasMore: body.hasMore ?? Boolean(body.nextPageToken),
  };
}
