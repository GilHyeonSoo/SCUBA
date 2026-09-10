import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';

import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppButton, AppText } from '@/src/components/ui';
import { colors, layout, spacing } from '@/src/constants';
import { MeetingCreateActiveStep } from '@/src/features/tour/components/meeting-create/MeetingCreateActiveStep';
import { MeetingCreateCategoryPhase } from '@/src/features/tour/components/meeting-create/MeetingCreateCategoryPhase';
import {
  getWizardSteps,
  type MeetingCreatePhase,
  type MeetingWizardStepId,
} from '@/src/features/tour/components/meeting-create/meeting-create-steps';
import { WizardPageTransition } from '@/src/features/tour/components/meeting-create/WizardPageTransition';
import { getMeetingPurposeOptions } from '@/src/features/tour/constants';
import { useMeetingStore } from '@/src/features/tour/stores/meeting-store';
import type { MeetingCategory, MeetingDraft } from '@/src/features/tour/types';
import { meetingDraftToMeeting, validateMeetingDraft } from '@/src/features/tour/utils';
import { useProfileStore } from '@/src/features/profile/stores/profile-store';

const defaultDraft: MeetingDraft = {
  title: '',
  category: 'buddy',
  environment: 'pool',
  date: '',
  endDate: '',
  time: '',
  location: '',
  isFree: true,
  cost: '',
  purpose: 'fun',
  equipmentRental: 'unnecessary',
  maxParticipants: '4',
};

const PHASE_ENTERING = FadeIn.duration(320).easing(Easing.out(Easing.cubic));
const PHASE_EXITING = FadeOut.duration(220).easing(Easing.out(Easing.cubic));

type WizardTransitionDirection = 'forward' | 'back';

export default function MeetingCreateScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const addMeeting = useMeetingStore((state) => state.addMeeting);

  const [phase, setPhase] = useState<MeetingCreatePhase>('category');
  const [selectedCategory, setSelectedCategory] = useState<MeetingCategory | null>(null);
  const [draft, setDraft] = useState<MeetingDraft>(defaultDraft);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [transitionDirection, setTransitionDirection] =
    useState<WizardTransitionDirection>('forward');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const wizardSteps = useMemo(
    () => (selectedCategory ? getWizardSteps(selectedCategory) : []),
    [selectedCategory],
  );
  const activeStep: MeetingWizardStepId | null =
    currentStepIndex < wizardSteps.length ? wizardSteps[currentStepIndex] : null;
  const isWizardComplete =
    phase === 'details' && wizardSteps.length > 0 && currentStepIndex >= wizardSteps.length;

  const handleBack = useCallback(() => {
    if (phase === 'details') {
      if (isWizardComplete) {
        setTransitionDirection('back');
        setCurrentStepIndex(wizardSteps.length - 1);
        setError(null);
        return;
      }

      if (currentStepIndex > 0) {
        setTransitionDirection('back');
        setCurrentStepIndex((index) => index - 1);
        setError(null);
        return;
      }

      setPhase('category');
      setSelectedCategory(null);
      setCurrentStepIndex(0);
      setTransitionDirection('forward');
      setError(null);
      return;
    }

    router.back();
  }, [currentStepIndex, isWizardComplete, phase, router, wizardSteps.length]);

  const handleCategorySelect = useCallback((category: MeetingCategory) => {
    const purposeOptions = getMeetingPurposeOptions(category);
    setSelectedCategory(category);
    setDraft((current) => ({
      ...current,
      category,
      purpose: purposeOptions[0]?.value ?? current.purpose,
    }));
    setCurrentStepIndex(0);
    setTransitionDirection('forward');
    setPhase('details');
    setError(null);
  }, []);

  const handleStepComplete = useCallback((patch: Partial<MeetingDraft>) => {
    setError(null);
    setDraft((current) => ({ ...current, ...patch }));
    setTransitionDirection('forward');
    setCurrentStepIndex((index) => index + 1);
  }, []);

  const handleSave = () => {
    const validationError = validateMeetingDraft(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    const meeting = meetingDraftToMeeting(draft, {
      displayName: profile.displayName,
      profileImageUrl: profile.profileImageUrl,
    });
    addMeeting(meeting);
    setIsSaving(false);

    Alert.alert('모임 생성 완료', '모임이 등록되었습니다.', [
      {
        text: '확인',
        onPress: () => router.replace(`/(tabs)/tour/${meeting.id}`),
      },
    ]);
  };

  const stepPageKey = isWizardComplete ? 'submit' : activeStep ?? 'empty';
  const isPickerStep = activeStep === 'date' || activeStep === 'time';

  return (
    <ScreenLayout
      contentContainerStyle={styles.content}
      contentTopSpacing={spacing.md}
      scrollable={phase === 'details' && isPickerStep}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        onPress={handleBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </Pressable>

      {phase === 'category' ? (
        <Animated.View
          key="category-phase"
          entering={PHASE_ENTERING}
          exiting={PHASE_EXITING}
          style={styles.phase}>
          <MeetingCreateCategoryPhase onSelect={handleCategorySelect} />
        </Animated.View>
      ) : null}

      {phase === 'details' && selectedCategory ? (
        <Animated.View
          key="details-phase"
          entering={PHASE_ENTERING}
          exiting={PHASE_EXITING}
          style={styles.detailsPhase}>
          <WizardPageTransition
            key={stepPageKey}
            direction={transitionDirection}>
            {isWizardComplete ? (
              <View style={styles.submitSection}>
                <AppText variant="h3" style={styles.submitTitle}>
                  모임 정보를 확인하고 만들기를 눌러주세요
                </AppText>
                {error ? (
                  <AppText variant="caption" color="error">
                    {error}
                  </AppText>
                ) : null}
                <AppButton
                  label="만들기"
                  size="lg"
                  fullWidth
                  loading={isSaving}
                  onPress={handleSave}
                />
              </View>
            ) : activeStep ? (
              <MeetingCreateActiveStep
                stepId={activeStep}
                draft={draft}
                onComplete={handleStepComplete}
              />
            ) : null}
          </WizardPageTransition>
        </Animated.View>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: spacing.xl,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: -spacing.xs,
    padding: spacing.xs,
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  phase: {
    flex: 1,
    width: '100%',
  },
  detailsPhase: {
    flex: 1,
    width: '100%',
    overflow: 'visible',
  },
  submitSection: {
    flex: 1,
    gap: spacing.lg,
  },
  submitTitle: {
    lineHeight: 28,
  },
});
