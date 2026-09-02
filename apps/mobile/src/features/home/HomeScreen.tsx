import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { FadeInView, FloatingMarker, TypewriterText } from '@/src/components/motion';
import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppHeader,
  AppText,
  SectionHeader,
} from '@/src/components/ui';
import { colors, radius, shadows, spacing } from '@/src/constants';
import { HomeAdCarousel } from '@/src/features/home/components/HomeAdCarousel';
import { mockHomeData } from '@/src/features/home/mock-data';
import { useProfileStore } from '@/src/features/profile/stores/profile-store';
import { formatProfileGreeting } from '@/src/features/profile/utils';

const nextDiveHeroImage = require('@/assets/images/next-dive-turtle-crop.png');

export default function HomeScreen() {
  const data = mockHomeData;
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const greeting = formatProfileGreeting(profile.displayName);

  const openBuddy = () => router.push('/(tabs)/buddy');

  return (
    <ScreenLayout
      header={<AppHeader variant="brand" title="SCUBA" />}
      contentTopSpacing={spacing.lg}>
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
              <TypewriterText text={greeting} style={styles.greeting} />
              <View style={styles.locationRow}>
                <FloatingMarker />
                <AppText variant="caption" style={styles.locationText}>
                  {`${data.region}, ${data.country}`}
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </FadeInView>

      <FadeInView index={1}>
        <HomeAdCarousel banners={data.adBanners} style={styles.adCarousel} />
      </FadeInView>

      <FadeInView index={2}>
        <SectionHeader title="Upcoming" subtitle="다음 다이빙" action="일정 보기" compact />
        <View style={[styles.heroCard, shadows.lg]}>
          <LinearGradient
            colors={['#004E82', '#0077BF', '#3A9AD9']}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 0.9 }}
            style={StyleSheet.absoluteFill}
          />
          <Image
            source={nextDiveHeroImage}
            style={styles.heroTurtleArt}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          <LinearGradient
            colors={['rgba(4,38,74,0.92)', 'rgba(4,38,74,0.55)', 'transparent']}
            locations={[0, 0.52, 0.82]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroCardContent}>
            <View style={styles.heroCardTop}>
              <AppBadge label="스쿠버" tone="onDark" />
              <AppText variant="caption" style={styles.heroCardDate}>
                {data.nextDive.date}
              </AppText>
            </View>
            <AppText variant="h2" style={styles.heroCardTitle}>
              {data.nextDive.title}
            </AppText>
            <AppText variant="bodySmall" style={styles.heroCardSub}>
              {data.nextDive.location}
            </AppText>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaPill}>
                <Ionicons name="time-outline" size={14} color={colors.textOnPrimary} />
                <AppText variant="caption" style={styles.heroMetaText}>
                  {data.nextDive.time} 출발
                </AppText>
              </View>
              <View style={styles.heroMetaPill}>
                <Ionicons name="arrow-down-outline" size={14} color={colors.textOnPrimary} />
                <AppText variant="caption" style={styles.heroMetaText}>
                  20m 예상
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </FadeInView>

      <FadeInView index={3}>
        <SectionHeader title="Buddy" subtitle="주변 버디" />
        {data.nearbyBuddies.map((buddy, buddyIndex) => (
          <AppCard
            key={buddy.id}
            pressable
            elevated
            style={[styles.card, buddyIndex > 0 && styles.cardSpacing]}>
            <View style={styles.cardTopRow}>
              <View style={styles.avatarSmall}>
                <AppText variant="label" color="primary">
                  {buddy.nickname.charAt(0)}
                </AppText>
              </View>
              <View style={styles.cardMain}>
                <AppText variant="h3">{buddy.nickname}</AppText>
                <AppText variant="bodySmall">주 활동지역 · {buddy.region}</AppText>
              </View>
              <AppBadge label={`${buddy.certification}`} tone="primary" />
            </View>
            <AppText variant="bodySmall" style={styles.statusText}>
              {buddy.status}
            </AppText>
          </AppCard>
        ))}
        <AppButton
          label="버디 찾기"
          variant="secondary"
          fullWidth
          onPress={openBuddy}
          style={styles.buddyButton}
        />
      </FadeInView>

      <FadeInView index={4}>
        <SectionHeader title="Gear" subtitle="장비 점검" />
        {data.maintenance.map((item) => (
          <AppCard key={item.id} variant="soft" style={styles.card}>
            <View style={styles.cardTopRow}>
              <AppText variant="h3" style={styles.equipmentTitle}>
                {item.equipmentName}
              </AppText>
              <AppBadge label="점검 예정" tone="warning" />
            </View>
            <AppText variant="bodySmall">{item.message}</AppText>
          </AppCard>
        ))}
      </FadeInView>

      <FadeInView index={5}>
        <SectionHeader title="Log" subtitle="최근 다이빙" action="로그 보기" />
        <AppCard elevated style={styles.statsCard}>
          <AppText variant="h3">{data.recentDive.site}</AppText>
          <AppText variant="bodySmall">{data.recentDive.date}</AppText>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <AppText variant="caption">최대 수심</AppText>
              <AppText variant="h1" color="primary" style={styles.statValue}>
                {data.recentDive.maxDepth}
                <AppText variant="bodySmall" color="primary">m</AppText>
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <AppText variant="caption">다이빙 시간</AppText>
              <AppText variant="h1" color="primary" style={styles.statValue}>
                {data.recentDive.duration}
                <AppText variant="bodySmall" color="primary">분</AppText>
              </AppText>
            </View>
          </View>
        </AppCard>
      </FadeInView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  greetingSection: {
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  adCarousel: {
    marginTop: 0,
    marginBottom: spacing.lg,
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
    borderWidth: 2,
    borderColor: colors.primaryMuted,
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
    letterSpacing: -0.6,
    lineHeight: 36,
    fontSize: 26,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  heroCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 196,
    position: 'relative',
    justifyContent: 'center',
  },
  heroTurtleArt: {
    position: 'absolute',
    right: -spacing.xs,
    bottom: -spacing.md,
    width: '56%',
    height: '125%',
  },
  heroCardContent: {
    padding: spacing.xl,
    gap: spacing.sm,
    maxWidth: '64%',
    zIndex: 1,
  },
  heroCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroCardDate: {
    color: 'rgba(255,255,255,0.75)',
  },
  heroCardTitle: {
    color: colors.textOnPrimary,
    marginTop: spacing.sm,
    letterSpacing: -0.3,
  },
  heroCardSub: {
    color: 'rgba(255,255,255,0.8)',
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  heroMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  heroMetaText: {
    color: colors.textOnPrimary,
  },
  card: {
    gap: spacing.sm,
  },
  cardSpacing: {
    marginTop: spacing.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardMain: {
    flex: 1,
    gap: 2,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipmentTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  statusText: {
    marginTop: spacing.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  buddyButton: {
    marginTop: spacing.md,
  },
  statsCard: {
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  statBox: {
    flex: 1,
    gap: spacing.xs,
    alignItems: 'center',
  },
  statValue: {
    letterSpacing: -1,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.divider,
  },
});
