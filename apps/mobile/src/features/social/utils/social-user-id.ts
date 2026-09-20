import { CURRENT_USER_ID } from '@/src/features/social/constants';

export function isMockSocialUserId(userId: string): boolean {
  return userId.startsWith('buddy-');
}

export function resolveSocialUserIdParam(
  userId: string | undefined,
  currentUserId: string | null,
): string {
  if (!userId || userId === CURRENT_USER_ID) {
    return currentUserId ?? CURRENT_USER_ID;
  }

  return userId;
}
