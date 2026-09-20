import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { FadeInView } from '@/src/components/motion';
import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import {
  AppButton,
  AppChip,
  AppHeader,
  AppInput,
  AppText,
  SectionHeader,
} from '@/src/components/ui';
import { spacing, colors } from '@/src/constants';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import {
  disciplineOptions,
  freedivingLevelOptions,
  scubaLevelOptions,
} from '@/src/features/profile/constants';
import { openProfileImagePicker } from '@/src/features/profile/services/profile-image-picker';
import { useUpsertMyProfileRemote } from '@/src/features/profile/hooks/useProfileRemote';
import { useProfileStore } from '@/src/features/profile/stores/profile-store';
import { useSupabaseAuth } from '@/src/hooks/useSupabaseAuth';
import type { DiverProfile, DiverProfileDraft } from '@/src/features/profile/types';
import { getDefaultLevelForDiscipline } from '@/src/features/profile/utils';

function toDraft(profile: DiverProfile): DiverProfileDraft {
  const normalized = {
    displayName: profile.displayName ?? '',
    bio: profile.bio ?? '',
    profileImageUrl: profile.profileImageUrl ?? null,
    discipline: profile.discipline,
    scubaLevel: profile.scubaLevel,
    freedivingLevel: profile.freedivingLevel,
    totalDives: String(profile.totalDives ?? 0),
  };

  return normalized;
}

function validateDraft(draft: DiverProfileDraft): string | null {
  const displayName = (draft.displayName ?? '').trim();
  if (displayName.length < 2) {
    return '이름은 2자 이상 입력해 주세요.';
  }

  if ((draft.bio ?? '').trim().length > 120) {
    return '자기소개는 120자 이내로 입력해 주세요.';
  }

  if ((draft.discipline === 'scuba' || draft.discipline === 'both') && !draft.scubaLevel) {
    return '스킨스쿠버 자격 등급을 선택해 주세요.';
  }

  if (
    (draft.discipline === 'freediving' || draft.discipline === 'both') &&
    !draft.freedivingLevel
  ) {
    return '프리다이빙 자격 등급을 선택해 주세요.';
  }

  const totalDives = Number(draft.totalDives);
  if (!Number.isFinite(totalDives) || totalDives < 0 || !Number.isInteger(totalDives)) {
    return '총 다이브 수는 0 이상의 정수로 입력해 주세요.';
  }

  return null;
}

function toProfile(draft: DiverProfileDraft): DiverProfile {
  return {
    displayName: (draft.displayName ?? '').trim(),
    bio: (draft.bio ?? '').trim(),
    profileImageUrl: draft.profileImageUrl ?? null,
    discipline: draft.discipline,
    scubaLevel:
      draft.discipline === 'freediving' ? null : draft.scubaLevel,
    freedivingLevel:
      draft.discipline === 'scuba' ? null : draft.freedivingLevel,
    totalDives: Number(draft.totalDives),
  };
}

