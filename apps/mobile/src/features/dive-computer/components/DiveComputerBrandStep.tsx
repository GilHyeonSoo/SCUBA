import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { mockDiveComputerService } from '@/src/features/dive-computer/services/mock-dive-computer.service';
import { SUPPORTED_DIVE_BRANDS } from '@/src/features/dive-log/import/supported-brands';

type DiveComputerBrandStepProps = {
  onSelectBrand: (brandId: string) => void;
};

export function DiveComputerBrandStep({ onSelectBrand }: DiveComputerBrandStepProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <View style={styles.intro}>
        <AppText variant="h2">제조사를 선택해 주세요</AppText>
        <AppText variant="bodySmall" style={styles.introText}>
          선택한 제조사의 모의 다이브 컴퓨터를 검색합니다.
        </AppText>
      </View>

      <View style={styles.list}>
        {SUPPORTED_DIVE_BRANDS.map((brand) => {
          const deviceCount = mockDiveComputerService.listDevices(brand.id).length;

          return (
            <Pressable
              key={brand.id}
              accessibilityRole="button"
              accessibilityLabel={`${brand.name} 선택`}
              onPress={() => onSelectBrand(brand.id)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
              <View style={styles.iconWrap}>
                <Ionicons name="watch-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <AppText variant="h3">{brand.name}</AppText>
                <AppText variant="caption" style={styles.meta}>
                  모의 기기 {deviceCount}대
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  intro: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  introText: {
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  meta: {
    color: colors.textTertiary,
  },
});
