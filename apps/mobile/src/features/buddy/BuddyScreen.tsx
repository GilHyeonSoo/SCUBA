import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';

import { FadeInView } from '@/src/components/motion';
import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import {
  AppBadge,
  AppCard,
  AppChip,
  AppHeader,
  AppText,
  SectionHeader,
} from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';

const mockBuddies = [
  {
    id: '1',
    nickname: 'Diver Kim',
    cert: 'AOW',
    dives: 63,
    region: '동해 / 제주',
    status: '이번 주말 강릉 버디 찾는 중',
  },
  {
    id: '2',
    nickname: 'BlueFin',
    cert: 'OW',
    dives: 28,
    region: '서울 / 인천',
    status: '펀다이빙 동행 가능',
  },
];

export default function BuddyScreen() {
  const router = useRouter();

  const goHome = useCallback(() => {
    router.replace('/(tabs)');
  }, [router]);

  const handleBackPress = useCallback(() => {
    goHome();
    return true;
  }, [goHome]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [handleBackPress]),
  );

  return (
    <ScreenLayout
      withTabBarInset={false}
      header={
        <AppHeader
          title="버디"
          subtitle="주변 다이버를 찾고 함께 다이빙을 계획하세요"
          onBack={goHome}
        />
      }
      contentContainerStyle={styles.content}>
      <FadeInView index={0}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}>
          {['5km', '10km', '30km', '스쿠버', '프리다이빙'].map((label, index) => (
            <AppChip key={label} label={label} selected={index === 1} />
          ))}
        </ScrollView>
      </FadeInView>

      <FadeInView index={1}>
        <AppCard variant="soft" style={styles.mapPlaceholder}>
          <View style={styles.mapIconWrap}>
            <Ionicons name="globe-outline" size={28} color={colors.primary} />
          </View>
          <AppText variant="h3">버디 지도</AppText>
          <AppText variant="bodySmall" style={styles.mapHint}>
            정확한 위치 대신 약 1km 범위로 표시됩니다. 승인된 버디에게만 상세
            위치가 공유됩니다.
          </AppText>
        </AppCard>
      </FadeInView>

      <FadeInView index={2}>
        <SectionHeader eyebrow="BUDDY" title="주변 다이버" />
        {mockBuddies.map((buddy, index) => (
          <AppCard
            key={buddy.id}
            pressable
            elevated
            style={[styles.buddyCard, index > 0 && styles.buddySpacing]}>
            <View style={styles.buddyHeader}>
              <View style={styles.avatar}>
                <AppText variant="label" color="primary">
                  {buddy.nickname.charAt(0)}
                </AppText>
              </View>
              <View style={styles.buddyInfo}>
                <AppText variant="h3">{buddy.nickname}</AppText>
                <AppText variant="bodySmall">활동지역 · {buddy.region}</AppText>
              </View>
              <AppBadge label={`${buddy.cert} · ${buddy.dives}`} tone="primary" />
            </View>
            <AppText variant="bodySmall" style={styles.status}>
              {buddy.status}
            </AppText>
          </AppCard>
        ))}
      </FadeInView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  mapPlaceholder: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryMuted,
  },
  mapIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHint: {
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    color: colors.textSecondary,
  },
  buddyCard: {
    gap: spacing.sm,
  },
  buddySpacing: {
    marginTop: spacing.md,
  },
  buddyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buddyInfo: {
    flex: 1,
    gap: 2,
  },
  status: {
    color: colors.primary,
    fontWeight: '500',
    paddingLeft: 56,
  },
});
