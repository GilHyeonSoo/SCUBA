const BANNER_IMAGE_BASE =
  'https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=1200&h=560&q=85';

function buildBannerUri(photoId: string): string {
  return BANNER_IMAGE_BASE.replace('{id}', photoId);
}

/** Verified Unsplash IDs for home ad banner mock creatives. */
export const homeAdImages = {
  jejuBoatTour: buildBannerUri('1544551763-46a013bb70d5'),
  diveComputer: buildBannerUri('1559827260-dc66d52bef19'),
  seoulDivePool: buildBannerUri('1578662996442-48f60103fc96'),
} as const;
