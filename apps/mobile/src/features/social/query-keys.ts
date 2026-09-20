export const socialQueryKeys = {
  myProfile: ['profile', 'me'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  gallery: (userId: string) => ['gallery', userId] as const,
  followStats: (userId: string) => ['follow-stats', userId] as const,
  followers: (userId: string) => ['followers', userId] as const,
  following: (userId: string) => ['following', userId] as const,
  isFollowing: (userId: string) => ['is-following', userId] as const,
  photoSocial: (photoId: string) => ['photo-social', photoId] as const,
  photoComments: (photoId: string) => ['photo-comments', photoId] as const,
};
