import { create } from 'zustand';

import type { GearCatalogProduct, RegisteredGearItem } from '@/src/features/gear/types';
import { inferGearCategory } from '@/src/features/gear/utils/infer-gear-category';

type GearStoreState = {
  registeredGear: RegisteredGearItem[];
  registerGear: (product: GearCatalogProduct) => boolean;
  isRegistered: (catalogProductId: string) => boolean;
  removeGear: (id: string) => void;
};

function createRegisteredGearItem(product: GearCatalogProduct): RegisteredGearItem {
  const now = new Date().toISOString().slice(0, 10);

  return {
    id: `gear-${product.id}`,
    catalogProductId: product.id,
    title: product.title,
    brandName: product.brandName,
    imageUrl: product.imageUrl,
    price: product.price,
    currency: product.currency,
    diveType: product.diveType,
    category: inferGearCategory(product.title),
    diveCount: 0,
    lastServiceDate: null,
    serviceInterval: '12개월 또는 100다이브',
    maintenanceStatus: 'ok',
    maintenanceMessage: '정비 상태 양호',
    registeredAt: now,
  };
}

export const useGearStore = create<GearStoreState>((set, get) => ({
  registeredGear: [],

  registerGear: (product) => {
    if (get().isRegistered(product.id)) {
      return false;
    }

    set((state) => ({
      registeredGear: [createRegisteredGearItem(product), ...state.registeredGear],
    }));

    return true;
  },

  isRegistered: (catalogProductId) =>
    get().registeredGear.some((item) => item.catalogProductId === catalogProductId),

  removeGear: (id) => {
    set((state) => ({
      registeredGear: state.registeredGear.filter((item) => item.id !== id),
    }));
  },
}));
