import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';

type ProfileStatsRowProps = {
  postCount: number;
  followerCount: number;
  followingCount: number;
  onPostsPress?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
};

type StatItemProps = {
  label: string;
  value: number;
  onPress?: () => void;
};

function StatItem({ label, value, onPress }: StatItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.stat, onPress && pressed && styles.statPressed]}>
      <AppText variant="h3" style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function ProfileStatsRow({
  postCount,
  followerCount,
  followingCount,
  onPostsPress,
  onFollowersPress,
  onFollowingPress,
}: ProfileStatsRowProps) {
  return (
    <View style={styles.row}>
      <StatItem label="게시물" value={postCount} onPress={onPostsPress} />
      <StatItem label="팔로워" value={followerCount} onPress={onFollowersPress} />
      <StatItem label="팔로잉" value={followingCount} onPress={onFollowingPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
  },
  statPressed: {
    opacity: 0.7,
  },
  value: {
    fontSize: 18,
    lineHeight: 24,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
