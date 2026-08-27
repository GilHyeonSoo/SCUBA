import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { FadeInView } from '@/src/components/motion';
import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppChip,
  AppHeader,
  AppText,
  SectionHeader,
} from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { useGearStore } from '@/src/features/gear/stores/gear-store';
import type { RegisteredGearItem } from '@/src/features/gear/types';
import { formatGearPrice } from '@/src/features/gear/utils/format-price';

const statusToneMap = {
  ok: 'success' as const,
  upcoming: 'warning' as const,
  due: 'warning' as const,
};

const statusLabelMap = {
  ok: '양호',
  upcoming: '점검 임박',
  due: '점검 예정',
};

const categoryIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  레귤레이터: 'fitness-outline',
  BCD: 'shirt-outline',
  '다이빙 컴퓨터': 'watch-outline',
  웻슈트: 'body-outline',
  마스크: 'glasses-outline',
  핀: 'footsteps-outline',
};

function GearListItem({ item }: { item: RegisteredGearItem }) {
  const iconName = categoryIconMap[item.category] ?? 'construct-outline';

  return (
    <AppCard pressable elevated style={styles.gearCard}>
      <View style={styles.gearTopRow}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.gearImage} resizeMode="cover" />
        ) : (
          <View style={styles.gearIconWrap}>
            <Ionicons name={iconName} size={22} color={colors.primary} />
          </View>
        )}
        <View style={styles.gearMain}>
          <AppText variant="h3" numberOfLines={2}>
            {item.brandName} {item.title}
          </AppText>
          <AppText variant="bodySmall">
            {item.category} · {item.diveType === 'scuba' ? '스킨스쿠버' : '프리다이빙'}
          </AppText>
          {item.price !== null ? (
            <AppText variant="caption" color="primary">
              등록 시 가격 {formatGearPrice(item.price, item.currency)}
            </AppText>
          ) : null}
        </View>
        <AppBadge label={statusLabelMap[item.maintenanceStatus]} tone={statusToneMap[item.maintenanceStatus]} />
      </View>

      <View style={styles.gearMetaRow}>
        <View style={styles.metaItem}>
          <AppText variant="caption">다이브 수</AppText>
          <AppText variant="label" color="primary">
            {item.diveCount}회
          </AppText>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <AppText variant="caption">최근 점검</AppText>
          <AppText variant="label">{item.lastServiceDate ?? '미등록'}</AppText>
        </View>
      </View>

      <AppText variant="bodySmall" style={styles.maintenanceText}>
        {item.maintenanceMessage}
      </AppText>
    </AppCard>
  );
}

export default function GearScreen() {
  const router = useRouter();
  const registeredGear = useGearStore((state) => state.registeredGear);
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const categoryFilters = useMemo(() => {
    const categories = Array.from(new Set(registeredGear.map((item) => item.category)));
    return ['전체', ...categories];
  }, [registeredGear]);

  const filteredGear = useMemo(() => {
    if (selectedCategory === '전체') return registeredGear;
    return registeredGear.filter((item) => item.category === selectedCategory);
  }, [registeredGear, selectedCategory]);

  const dueCount = registeredGear.filter((item) => item.maintenanceStatus !== 'ok').length;

  return (
    <ScreenLayout
      header={<AppHeader title="내 장비" subtitle="등록 장비와 정비 주기를 관리하세요" />}
      contentContainerStyle={styles.content}>
      <FadeInView index={0}>
        <AppButton
          label="장비 등록"
          size="lg"
          fullWidth
          onPress={() => router.push('/gear/register')}
        />
      </FadeInView>

      {dueCount > 0 ? (
        <FadeInView index={1}>
          <AppCard variant="soft" style={styles.alertCard}>
            <View style={styles.alertRow}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
              <AppText variant="bodySmall" style={styles.alertText}>
                점검이 필요한 장비 {dueCount}개가 있습니다.
              </AppText>
            </View>
          </AppCard>
        </FadeInView>
      ) : null}

      {categoryFilters.length > 1 ? (
        <FadeInView index={2}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            {categoryFilters.map((label) => (
              <AppChip
                key={label}
                label={label}
                selected={selectedCategory === label}
                onPress={() => setSelectedCategory(label)}
              />
            ))}
          </ScrollView>
        </FadeInView>
      ) : null}

      <FadeInView index={3}>
        <SectionHeader title="Gear" subtitle={`등록 장비 ${filteredGear.length}개`} compact />
        {filteredGear.length > 0 ? (
          filteredGear.map((item, index) => (
            <View key={item.id} style={index > 0 ? styles.gearSpacing : undefined}>
              <GearListItem item={item} />
            </View>
          ))
        ) : (
          <AppCard variant="soft" style={styles.emptyCard}>
            <AppText variant="h3">등록된 장비가 없습니다</AppText>
            <AppText variant="bodySmall" style={styles.emptyText}>
              카탈로그에서 장비를 선택해 첫 장비를 등록해 보세요.
            </AppText>
            <AppButton
              label="장비 등록하기"
              variant="secondary"
              onPress={() => router.push('/gear/register')}
            />
          </AppCard>
        )}
      </FadeInView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  alertCard: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warningSoft,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertText: {
    flex: 1,
    color: colors.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  gearCard: {
    gap: spacing.md,
  },
  gearSpacing: {
    marginTop: spacing.md,
  },
  gearTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  gearImage: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  gearIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearMain: {
    flex: 1,
    gap: 2,
  },
  gearMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  metaItem: {
    flex: 1,
    gap: spacing.xs,
    alignItems: 'center',
  },
  metaDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.divider,
  },
  maintenanceText: {
    color: colors.textSecondary,
  },
  emptyCard: {
    gap: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
