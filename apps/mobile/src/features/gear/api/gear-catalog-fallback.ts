import type { GearCatalogProduct, GearCatalogResponse, GearDiveTypeFilter } from '@/src/features/gear/types';

const FALLBACK_PRODUCTS: GearCatalogProduct[] = [
  {
    id: 'fallback-scuba-1',
    title: 'MK25 EVO / S620 X-TIS Regulator Set',
    brandName: 'Scubapro',
    imageUrl: 'https://images.unsplash.com/photo-1583212292454-1fe622960057?w=400&h=400&fit=crop',
    price: 1299,
    currency: 'USD',
    diveType: 'scuba',
  },
  {
    id: 'fallback-scuba-2',
    title: 'Pro HD BCD',
    brandName: 'Aqualung',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
    price: 549,
    currency: 'USD',
    diveType: 'scuba',
  },
  {
    id: 'fallback-scuba-3',
    title: 'Peregrine Dive Computer',
    brandName: 'Shearwater',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
    price: 795,
    currency: 'USD',
    diveType: 'scuba',
  },
  {
    id: 'fallback-scuba-4',
    title: 'Proteus II 5mm Wetsuit',
    brandName: 'Fourth Element',
    imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=400&fit=crop',
    price: 420,
    currency: 'USD',
    diveType: 'scuba',
  },
  {
    id: 'fallback-freediving-1',
    title: 'Cressi Gara Professional Fins',
    brandName: 'Cressi',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-77ef1d0cfc6c?w=400&h=400&fit=crop',
    price: 189,
    currency: 'USD',
    diveType: 'freediving',
  },
  {
    id: 'fallback-freediving-2',
    title: 'Beuchat Mundial Wetsuit 3mm',
    brandName: 'Beuchat',
    imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&h=400&fit=crop',
    price: 249,
    currency: 'USD',
    diveType: 'freediving',
  },
  {
    id: 'fallback-freediving-3',
    title: 'Mares X-Free Freediving Mask',
    brandName: 'Mares',
    imageUrl: 'https://images.unsplash.com/photo-1583212292454-1fe622960057?w=400&h=400&fit=crop',
    price: 79,
    currency: 'USD',
    diveType: 'freediving',
  },
  {
    id: 'fallback-freediving-4',
    title: 'Salvimar Elastic Lanyard',
    brandName: 'Salvimar',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
    price: 35,
    currency: 'USD',
    diveType: 'freediving',
  },
];

export function getFallbackGearCatalog(
  diveType: GearDiveTypeFilter,
  query?: string,
): GearCatalogResponse {
  let products = FALLBACK_PRODUCTS;

  if (diveType === 'scuba') {
    products = products.filter((product) => product.diveType === 'scuba');
  } else if (diveType === 'freediving') {
    products = products.filter((product) => product.diveType === 'freediving');
  }

  if (query?.trim()) {
    const needle = query.trim().toLowerCase();
    products = products.filter(
      (product) =>
        product.title.toLowerCase().includes(needle) ||
        product.brandName.toLowerCase().includes(needle),
    );
  }

  return {
    products,
    total: products.length,
    source: 'fallback',
  };
}
