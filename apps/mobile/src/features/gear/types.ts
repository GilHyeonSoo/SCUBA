export type GearDiveType = 'scuba' | 'freediving';

export type GearDiveTypeFilter = 'all' | GearDiveType;

export type GearMaintenanceStatus = 'ok' | 'upcoming' | 'due';

export type GearCatalogProduct = {
  id: string;
  title: string;
  brandName: string;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
  diveType: GearDiveType;
};

export type GearCatalogResponse = {
  products: GearCatalogProduct[];
  total: number;
  source: 'channel3' | 'fallback';
  nextPageToken?: string | null;
  hasMore?: boolean;
};

export type RegisteredGearItem = {
  id: string;
  catalogProductId: string;
  title: string;
  brandName: string;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
  diveType: GearDiveType;
  category: string;
  diveCount: number;
  lastServiceDate: string | null;
  serviceInterval: string;
  maintenanceStatus: GearMaintenanceStatus;
  maintenanceMessage: string;
  registeredAt: string;
};
