import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import {
  useIsFollowingRemote,
  useToggleFollowRemote,
} from '@/src/features/social/hooks/useFollowRemote';
import { useFollowStore } from '@/src/features/social/stores/follow-store';
import { isMockSocialUserId } from '@/src/features/social/utils/social-user-id';
import { useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';

type FollowButtonProps = {
  userId: string;
  size?: 'sm' | 'md';
};

export function FollowButton({ userId, size = 'md' }: FollowButtonProps) {
  const { isRemoteSocialEnabled } = useSupabaseAuth();
  const useRemote = isRemoteSocialEnabled && !isMockSocialUserId(userId);

  const localIsFollowing = useFollowStore((state) => state.isFollowing(userId));
  const toggleFollowLocal = useFollowStore((state) => state.toggleFollow);

  const { data: remoteIsFollowing } = useIsFollowingRemote(useRemote ? userId : null);
  const toggleFollowRemote = useToggleFollowRemote(useRemote ? userId : null);

  const isFollowing = useRemote ? (remoteIsFollowing ?? false) : localIsFollowing;
  const isPending = toggleFollowRemote.isPending;

  const handlePress = () => {
    if (useRemote) {
      toggleFollowRemote.mutate();
      return;
    }

    toggleFollowLocal(userId);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isFollowing, busy: isPending }}
      accessibilityLabel={isFollowing ? '팔로잉' : '팔로우'}
      disabled={isPending}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.buttonSm,
        isFollowing ? styles.following : styles.follow,
        (pressed || isPending) && styles.pressed,
      ]}>
      <AppText
        variant="label"
        style={[styles.label, isFollowing ? styles.labelFollowing : styles.labelFollow]}>
        {isFollowing ? '팔로잉' : '팔로우'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSm: {
    minHeight: 32,
    paddingHorizontal: spacing.md,
  },
  follow: {
    backgroundColor: colors.primary,
  },
  following: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  labelFollow: {
    color: colors.textOnPrimary,
  },
  labelFollowing: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
});
