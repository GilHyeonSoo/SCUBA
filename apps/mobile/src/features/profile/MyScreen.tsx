import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { FadeInView } from '@/src/components/motion';
import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppCard, AppText, SectionHeader } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { DiverLevelBadge } from '@/src/features/profile/components/DiverLevelBadge';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import { useProfileStore } from '@/src/features/profile/stores/profile-store';
import { getProfileLevelBadges } from '@/src/features/profile/utils';

const menuItems = [
  {
    id: 'profile',
    label: '다이버 프로필',
    icon: 'person-outline' as const,
    route: '/(tabs)/my/profile' as const,
  },
  {
    id: 'gear',
    label: '내 장비',
    icon: 'construct-outline' as const,
    route: '/(tabs)/my/gear' as const,
  },
  { id: 'certs', label: '자격증', icon: 'ribbon-outline' as const, route: null },
  { id: 'settings', label: '설정', icon: 'settings-outline' as const, route: null },
];

export default function MyScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const levelBadges = getProfileLevelBadges(profile);

  return (
    <ScreenLayout contentContainerStyle={styles.content}>
      <FadeInView index={0}>
        <AppCard
          elevated
          pressable
          onPress={() => router.push('/(tabs)/my/profile')}
          style={styles.profileCard}>
          <ProfileAvatar imageUrl={profile.profileImageUrl} size={76} />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <AppText variant="h2" style={styles.name}>
                {profile.displayName}
              </AppText>
              {levelBadges.map((badge) => (
                <DiverLevelBadge key={badge.key} badge={badge} />
              ))}
            </View>
            <AppText variant="bodySmall" style={styles.bio}>
              {profile.bio}
            </AppText>
            <AppText variant="caption" style={styles.diveCount}>
              {`${profile.totalDives} dives`}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </AppCard>
      </FadeInView>

      <FadeInView index={1}>
        <SectionHeader title="My" subtitle="메뉴" />
        {menuItems.map((item, index) => (
          <AppCard
            key={item.id}
            pressable
            onPress={item.route ? () => router.push(item.route) : undefined}
            style={[styles.menuItem, index > 0 && styles.menuSpacing]}>
            <View style={styles.menuRow}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <AppText variant="body" style={styles.menuLabel}>
                {item.label}
              </AppText>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </View>
          </AppCard>
        ))}
      </FadeInView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  profileCard: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
  },
  bio: {
    color: colors.textSecondary,
  },
  diveCount: {
    color: colors.textTertiary,
    fontWeight: '600',
  },
  menuItem: {
    paddingVertical: spacing.md,
  },
  menuSpacing: {
    marginTop: spacing.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
  },
});
