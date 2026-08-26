import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { FadeInView } from '@/src/components/motion';
import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppBadge, AppCard, AppHeader, AppText, SectionHeader } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { useAuthStore } from '@/src/stores/auth-store';

const menuItems = [
  { id: 'profile', label: '다이버 프로필', icon: 'person-outline' as const },
  { id: 'certs', label: '자격증', icon: 'ribbon-outline' as const },
  { id: 'settings', label: '설정', icon: 'settings-outline' as const },
];

export default function MyScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <ScreenLayout
      header={<AppHeader title="마이" subtitle="프로필, 자격증, 설정" />}
      contentContainerStyle={styles.content}>
      <FadeInView index={0}>
        <AppCard elevated style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <AppText variant="h2">다이버</AppText>
            <AppText variant="bodySmall">프로필을 완성하고 버디를 찾아보세요</AppText>
            <AppBadge label="AOW · 0 dives" tone="primary" />
          </View>
        </AppCard>
      </FadeInView>

      {!isAuthenticated ? (
        <FadeInView index={1}>
          <AppCard variant="soft" style={styles.authCard}>
            <AppText variant="h3">로그인이 필요합니다</AppText>
            <AppText variant="bodySmall">
              다이빙 로그, 장비 관리, 버디 매칭을 이용하려면 로그인하세요.
            </AppText>
            <View style={styles.authLinks}>
              <AppText
                variant="label"
                color="primary"
                onPress={() => router.push('/(auth)/login')}>
                로그인
              </AppText>
              <AppText variant="caption">·</AppText>
              <AppText
                variant="label"
                color="primary"
                onPress={() => router.push('/(auth)/signup')}>
                회원가입
              </AppText>
            </View>
            <AppText variant="caption" style={styles.authProviders}>
              카카오 · 네이버 · Apple · Google · 이메일
            </AppText>
          </AppCard>
        </FadeInView>
      ) : null}

      <FadeInView index={2}>
        <SectionHeader eyebrow="MY" title="메뉴" />
        {menuItems.map((item, index) => (
          <AppCard
            key={item.id}
            pressable
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
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryMuted,
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  authCard: {
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryMuted,
  },
  authLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  authProviders: {
    marginTop: spacing.xs,
    color: colors.textTertiary,
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
