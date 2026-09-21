import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppHeader, AppText } from '@/src/components/ui';
import { colors, layout, spacing } from '@/src/constants';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import { ProfileGalleryGrid } from '@/src/features/profile/components/ProfileGalleryGrid';
import { ProfilePhotoFeedViewer } from '@/src/features/profile/components/ProfilePhotoFeedViewer';
import { ProfileStatsRow } from '@/src/features/profile/components/ProfileStatsRow';
import { useGalleryRemote } from '@/src/features/profile/hooks/useGalleryRemote';
import { useProfileRemote } from '@/src/features/profile/hooks/useProfileRemote';
import type { ProfileGalleryImage } from '@/src/features/profile/types';
import { useProfileStore } from '@/src/features/profile/stores/profile-store';
import { FollowButton } from '@/src/features/social/components/FollowButton';
import { CURRENT_USER_ID } from '@/src/features/social/constants';
import { useFollowStatsRemote } from '@/src/features/social/hooks/useFollowRemote';
import { getSocialUser, getUserGallery } from '@/src/features/social/mock-users';
import { useFollowStore } from '@/src/features/social/stores/follow-store';
import { isMockSocialUserId } from '@/src/features/social/utils/social-user-id';
import { useCurrentSocialUserId } from '@/src/hooks/useCurrentSocialUserId';
import { useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';

export default function UserProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string | string[] }>();
  const resolvedUserId = Array.isArray(userId) ? userId[0] : userId;

  const { isRemoteSocialEnabled } = useSupabaseAuth();
  const { userId: currentUserId } = useCurrentSocialUserId();

  const isMockUser = !resolvedUserId || isMockSocialUserId(resolvedUserId);
  const useRemote = isRemoteSocialEnabled && !isMockUser;

  const mockUser = resolvedUserId ? getSocialUser(resolvedUserId) : null;
  const { data: remoteUser, isLoading: isProfileLoading } = useProfileRemote(
    useRemote ? resolvedUserId : null,
  );
  const { data: remoteGallery, isLoading: isGalleryLoading } = useGalleryRemote(
    useRemote ? resolvedUserId : null,
  );
  const { data: remoteFollowStats } = useFollowStatsRemote(useRemote ? resolvedUserId : null);

  const user = useRemote ? remoteUser : mockUser;
  const galleryImages = useMemo(() => {
    if (useRemote) {
      return remoteGallery ?? [];
    }

    return resolvedUserId ? getUserGallery(resolvedUserId) : [];
  }, [remoteGallery, resolvedUserId, useRemote]);

  const followingIds = useFollowStore((state) => state.followingIds);
  const isFollowingTarget = useFollowStore((state) =>
    resolvedUserId ? state.followingIds.has(resolvedUserId) : false,
  );
  const currentUserName = useProfileStore((state) => state.profile.displayName);

  const [viewerState, setViewerState] = useState<{ index: number } | null>(null);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/buddy');
  }, [router]);

  const openImage = useCallback((_: ProfileGalleryImage, index: number) => {
    setViewerState({ index });
  }, []);

  const isLoading = useRemote && (isProfileLoading || isGalleryLoading);

  const stats = useMemo(() => {
    if (!user) {
      return { posts: 0, followers: 0, following: 0 };
    }

    if (remoteFollowStats) {
      return {
        posts: remoteFollowStats.postCount,
        followers: remoteFollowStats.followerCount,
        following: remoteFollowStats.followingCount,
      };
    }

    const followStore = useFollowStore.getState();
    return {
      posts: galleryImages.length,
      followers: followStore.getFollowerCount(user.id),
      following: followStore.getFollowingCount(user.id),
    };
  }, [galleryImages.length, user, followingIds, isFollowingTarget, remoteFollowStats]);

  if (isLoading) {
    return (
      <ScreenLayout
        header={<AppHeader title="프로필" onBack={handleBack} />}
        contentContainerStyle={styles.content}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!user) {
    return (
      <ScreenLayout
        header={<AppHeader title="프로필" onBack={handleBack} />}
        contentContainerStyle={styles.content}>
        <View style={styles.notFound}>
          <AppText variant="h3">프로필을 찾을 수 없습니다</AppText>
        </View>
      </ScreenLayout>
    );
  }

  const isSelf =
    user.id === CURRENT_USER_ID ||
    (currentUserId != null && user.id === currentUserId);

  return (
    <ScreenLayout
      header={<AppHeader title={user.displayName} onBack={handleBack} />}
      contentContainerStyle={styles.content}
      contentTopSpacing={spacing.md}>
      <View style={styles.profileSection}>
        <View style={styles.profileRow}>
          <ProfileAvatar imageUrl={user.profileImageUrl} size={88} />
          <View style={styles.identityBlock}>
            <AppText variant="h2" style={styles.name}>
              {user.displayName}
            </AppText>
            <AppText variant="bodySmall" style={styles.meta}>
              {`${user.certificationLabel} · ${user.region}`}
            </AppText>
            {user.bio ? (
              <AppText variant="bodySmall" style={styles.bio}>
                {user.bio}
              </AppText>
            ) : null}
          </View>
        </View>

        {!isSelf ? (
          <View style={styles.followRow}>
            <FollowButton userId={user.id} />
          </View>
        ) : null}
      </View>

      <ProfileStatsRow
        postCount={stats.posts}
        followerCount={stats.followers}
        followingCount={stats.following}
        onFollowersPress={() =>
          router.push({ pathname: '/(tabs)/my/followers', params: { userId: user.id } })
        }
        onFollowingPress={() =>
          router.push({ pathname: '/(tabs)/my/following', params: { userId: user.id } })
        }
      />

      <ProfileGalleryGrid
        images={galleryImages}
        showAddButton={false}
        onImagePress={openImage}
      />

      <ProfilePhotoFeedViewer
        images={galleryImages}
        initialIndex={viewerState?.index ?? 0}
        visible={viewerState != null}
        ownerDisplayName={user.displayName}
        commentAuthorDisplayName={currentUserName}
        onClose={() => setViewerState(null)}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    gap: 0,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  notFound: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  profileSection: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  identityBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
  },
  meta: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  bio: {
    color: colors.textPrimary,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  followRow: {
    alignItems: 'flex-start',
  },
});
