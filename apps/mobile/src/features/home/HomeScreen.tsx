import { Ionicons } from '@expo/vector-icons';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { FadeInView } from '@/src/components/motion';
import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppHeader, AppText } from '@/src/components/ui';
import { colors, layout, spacing } from '@/src/constants';
import { HomeAdCarousel } from '@/src/features/home/components/HomeAdCarousel';
import { HomeExpeditionRibbon } from '@/src/features/home/components/HomeExpeditionRibbon';
import { HomeLogInsightCard } from '@/src/features/home/components/HomeLogInsightCard';
import { HomeNextExpeditionCard } from '@/src/features/home/components/HomeNextExpeditionCard';
import { HomeOnThisDaySection } from '@/src/features/home/components/HomeOnThisDaySection';
import { HomeOverviewGrid } from '@/src/features/home/components/HomeOverviewGrid';
import { mockHomeData } from '@/src/features/home/mock-data';
import { createMockDiveProfile } from '@/src/features/home/utils/mock-dive-profile';
import { useProfileStore } from '@/src/features/profile/stores/profile-store';
import { formatProfileGreeting } from '@/src/features/profile/utils';

export default function HomeScreen() {
  const data = mockHomeData;
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const greeting = formatProfileGreeting(profile.displayName);

  const recentProfile = useMemo(
    () => createMockDiveProfile(data.recentDive.maxDepth, data.recentDive.duration),
    [data.recentDive.duration, data.recentDive.maxDepth],
  );

  const handlePreDiveChecklist = () => {
    Alert.alert('준비 중', '프리다이브 체크리스트는 곧 제공됩니다.');
  };

  return (
    <ScreenLayout
      header={<AppHeader variant="brand" title="SCUBA" />}
      headerShadow={false}
      contentTopSpacing={spacing['2xl']}
      contentContainerStyle={styles.screenContent}>
      <FadeInView index={0}>
        <View style={styles.greetingSection}>
          <View style={styles.greetingRow}>
            <View style={styles.avatar}>
              {profile.profileImageUrl ? (
                <Image source={{ uri: profile.profileImageUrl }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={28} color={colors.primary} />
              )}
            </View>
            <View style={styles.greetingTextBlock}>
              <AppText variant="sectionTitle" style={styles.greeting}>
                {greeting}
              </AppText>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
                <AppText variant="bodySmall" style={styles.locationText}>
                  {`${data.region}, ${data.country}`}
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </FadeInView>

      <FadeInView index={1}>
        <View style={styles.fullBleed}>
          <HomeAdCarousel banners={data.adBanners} edgeToEdge />
          <HomeExpeditionRibbon />
          <View style={styles.nextDiveStack}>
            <HomeNextExpeditionCard
              title={data.nextDive.title}
              location={data.nextDive.location}
              date={data.nextDive.date}
              time={data.nextDive.time}
              depthLabel="20m"
              gasLabel={data.nextDive.diveType === 'scuba' ? 'Air' : 'Freedive'}
              onPress={() => router.push('/(tabs)/dive')}
              onCtaPress={handlePreDiveChecklist}
            />
          </View>
        </View>
      </FadeInView>

      <FadeInView index={2}>
        <View style={[styles.fullBleed, styles.overviewSection]}>
          <HomeOverviewGrid
            tiles={[
              {
                id: 'recent-log',
                label: '최근 다이빙',
                value: String(data.recentDive.maxDepth),
                valueUnit: 'm',
                panel: {
                  type: 'recent',
                  site: data.recentDive.site,
                  date: data.recentDive.date,
                  maxDepth: data.recentDive.maxDepth,
                  durationMin: data.recentDive.duration,
                  waterTempC: 22,
                  profile: recentProfile,
                },
                onPress: () => router.push('/(tabs)/dive'),
              },
            ]}
          />
        </View>
      </FadeInView>

      <FadeInView index={3}>
        <View style={[styles.fullBleed, styles.insightSection]}>
          <HomeLogInsightCard
            insight={data.logInsight}
            onPress={() => router.push('/(tabs)/dive')}
          />
        </View>
      </FadeInView>

      <FadeInView index={4}>
        <View style={[styles.fullBleed, styles.memorySection]}>
          <HomeOnThisDaySection
            memory={data.onThisDay}
            onPress={() => router.push('/(tabs)/dive')}
          />
        </View>
      </FadeInView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    gap: 0,
  },
  greetingSection: {
    marginBottom: spacing.xl,
  },
  fullBleed: {
    marginHorizontal: -layout.screenPaddingHorizontal,
  },
  nextDiveStack: {
    gap: 0,
  },
  overviewSection: {
    marginTop: spacing.xs,
  },
  insightSection: {
    marginTop: spacing.sm,
  },
  memorySection: {
    marginTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  greetingTextBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  greeting: {
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    color: colors.textSecondary,
  },
});
