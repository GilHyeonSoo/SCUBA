import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { FadeInView } from '@/src/components/motion';
import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppCard, AppChip, AppHeader, AppText, SectionHeader } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';

const exploreCategories = [
  { id: 'sites', label: '다이빙 포인트', icon: 'location-outline' as const, desc: '국내·해외 포인트' },
  { id: 'pools', label: '잠수풀', icon: 'water-outline' as const, desc: '연습·체험 다이빙' },
  { id: 'shops', label: '다이브 샵', icon: 'storefront-outline' as const, desc: '렌탈·교육·정비' },
  { id: 'tours', label: '투어', icon: 'boat-outline' as const, desc: '보트·투어 일정' },
];

export default function ExploreScreen() {
  return (
    <ScreenLayout
      header={
        <AppHeader title="탐색" subtitle="지도와 목록으로 다이빙 장소를 찾아보세요" />
      }
      contentContainerStyle={styles.content}>
      <FadeInView index={0}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}>
          {['전체', '잠수풀', '포인트', '샵', '투어'].map((label, index) => (
            <AppChip key={label} label={label} selected={index === 0} />
          ))}
        </ScrollView>
      </FadeInView>

      <FadeInView index={1}>
        <AppCard variant="soft" style={styles.mapPlaceholder}>
          <View style={styles.mapIconWrap}>
            <Ionicons name="map-outline" size={28} color={colors.primary} />
          </View>
          <AppText variant="h3" style={styles.placeholderTitle}>
            지도 준비 중
          </AppText>
          <AppText variant="bodySmall" style={styles.placeholderText}>
            Mapbox 연동 후 버디, 잠수풀, 포인트, 투어 레이어를 표시합니다.
          </AppText>
        </AppCard>
      </FadeInView>

      <FadeInView index={2}>
        <SectionHeader eyebrow="EXPLORE" title="카테고리" />
        <View style={styles.grid}>
          {exploreCategories.map((category) => (
            <AppCard key={category.id} pressable elevated style={styles.gridItem}>
              <View style={styles.gridIcon}>
                <Ionicons name={category.icon} size={22} color={colors.primary} />
              </View>
              <AppText variant="label">{category.label}</AppText>
              <AppText variant="caption">{category.desc}</AppText>
            </AppCard>
          ))}
        </View>
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
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
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
  placeholderTitle: {
    marginTop: spacing.sm,
  },
  placeholderText: {
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    width: '47%',
    gap: spacing.xs,
    minHeight: 120,
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});
