import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import {
  AppButton,
  AppChip,
  AppHeader,
  AppInput,
  AppText,
  SectionHeader,
} from '@/src/components/ui';
import { spacing } from '@/src/constants';
import {
  equipmentRentalOptions,
  meetingCategoryLabels,
  meetingEnvironmentLabels,
  meetingPurposeOptions,
} from '@/src/features/tour/constants';
import { useMeetingStore } from '@/src/features/tour/stores/meeting-store';
import type { MeetingCategory, MeetingDraft, MeetingEnvironment } from '@/src/features/tour/types';
import { meetingDraftToMeeting, validateMeetingDraft } from '@/src/features/tour/utils';
import { useProfileStore } from '@/src/features/profile/stores/profile-store';

const meetingCategoryOptions: Array<{ value: MeetingCategory; label: string }> = [
  { value: 'buddy', label: meetingCategoryLabels.buddy },
  { value: 'tour', label: meetingCategoryLabels.tour },
  { value: 'education', label: meetingCategoryLabels.education },
];

const meetingEnvironmentOptions: Array<{ value: MeetingEnvironment; label: string }> = [
  { value: 'pool', label: meetingEnvironmentLabels.pool },
  { value: 'sea', label: meetingEnvironmentLabels.sea },
];

const defaultDraft: MeetingDraft = {
  title: '',
  category: 'buddy',
  environment: 'pool',
  date: '',
  time: '',
  location: '',
  isFree: true,
  cost: '',
  purpose: 'fun',
  equipmentRental: 'unnecessary',
  maxParticipants: '4',
};

export default function MeetingCreateScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const addMeeting = useMeetingStore((state) => state.addMeeting);
  const [draft, setDraft] = useState<MeetingDraft>(defaultDraft);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showEnvironment = draft.category === 'buddy';

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

  return (
    <ScreenLayout
      header={
        <AppHeader
          title="모임 만들기"
          subtitle="다이빙 모임 정보를 입력하세요"
          onBack={router.canGoBack() ? () => router.back() : undefined}
        />
      }
      contentContainerStyle={styles.content}>
      <SectionHeader title="기본 정보" compact />
      <View style={styles.section}>
        <AppInput
          label="제목"
          value={draft.title}
          onChangeText={(title) => {
            setError(null);
            setDraft((current) => ({ ...current, title }));
          }}
          placeholder="모임 제목을 입력하세요"
          maxLength={40}
        />

        <AppText variant="label">카테고리</AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}>
          {meetingCategoryOptions.map((option) => (
            <AppChip
              key={option.value}
              label={option.label}
              selected={draft.category === option.value}
              onPress={() => {
                setError(null);
                setDraft((current) => ({ ...current, category: option.value }));
              }}
            />
          ))}
        </ScrollView>

        {showEnvironment ? (
          <>
            <AppText variant="label">버디 장소</AppText>
            <View style={styles.chipWrap}>
              {meetingEnvironmentOptions.map((option) => (
                <AppChip
                  key={option.value}
                  label={option.label}
                  selected={draft.environment === option.value}
                  onPress={() => {
                    setError(null);
                    setDraft((current) => ({ ...current, environment: option.value }));
                  }}
                />
              ))}
            </View>
          </>
        ) : null}
      </View>

      <SectionHeader title="일정 및 장소" compact />
      <View style={styles.section}>
        <AppInput
          label="날짜"
          value={draft.date}
          onChangeText={(date) => {
            setError(null);
            setDraft((current) => ({ ...current, date }));
          }}
          placeholder="YYYY-MM-DD"
          autoCapitalize="none"
        />
        <AppInput
          label="시간"
          value={draft.time}
          onChangeText={(time) => {
            setError(null);
            setDraft((current) => ({ ...current, time }));
          }}
          placeholder="HH:MM"
          autoCapitalize="none"
        />
        <AppInput
          label="장소"
          value={draft.location}
          onChangeText={(location) => {
            setError(null);
            setDraft((current) => ({ ...current, location }));
          }}
          placeholder="모임 장소를 입력하세요"
        />
      </View>

      <SectionHeader title="모집 조건" compact />
      <View style={styles.section}>
        <AppText variant="label">비용</AppText>
        <View style={styles.chipWrap}>
          <AppChip
            label="무료"
            selected={draft.isFree}
            onPress={() => {
              setError(null);
              setDraft((current) => ({ ...current, isFree: true, cost: '' }));
            }}
          />
          <AppChip
            label="유료"
            selected={!draft.isFree}
            onPress={() => {
              setError(null);
              setDraft((current) => ({ ...current, isFree: false }));
            }}
          />
        </View>
        {!draft.isFree ? (
          <AppInput
            label="참가비 (원)"
            value={draft.cost}
            onChangeText={(cost) => {
              setError(null);
              setDraft((current) => ({ ...current, cost }));
            }}
            placeholder="50000"
            keyboardType="number-pad"
          />
        ) : null}

        <AppText variant="label">목적</AppText>
        <View style={styles.chipWrap}>
          {meetingPurposeOptions.map((option) => (
            <AppChip
              key={option.value}
              label={option.label}
              selected={draft.purpose === option.value}
              onPress={() => {
                setError(null);
                setDraft((current) => ({ ...current, purpose: option.value }));
              }}
            />
          ))}
        </View>

        <AppText variant="label">장비렌탈</AppText>
        <View style={styles.chipWrap}>
          {equipmentRentalOptions.map((option) => (
            <AppChip
              key={option.value}
              label={option.label}
              selected={draft.equipmentRental === option.value}
              onPress={() => {
                setError(null);
                setDraft((current) => ({ ...current, equipmentRental: option.value }));
              }}
            />
          ))}
        </View>

        <AppInput
          label="모집 인원"
          value={draft.maxParticipants}
          onChangeText={(maxParticipants) => {
            setError(null);
            setDraft((current) => ({ ...current, maxParticipants }));
          }}
          placeholder="4"
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>

      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : null}

      <AppButton
        label="모임 만들기"
        size="lg"
        fullWidth
        loading={isSaving}
        onPress={handleSave}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.md,
  },
  chipRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
