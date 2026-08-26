import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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
import {
  GearItem,
  gearCategoryFilters,
  mockGearItems,
} from '@/src/features/gear/mock-data';

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
};

function GearListItem({ item }: { item: GearItem }) {
  const iconName = categoryIconMap[item.category] ?? 'construct-outline';

  return (
    <AppCard pressable elevated style={styles.gearCard}>
      <View style={styles.gearTopRow}>
        <View style={styles.gearIconWrap}>
          <Ionicons name={iconName} size={22} color={colors.primary} />
        </View>
        <View style={styles.gearMain}>
          <AppText variant="h3">{item.manufacturer} {item.model}</AppText>
          <AppText variant="bodySmall">{item.category}</AppText>
        </View>
        <AppBadge label={statusLabelMap[item.maintenanceStatus]} tone={statusToneMap[item.maintenanceStatus]} />
      </View>

      <View style={styles.gearMetaRow}>
        <View style={styles.metaItem}>
          <AppText variant="caption">다이브 수</AppText>
          <AppText variant="label" color="primary">{item.diveCount}회</AppText>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <AppText variant="caption">최근 점검</AppText>
          <AppText variant="label">{item.lastServiceDate}</AppText>
        </View>
      </View>

      <AppText variant="bodySmall" style={styles.maintenanceText}>
        {item.maintenanceMessage}
      </AppText>
    </AppCard>
  );
}

export default function GearScreen() {
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const filteredGear = useMemo(() => {
    if (selectedCategory === '전체') return mockGearItems;
    return mockGearItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const dueCount = mockGearItems.filter((item) => item.maintenanceStatus !== 'ok').length;

  return (
    <ScreenLayout
      header={<AppHeader title="내 장비" subtitle="등록 장비와 정비 주기를 관리하세요" />}
      contentContainerStyle={styles.content}>
      <FadeInView index={0}>
        <AppButton label="장비 등록" size="lg" fullWidth />
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

      <FadeInView index={2}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}>
          {gearCategoryFilters.map((label) => (
            <AppChip
              key={label}
              label={label}
              selected={selectedCategory === label}
              onPress={() => setSelectedCategory(label)}
            />
          ))}
        </ScrollView>
      </FadeInView>

      <FadeInView index={3}>
        <SectionHeader eyebrow="GEAR" title={`등록 장비 ${filteredGear.length}개`} compact />
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
              첫 장비를 등록하고 정비 주기를 관리해 보세요.
            </AppText>
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
