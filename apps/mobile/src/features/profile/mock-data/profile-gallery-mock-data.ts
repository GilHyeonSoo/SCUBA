import type { ProfileGalleryImage } from '@/src/features/profile/types';

const MOCK_IMAGE_BASE =
  'https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=600&h=720&q=80';

const MOCK_IMAGE_IDS = [
  '1559827260-dc66d52bef19',
  '1583212292454-1fe6229603b7',
  '1544551763-46a013bb70d5',
  '1682687220063-4742bd7fd538',
  '1507525428034-b723cf961d3e',
  '1439066615861-d1af74d74000',
  '1506905925346-21bda4d32df4',
  '1469474968028-56623f02e42e',
  '1578662996442-48f60103fc96',
  '1493246507139-91e8fad9978e',
  '1441974231531-c6227db76b6e',
  '1470071459604-3b5ec3a7fe05',
] as const;

function buildMockUri(photoId: string): string {
  return MOCK_IMAGE_BASE.replace('{id}', photoId);
}

export const mockProfileGalleryImages: ProfileGalleryImage[] = MOCK_IMAGE_IDS.map(
  (photoId, index) => ({
    id: `mock-gallery-${index + 1}`,
    uri: buildMockUri(photoId),
    createdAt: Date.now() - index * 86_400_000,
  }),
);