export default function ProfileEditScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const { isRemoteSocialEnabled } = useSupabaseAuth();
  const upsertProfileRemote = useUpsertMyProfileRemote();
  const [draft, setDraft] = useState<DiverProfileDraft>(() => toDraft(profile));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showScubaLevels = draft.discipline === 'scuba' || draft.discipline === 'both';
  const showFreedivingLevels =
    draft.discipline === 'freediving' || draft.discipline === 'both';

  const disciplineLabel = useMemo(
    () => disciplineOptions.find((option) => option.value === draft.discipline)?.label ?? '',
    [draft.discipline],
  );

  const handleDisciplineChange = (discipline: DiverProfile['discipline']) => {
    const defaults = getDefaultLevelForDiscipline(discipline);
    setDraft((current) => ({
      ...current,
      discipline,
      scubaLevel: defaults.scubaLevel ?? current.scubaLevel,
      freedivingLevel: defaults.freedivingLevel ?? current.freedivingLevel,
    }));
  };

  const handleImagePress = () => {
    openProfileImagePicker({
      hasImage: Boolean(draft.profileImageUrl),
      onSelect: (uri) => {
        setError(null);
        setDraft((current) => ({ ...current, profileImageUrl: uri }));
      },
      onRemove: () => {
        setError(null);
        setDraft((current) => ({ ...current, profileImageUrl: null }));
      },
    });
  };

  const handleSave = async () => {
    const validationError = validateDraft(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      const nextProfile = toProfile(draft);

      if (isRemoteSocialEnabled) {
        await upsertProfileRemote.mutateAsync(nextProfile);
      } else {
        updateProfile(nextProfile);
      }

      Alert.alert('저장 완료', '프로필이 업데이트되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '프로필 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenLayout
      header={
        <AppHeader
          title="프로필 편집"
          subtitle="다이버 정보를 업데이트하세요"
          onBack={router.canGoBack() ? () => router.back() : undefined}
        />
      }
      contentContainerStyle={styles.content}>
      <FadeInView index={0}>
        <View style={styles.avatarSection}>
          <ProfileAvatar
            imageUrl={draft.profileImageUrl}
            size={96}
            editable
            onPress={handleImagePress}
          />
          <AppText variant="bodySmall" style={styles.avatarHint}>
            프로필 사진을 탭해 변경할 수 있습니다
          </AppText>
        </View>

        <SectionHeader title="기본 정보" subtitle="이름과 소개" compact />
        <View style={styles.section}>
          <AppInput
            label="이름"
            value={draft.displayName}
            onChangeText={(displayName) => {
              setError(null);
              setDraft((current) => ({ ...current, displayName }));
            }}
            placeholder="다이버 닉네임"
            autoCapitalize="none"
            maxLength={20}
          />
          <AppInput
            label="자기소개"
            value={draft.bio}
            onChangeText={(bio) => {
              setError(null);
              setDraft((current) => ({ ...current, bio }));
            }}
            placeholder="다이빙 스타일이나 관심 지역을 소개해 보세요"
            multiline
            numberOfLines={3}
            maxLength={120}
            style={styles.bioInput}
          />
        </View>
      </FadeInView>

      <FadeInView index={1}>
        <SectionHeader title="다이빙 정보" subtitle={disciplineLabel} compact />
        <View style={styles.section}>
          <AppText variant="label">다이빙 종류</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            {disciplineOptions.map((option) => (
              <AppChip
                key={option.value}
                label={option.label}
                selected={draft.discipline === option.value}
                onPress={() => handleDisciplineChange(option.value)}
              />
            ))}
          </ScrollView>

          {showScubaLevels ? (
            <View style={styles.levelGroup}>
              <AppText variant="label">스킨스쿠버 자격 등급</AppText>
              <View style={styles.chipWrap}>
                {scubaLevelOptions.map((option) => (
                  <AppChip
                    key={option.value}
                    label={option.label}
                    selected={draft.scubaLevel === option.value}
                    onPress={() => {
                      setError(null);
                      setDraft((current) => ({ ...current, scubaLevel: option.value }));
                    }}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {showFreedivingLevels ? (
            <View style={styles.levelGroup}>
              <AppText variant="label">프리다이빙 자격 등급</AppText>
              <View style={styles.chipWrap}>
                {freedivingLevelOptions.map((option) => (
                  <AppChip
                    key={option.value}
                    label={option.label}
                    selected={draft.freedivingLevel === option.value}
                    onPress={() => {
                      setError(null);
                      setDraft((current) => ({ ...current, freedivingLevel: option.value }));
                    }}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <AppInput
            label="총 다이브 수"
            value={draft.totalDives}
            onChangeText={(totalDives) => {
              setError(null);
              setDraft((current) => ({ ...current, totalDives }));
            }}
            placeholder="0"
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>
      </FadeInView>

      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : null}

      <FadeInView index={2}>
        <AppButton
          label="저장"
          size="lg"
          fullWidth
          loading={isSaving}
          onPress={handleSave}
        />
      </FadeInView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatarHint: {
    textAlign: 'center',
    color: colors.textSecondary,
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
  levelGroup: {
    gap: spacing.sm,
  },
  bioInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
