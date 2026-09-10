import type { PlaceCategory } from '../types.js';

export type PlaceType = 'shop' | 'pool' | 'site';
export type SourceApi = 'google-places' | 'naver-local' | 'kakao-local' | 'overpass-osm';
export type VerificationStatus = 'verified' | 'partial' | 'unverified' | 'disputed';
export type Confidence = 'high' | 'medium' | 'low';

export const CATEGORY_TO_PLACE_TYPE: Record<PlaceCategory, PlaceType> = {
  'dive-shops': 'shop',
  'dive-pools': 'pool',
  'dive-sites': 'site',
};

export type SourceRecord = {
  api: SourceApi;
  sourceId: string;
  sourceUrl?: string;
  sourceQuery?: string;
  fetchedAt?: string;
  raw: unknown;
};

export type PlaceCandidate = {
  placeType: PlaceType;
  name: string;
  address: string;
  lat: number;
  lon: number;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  naverMapUrl?: string;
  kakaoMapUrl?: string;
  rawCategory?: string;
  status: 'active' | 'closed' | 'unknown';
  sources: SourceRecord[];
};

export type NormalizedPlace = {
  id: string;
  placeType: PlaceType;
  name: string;
  nameNormalized: string;
  countryCode: string;
  region?: string;
  city?: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  naverMapUrl?: string;
  kakaoMapUrl?: string;
  status: 'active' | 'closed' | 'unknown';
  verificationStatus: VerificationStatus;
  verificationSourceCount: number;
  confidence: Confidence;
  rawCategory?: string;
  sourceApis: SourceApi[];
  mergedFromCount: number;
  tags: string[];
  sources: SourceRecord[];
};

export type PipelineReport = {
  processedAt: string;
  inputCounts: Record<SourceApi, Record<PlaceType, number>>;
  afterRelevanceFilter: Record<PlaceType, number>;
  afterDedup: Record<PlaceType, number>;
  verification: Record<VerificationStatus, number>;
  outputTotal: number;
};
