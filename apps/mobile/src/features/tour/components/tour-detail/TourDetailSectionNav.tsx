import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { TOUR_DETAIL_NAV_ITEMS, TOUR_DETAIL_STICKY_NAV_HEIGHT } from '@/src/features/tour/constants/tour-detail-nav';
import type { TourDetailNavSection } from '@/src/features/tour/types/tour-meeting-detail';

type TourDetailSectionNavProps = {
  activeSection: TourDetailNavSection;
  onSelect: (section: TourDetailNavSection) => void;
};

export function TourDetailSectionNav({ activeSection, onSelect }: TourDetailSectionNavProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}>
        {TOUR_DETAIL_NAV_ITEMS.map((item) => {
          const selected = item.id === activeSection;

          return (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => onSelect(item.id)}
              style={({ pressed }) => [
                styles.tab,
                selected && styles.tabSelected,
                pressed && styles.tabPressed,
              ]}>
              <AppText
                variant="label"
                numberOfLines={1}
                style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: TOUR_DETAIL_STICKY_NAV_HEIGHT,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  scrollContent: {
    paddingLeft: spacing['3xl'],
    paddingRight: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    flexGrow: 1,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  tabSelected: {
    backgroundColor: colors.primarySoft,
  },
  tabPressed: {
    opacity: 0.75,
  },
  tabLabel: {
    color: colors.textTertiary,
    fontWeight: '600',
  },
  tabLabelSelected: {
    color: colors.primaryStrong,
  },
});
