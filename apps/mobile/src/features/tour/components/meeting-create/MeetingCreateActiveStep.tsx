import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppChip, AppInput, AppText } from '@/src/components/ui';
import { spacing } from '@/src/constants';
import { MeetingCalendarPicker, type MeetingDateRange } from '@/src/features/tour/components/meeting-create/MeetingCalendarPicker';
import { MeetingTimePicker } from '@/src/features/tour/components/meeting-create/MeetingTimePicker';
import { getWizardStepTitle } from '@/src/features/tour/components/meeting-create/meeting-create-steps';
import {
  equipmentRentalOptions,
  getMeetingPurposeOptions,
  meetingEnvironmentLabels,
} from '@/src/features/tour/constants';
import type { MeetingDraft, MeetingEnvironment } from '@/src/features/tour/types';
import {
  formatDraftDate,
  formatDraftTime,
  parseDraftDate,
  parseDraftTime,
} from '@/src/features/tour/utils';
import type { MeetingWizardStepId } from '@/src/features/tour/components/meeting-create/meeting-create-steps';

const environmentOptions: Array<{ value: MeetingEnvironment; label: string }> = [
  { value: 'pool', label: meetingEnvironmentLabels.pool },
  { value: 'sea', label: meetingEnvironmentLabels.sea },
];

type MeetingCreateActiveStepProps = {
  stepId: MeetingWizardStepId;
  draft: MeetingDraft;
  onComplete: (patch: Partial<MeetingDraft>) => void;
};

export function MeetingCreateActiveStep({
  stepId,
  draft,
  onComplete,
}: MeetingCreateActiveStepProps) {
  const title = getWizardStepTitle(stepId);

  switch (stepId) {
    case 'environment':
      return (
        <StepShell title={title}>
          <View style={styles.chipWrap}>
            {environmentOptions.map((option) => (
              <AppChip
                key={option.value}
                label={option.label}
                selected={draft.environment === option.value}
                onPress={() => onComplete({ environment: option.value })}
              />
            ))}
          </View>
        </StepShell>
      );
    case 'date':
      return <DateStep title={title} draft={draft} onComplete={onComplete} />;
    case 'time':
      return <TimeStep title={title} draft={draft} onComplete={onComplete} />;
    case 'location':
      return <LocationStep title={title} draft={draft} onComplete={onComplete} />;
    case 'cost':
      return <CostStep title={title} draft={draft} onComplete={onComplete} />;
    case 'purpose':
      return (
        <StepShell title={title}>
          <View style={styles.chipWrap}>
            {getMeetingPurposeOptions(draft.category).map((option) => (
              <AppChip
                key={option.value}
                label={option.label}
                selected={draft.purpose === option.value}
                onPress={() => onComplete({ purpose: option.value })}
              />
            ))}
          </View>
        </StepShell>
      );
    case 'equipmentRental':
      return (
        <StepShell title={title}>
          <View style={styles.chipWrap}>
            {equipmentRentalOptions.map((option) => (
              <AppChip
                key={option.value}
                label={option.label}
                selected={draft.equipmentRental === option.value}
                onPress={() => onComplete({ equipmentRental: option.value })}
              />
            ))}
          </View>
        </StepShell>
      );
    case 'maxParticipants':
      return <MaxParticipantsStep title={title} draft={draft} onComplete={onComplete} />;
    default:
      return null;
  }
}

type StepShellProps = {
  title: string;
  children: ReactNode;
};

function StepShell({ title, children }: StepShellProps) {
  return (
    <View style={styles.shell}>
      <AppText variant="h3" style={styles.title}>{title}</AppText>
      {children}
    </View>
  );
}

type DateStepProps = {
  title: string;
  draft: MeetingDraft;
  onComplete: (patch: Partial<MeetingDraft>) => void;
};

function DateStep({ title, draft, onComplete }: DateStepProps) {
  const initialRange = useMemo<MeetingDateRange>(() => {
    const startDate = draft.date ? parseDraftDate(draft.date) : null;
    const endDate = draft.endDate ? parseDraftDate(draft.endDate) : null;

    return { startDate, endDate };
  }, [draft.date, draft.endDate]);
  const [selectedRange, setSelectedRange] = useState<MeetingDateRange>(initialRange);

  const canConfirm = Boolean(selectedRange.startDate && selectedRange.endDate);

  const handleConfirm = () => {
    if (!selectedRange.startDate || !selectedRange.endDate) {
      return;
    }

    onComplete({
      date: formatDraftDate(selectedRange.startDate),
      endDate: formatDraftDate(selectedRange.endDate),
    });
  };

  return (
    <StepShell title={title}>
      <View style={styles.pickerSection}>
        <MeetingCalendarPicker value={selectedRange} onChange={setSelectedRange} />
        <AppButton label="확인" onPress={handleConfirm} fullWidth disabled={!canConfirm} />
      </View>
    </StepShell>
  );
}

