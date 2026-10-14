import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import type {
  MockDiveComputerDevice,
  MockDivePreview,
} from '@/src/features/dive-computer/types';

type DiveComputerSyncStepProps = {
  device: MockDiveComputerDevice;
  dives: MockDivePreview[];
  selectedDiveIds: string[];
  isImporting: boolean;
  errorMessage: string | null;
  onToggleDive: (diveId: string) => void;
  onToggleAll: () => void;
  onImport: () => void;
};

const previewDateFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function formatPreviewDate(startedAt: string): string {
  const date = new Date(startedAt);
  return Number.isNaN(date.getTime()) ? startedAt : previewDateFormatter.format(date);
}

export function DiveComputerSyncStep({
  device,
  dives,
  selectedDiveIds,
  isImporting,
  errorMessage,
  onToggleDive,
  onToggleAll,
  onImport,
}: DiveComputerSyncStepProps) {
  const allSelected = dives.length > 0 && selectedDiveIds.length === dives.length;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.deviceSummary}>
          <View style={styles.deviceIcon}>
            <Ionicons name="checkmark" size={24} color={colors.textOnPrimary} />
          </View>
          <View style={styles.deviceText}>
            <AppText variant="h3">{device.model} 연결됨</AppText>
            <AppText variant="bodySmall" style={styles.deviceMeta}>
              {device.vendor} · {device.serialSuffix} · 새 로그 {dives.length}개
            </AppText>
          </View>
        </View>

        <View style={styles.listHeader}>
          <View>
            <AppText variant="h3">가져올 로그 선택</AppText>
            <AppText variant="caption" style={styles.selectionMeta}>
              {selectedDiveIds.length}개 선택됨
            </AppText>
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: allSelected }}
            onPress={onToggleAll}
            style={styles.selectAllButton}>
            <AppText variant="label" color="primary">
              {allSelected ? '전체 해제' : '전체 선택'}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.list}>
          {dives.map((dive) => {
            const selected = selectedDiveIds.includes(dive.id);

            return (
              <Pressable
                key={dive.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${dive.siteName} ${dive.maxDepthM.toFixed(1)}미터`}
                onPress={() => onToggleDive(dive.id)}
                style={({ pressed }) => [
                  styles.diveRow,
                  selected && styles.diveRowSelected,
                  pressed && styles.diveRowPressed,
                ]}>
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected ? (
                    <Ionicons name="checkmark" size={16} color={colors.textOnPrimary} />
                  ) : null}
                </View>
                <View style={styles.diveText}>
                  <AppText variant="h3">{dive.siteName}</AppText>
                  <AppText variant="caption" style={styles.diveDate}>
                    {formatPreviewDate(dive.startedAt)}
                  </AppText>
                </View>
                <View style={styles.metrics}>
                  <AppText variant="label" style={styles.depth}>
                    {dive.maxDepthM.toFixed(1)}m
                  </AppText>
                  <AppText variant="caption">{dive.durationMin}분</AppText>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.simulationNotice}>
          <Ionicons name="flask-outline" size={18} color={colors.textSecondary} />
          <AppText variant="caption" style={styles.noticeText}>
            이 로그는 연동 흐름 테스트용 시뮬레이션 데이터입니다. 실제 다이브 컴퓨터 계산값이 아닙니다.
          </AppText>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
            <AppText variant="bodySmall" style={styles.errorText}>
              {errorMessage}
            </AppText>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          label={isImporting ? '가져오는 중...' : `${selectedDiveIds.length}개 가져오기`}
          size="lg"
          fullWidth
          loading={isImporting}
          disabled={selectedDiveIds.length === 0 || isImporting}
          onPress={onImport}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  deviceSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    padding: spacing.lg,
  },
  deviceIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  deviceText: {
    flex: 1,
    gap: 2,
  },
  deviceMeta: {
    color: colors.textSecondary,
  },
  listHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  selectionMeta: {
    color: colors.textTertiary,
    marginTop: 2,
  },
  selectAllButton: {
    minWidth: 72,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  diveRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  diveRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  diveRowPressed: {
    opacity: 0.78,
  },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  diveText: {
    flex: 1,
    gap: 2,
  },
  diveDate: {
    color: colors.textSecondary,
  },
  metrics: {
    alignItems: 'flex-end',
    gap: 2,
  },
  depth: {
    color: colors.primaryStrong,
  },
  simulationNotice: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
    color: colors.textSecondary,
  },
  errorBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.errorSoft,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    color: colors.error,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});
