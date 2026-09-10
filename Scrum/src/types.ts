export type PlaceCategory = 'dive-shops' | 'dive-pools' | 'dive-sites';

export type SearchQuery = {
  query: string;
  category: PlaceCategory;
  region?: string;
};

export type CollectionMeta = {
  api: string;
  category: PlaceCategory;
  fetchedAt: string;
  queryCount: number;
  resultCount: number;
  notes?: string;
};

export type CollectionFile<TItem> = {
  meta: CollectionMeta;
  queries: SearchQuery[];
  items: TItem[];
};

export type GooglePlacesItem = {
  id: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  googleMapsUri?: string;
  businessStatus?: string;
  sourceQuery: string;
  sourceCategory: PlaceCategory;
};

export type NaverLocalItem = {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
  sourceQuery: string;
  sourceCategory: PlaceCategory;
};

export type KakaoLocalItem = {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  sourceQuery: string;
  sourceCategory: PlaceCategory;
};

export type OverpassOsmItem = {
  osmType: 'node' | 'way' | 'relation';
  osmId: number;
  lat: number | null;
  lon: number | null;
  tags: Record<string, string>;
  sourceCategory: PlaceCategory;
  sourceQuery: string;
};
