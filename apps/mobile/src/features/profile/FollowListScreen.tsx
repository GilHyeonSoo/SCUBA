import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppHeader, AppText } from '@/src/components/ui';
import { colors, layout, spacing } from '@/src/constants';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import { useProfileRemote } from '@/src/features/profile/hooks/useProfileRemote';
import { CURRENT_USER_ID } from '@/src/features/social/constants';
import {
  useFollowersRemote,
  useFollowingRemote,
} from '@/src/features/social/hooks/useFollowRemote';
import { getSocialUser } from '@/src/features/social/mock-users';
import { useFollowStore } from '@/src/features/social/stores/follow-store';
import type { SocialUserProfile } from '@/src/features/social/types';
import {
  isMockSocialUserId,
  resolveSocialUserIdParam,
} from '@/src/features/social/utils/social-user-id';
import { useCurrentSocialUserId } from '@/src/hooks/useCurrentSocialUserId';
import { useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';

type FollowListScreenProps = {
  mode: 'followers' | 'following';
};

function FollowUserRow({ user, onPress }: { user: SocialUserProfile; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <ProfileAvatar imageUrl={user.profileImageUrl} size={48} />
      <View style={styles.rowText}>
        <AppText variant="body" style={styles.name}>
          {user.displayName}
        </AppText>
        <AppText variant="caption" style={styles.meta}>
          {`${user.certificationLabel} · ${user.region}`}
        </AppText>
      </View>
    </Pressable>
  );
}

export default function FollowListScreen({ mode }: FollowListScreenProps) {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string | string[] }>();
  const paramUserId = Array.isArray(userId) ? userId[0] : userId;

  const { isRemoteSocialEnabled } = useSupabaseAuth();
  const { userId: currentUserId, isLoading: isCurrentUserLoading } = useCurrentSocialUserId();

  const resolvedUserId = resolveSocialUserIdParam(paramUserId, currentUserId);
  const useRemote = isRemoteSocialEnabled && !isMockSocialUserId(resolvedUserId);

  const getFollowers = useFollowStore((state) => state.getFollowers);
  const getFollowing = useFollowStore((state) => state.getFollowing);

  const { data: remoteFollowers, isLoading: isFollowersLoading } = useFollowersRemote(
    useRemote && mode === 'followers' ? resolvedUserId : null,
  );
  const { data: remoteFollowing, isLoading: isFollowingLoading } = useFollowingRemote(
    useRemote && mode === 'following' ? resolvedUserId : null,
  );

  const mockOwner = getSocialUser(resolvedUserId);
  const { data: remoteOwner } = useProfileRemote(useRemote ? resolvedUserId : null);
  const owner = useRemote ? remoteOwner : mockOwner;

  const users =
    useRemote && mode === 'followers'
      ? (remoteFollowers ?? [])
      : useRemote && mode === 'following'
        ? (remoteFollowing ?? [])
        : mode === 'followers'
          ? getFollowers(resolvedUserId)
          : getFollowing(resolvedUserId);

  const title = mode === 'followers' ? '팔로워' : '팔로잉';
  const isLoading =
    isCurrentUserLoading || (useRemote && (isFollowersLoading || isFollowingLoading));

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/my');
  };

  const openProfile = (targetUserId: string) => {
    if (
      targetUserId === CURRENT_USER_ID ||
      (currentUserId != null && targetUserId === currentUserId)
    ) {
      router.push('/(tabs)/my');
      return;
    }

    router.push(`/profile/${targetUserId}`);
  };

  return (
    <ScreenLayout
      header={<AppHeader title={title} subtitle={owner?.displayName} onBack={handleBack} />}
      contentContainerStyle={styles.content}>
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="bodySmall" style={styles.emptyText}>
            {mode === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로잉한 사용자가 없습니다.'}
          </AppText>
        </View>
      ) : (
        users.map((user) => (
          <FollowUserRow key={user.id} user={user} onPress={() => openProfile(user.id)} />
        ))
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: colors.textSecondary,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    color: colors.textSecondary,
  },
});
