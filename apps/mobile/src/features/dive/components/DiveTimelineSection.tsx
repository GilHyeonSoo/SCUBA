import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { DiveTimelineItem } from '@/src/features/dive/components/DiveTimelineItem';
import type { DiveMonthGroup } from '@/src/features/dive/utils/dive-ledger';

type DiveTimelineSectionProps = {
  groups: DiveMonthGroup[];
};

export function DiveTimelineSection({ groups }: DiveTimelineSectionProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {groups.map((group) => (
        <View key={group.monthKey} style={styles.monthBlock}>
          <AppText variant="label" style={styles.monthLabel}>
            {group.label}
          </AppText>
          <View style={styles.items}>
            {group.dives.map((dive, index) => (
              <DiveTimelineItem
                key={dive.id}
                dive={dive}
                isLast={index === group.dives.length - 1}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  monthBlock: {
    gap: spacing.sm,
  },
  monthLabel: {
    color: colors.textSecondary,
  },
  items: {
    gap: 0,
  },
});