type TimeStepProps = {
  title: string;
  draft: MeetingDraft;
  onComplete: (patch: Partial<MeetingDraft>) => void;
};

function TimeStep({ title, draft, onComplete }: TimeStepProps) {
  const baseDate = useMemo(() => parseDraftDate(draft.date), [draft.date]);
  const initialTime = useMemo(
    () => parseDraftTime(draft.time, baseDate),
    [baseDate, draft.time],
  );
  const [selectedTime, setSelectedTime] = useState(initialTime);

  const handleConfirm = () => {
    onComplete({ time: formatDraftTime(selectedTime) });
  };

  return (
    <StepShell title={title}>
      <View style={styles.pickerSection}>
        <MeetingTimePicker value={selectedTime} onChange={setSelectedTime} />
        <AppButton label="확인" onPress={handleConfirm} fullWidth />
      </View>
    </StepShell>
  );
}

type LocationStepProps = {
  title: string;
  draft: MeetingDraft;
  onComplete: (patch: Partial<MeetingDraft>) => void;
};

function LocationStep({ title, draft, onComplete }: LocationStepProps) {
  const [location, setLocation] = useState(draft.location);
  const canContinue = location.trim().length >= 2;

  return (
    <StepShell title={title}>
      <AppInput
        value={location}
        onChangeText={setLocation}
        placeholder="모임 장소를 입력하세요"
        autoFocus
      />
      <AppButton
        label="확인"
        fullWidth
        disabled={!canContinue}
        onPress={() => onComplete({ location: location.trim() })}
      />
    </StepShell>
  );
}

type CostStepProps = {
  title: string;
  draft: MeetingDraft;
  onComplete: (patch: Partial<MeetingDraft>) => void;
};

function CostStep({ title, draft, onComplete }: CostStepProps) {
  const [isFree, setIsFree] = useState(draft.isFree);
  const [cost, setCost] = useState(draft.cost);

  const handleFree = () => {
    onComplete({ isFree: true, cost: '' });
  };

  const handlePaidConfirm = () => {
    const amount = Number(cost);
    if (!Number.isFinite(amount) || amount < 0) {
      return;
    }

    onComplete({ isFree: false, cost: String(amount) });
  };

  return (
    <StepShell title={title}>
      <View style={styles.chipWrap}>
        <AppChip label="무료" selected={isFree} onPress={() => setIsFree(true)} />
        <AppChip label="유료" selected={!isFree} onPress={() => setIsFree(false)} />
      </View>

      {isFree ? (
        <AppButton label="확인" fullWidth onPress={handleFree} />
      ) : (
        <>
          <AppInput
            value={cost}
            onChangeText={setCost}
            placeholder="참가비 (원)"
            keyboardType="number-pad"
          />
          <AppButton
            label="확인"
            fullWidth
            disabled={!Number.isFinite(Number(cost)) || Number(cost) < 0}
            onPress={handlePaidConfirm}
          />
        </>
      )}
    </StepShell>
  );
}

type MaxParticipantsStepProps = {
  title: string;
  draft: MeetingDraft;
  onComplete: (patch: Partial<MeetingDraft>) => void;
};

function MaxParticipantsStep({ title, draft, onComplete }: MaxParticipantsStepProps) {
  const [maxParticipants, setMaxParticipants] = useState(draft.maxParticipants);
  const count = Number(maxParticipants);
  const canContinue = Number.isInteger(count) && count >= 2;

  return (
    <StepShell title={title}>
      <AppInput
        value={maxParticipants}
        onChangeText={setMaxParticipants}
        placeholder="4"
        keyboardType="number-pad"
        maxLength={2}
      />
      <AppButton
        label="확인"
        fullWidth
        disabled={!canContinue}
        onPress={() => onComplete({ maxParticipants: String(count) })}
      />
    </StepShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: spacing.lg,
  },
  title: {
    lineHeight: 30,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pickerSection: {
    width: '100%',
    gap: spacing.lg,
  },
});
