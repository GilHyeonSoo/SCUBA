const COVER_IMAGE_BASE =
  'https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=900&h=560&q=80';

const AVATAR_IMAGE_BASE =
  'https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=240&h=240&q=80';

function buildCoverUri(photoId: string): string {
  return COVER_IMAGE_BASE.replace('{id}', photoId);
}

function buildAvatarUri(photoId: string): string {
  return AVATAR_IMAGE_BASE.replace('{id}', photoId);
}

/** Verified Unsplash IDs — diving, ocean, and portrait photos for mock meetings. */
export const meetingMockImages = {
  covers: {
    poolPractice: buildCoverUri('1578662996442-48f60103fc96'),
    oceanFunDive: buildCoverUri('1559827260-dc66d52bef19'),
    nightBeachTour: buildCoverUri('1507525428034-b723cf961d3e'),
    poolEducation: buildCoverUri('1583212292454-1fe6229603b7'),
    seaExperienceTour: buildCoverUri('1544551763-46a013bb70d5'),
    poolTraining: buildCoverUri('1682687220063-4742bd7fd538'),
  },
  avatars: {
    diverKim: buildAvatarUri('1535713875002-d1d0cf377fde'),
    blueFin: buildAvatarUri('1507003211169-0a1dd7228f2d'),
    sokchoDiveCenter: buildAvatarUri('1472099645785-5658abf4ff4e'),
    waveRunner: buildAvatarUri('1494790108377-be9c29b29330'),
    yeosuMarineDive: buildAvatarUri('1560250097-0b93528c311a'),
    diveCoach: buildAvatarUri('1580489944761-15a19d654956'),
  },
} as const;
