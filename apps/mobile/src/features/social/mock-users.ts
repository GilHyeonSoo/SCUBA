import { buddyProfiles } from '@/src/features/buddy/mock-data';
import { mockProfileGalleryImages } from '@/src/features/profile/mock-data/profile-gallery-mock-data';
import type { ProfileGalleryImage } from '@/src/features/profile/types';
import { CURRENT_USER_ID } from '@/src/features/social/constants';
import type { SocialUserProfile } from '@/src/features/social/types';

const buddyGalleryOffsets = [0, 3, 6, 9, 0, 3];

function sliceGallery(userId: string, offset: number, count: number): ProfileGalleryImage[] {
  return mockProfileGalleryImages.slice(offset, offset + count).map((image, index) => ({
    ...image,
    id: `${userId}-photo-${index}`,
    userId,
  }));
}

export const mockUserProfiles: Record<string, SocialUserProfile> = {
  [CURRENT_USER_ID]: {
    id: CURRENT_USER_ID,
    displayName: '다이버',
    bio: '프로필을 완성하고 버디를 찾아보세요',
    profileImageUrl: null,
    discipline: 'scuba',
    certificationLabel: 'AOW',
    region: '서울',
  },
  ...Object.fromEntries(
    buddyProfiles.map((buddy) => [
      buddy.id,
      {
        id: buddy.id,
        displayName: buddy.nickname,
        bio: buddy.status,
        profileImageUrl: buddy.profileImageUrl,
        discipline: buddy.diveType === 'both' ? 'both' : buddy.diveType,
        certificationLabel: buddy.certification,
        region: buddy.region,
      } satisfies SocialUserProfile,
    ]),
  ),
};

export const mockUserGalleries: Record<string, ProfileGalleryImage[]> = {
  [CURRENT_USER_ID]: mockProfileGalleryImages.map((image) => ({
    ...image,
    userId: CURRENT_USER_ID,
  })),
  ...Object.fromEntries(
    buddyProfiles.map((buddy, index) => [
      buddy.id,
      sliceGallery(buddy.id, buddyGalleryOffsets[index] ?? 0, 4 + (index % 3)),
    ]),
  ),
};

export function getSocialUser(userId: string): SocialUserProfile | null {
  return mockUserProfiles[userId] ?? null;
}

export function getUserGallery(userId: string): ProfileGalleryImage[] {
  if (userId === CURRENT_USER_ID) {
    return mockUserGalleries[CURRENT_USER_ID];
  }

  return mockUserGalleries[userId] ?? [];
}
