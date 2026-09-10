import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import type { MeetingDraft } from '@/src/features/tour/types';
import {
  getWizardStepLabel,
  getWizardStepSummary,
  type MeetingWizardStepId,
} from '@/src/features/tour/components/meeting-create/meeting-create-steps';

type WizardCompletedStepProps = {
  stepId: MeetingWizardStepId | 'category';
  draft: MeetingDraft;
  categoryLabel?: string;
};

export function WizardCompletedStep({
  stepId,
  draft,
  categoryLabel,
}: WizardCompletedStepProps) {
  const label = stepId === 'category' ? '카테고리' : getWizardStepLabel(stepId);
  const value =
    stepId === 'category'
      ? categoryLabel ?? ''
      : getWizardStepSummary(draft, stepId as MeetingWizardStepId);

  return (
    <View style={styles.row}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <AppText variant="body" style={styles.value} numberOfLines={2}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  label: {
    color: colors.textTertiary,
    fontWeight: '600',
  },
  value: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
