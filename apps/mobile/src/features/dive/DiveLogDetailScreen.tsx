import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import { useDiveLogStore } from '@/src/features/dive-log/stores/dive-log-store';
import {
  formatDepthMeters,
  formatDiveDate,
  formatDiveDuration,
  formatDiveGas,
  formatDiveImportSource,
  formatDiveLocationLabel,
  formatWaterTemperature,
} from '@/src/features/dive-log/utils/format-dive-log';
import { DiveProfileChart } from '@/src/features/dive/components/DiveProfileChart';
import { canRenderProfile } from '@/src/features/dive/utils/dive-ledger';

type MetricProps = {
  label: string;
  value: string;
  divided?: boolean;
};

function Metric({ label, value, divided = false }: MetricProps) {
  return (
    <View style={[styles.metric, divided && styles.metricDivided]}>
      <AppText variant="caption" style={styles.metricLabel}>
        {label}
      </AppText>
      <AppText variant="body" style={styles.metricValue}>
        {value}
      </AppText>
    </View>
  );
}

function SourceRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.sourceRow}>
      <AppText variant="bodySmall" style={styles.sourceLabel}>
        {label}
      </AppText>
      <AppText variant="body" style={styles.sourceValue}>
        {value}
      </AppText>
    </View>
  );
}

export default function DiveLogDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const diveId = Array.isArray(id) ? id[0] : id;
  const dive = useDiveLogStore((state) =>
    diveId ? state.dives.find((item) => item.id === diveId) : undefined,
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)/dive');
  };

  const backButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="뒤로가기"
      hitSlop={8}
      onPress={handleBack}
      style={({ pressed }) => [
        styles.backButton,
        { top: insets.top + spacing.sm },
        pressed && styles.backButtonPressed,
      ]}>
      <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
    </Pressable>
  );

  if (!dive) {
    return (
      <View style={styles.screen}>
        {backButton}
        <ScreenLayout contentTopSpacing={spacing.lg} contentContainerStyle={styles.content}>
          <View style={styles.notFound}>
            <AppText variant="h3" style={styles.notFoundTitle}>
              다이빙 로그를 찾을 수 없습니다
            </AppText>
            <AppText variant="bodySmall" style={styles.notFoundDescription}>
              삭제되었거나 현재 기기에 불러오지 않은 기록입니다.
            </AppText>
          </View>
        </ScreenLayout>
      </View>
    );
  }

  const deviceLabel = formatDiveLocationLabel(dive.source.vendor, dive.source.model);
  const hasProfile = canRenderProfile(dive.profile);
  const diveNumber = dive.diveNumber == null ? '-' : `Dive #${dive.diveNumber}`;

  return (
    <View style={styles.screen}>
      {backButton}
      <ScreenLayout contentTopSpacing={spacing.lg} contentContainerStyle={styles.content}>
        <View style={styles.hero} accessibilityRole="summary">
          <AppText variant="label" style={styles.eyebrow}>
            {diveNumber}
          </AppText>
          <AppText variant="h2" style={styles.date}>
            {formatDiveDate(dive.startedAt)}
          </AppText>
          <AppText variant="body" style={styles.deviceLabel}>
            {deviceLabel}
          </AppText>

          <View style={styles.depthBlock}>
            <AppText variant="caption" style={styles.depthLabel}>
              최대 수심
            </AppText>
            <AppText style={styles.depthValue}>{formatDepthMeters(dive.maxDepthM)}</AppText>
          </View>
        </View>

        <View style={styles.profileSection}>
          <AppText variant="h3" style={styles.sectionTitle}>
            다이브 프로파일
          </AppText>
          {hasProfile ? (
            <DiveProfileChart profile={dive.profile} variant="featured" />
          ) : (
            <AppText variant="bodySmall" style={styles.profileEmpty}>
              이 로그에는 수심 프로파일 데이터가 없습니다.
            </AppText>
          )}
        </View>

        <View style={styles.metrics}>
          <View style={[styles.metricRow, styles.metricRowBorder]}>
            <Metric label="다이빙 시간" value={formatDiveDuration(dive.durationSec)} />
            <Metric label="평균 수심" value={formatDepthMeters(dive.avgDepthM)} divided />
          </View>
          <View style={styles.metricRow}>
            <Metric label="수온" value={formatWaterTemperature(dive.waterTempC)} />
            <Metric label="기체" value={formatDiveGas(dive.gas)} divided />
          </View>
        </View>

        <View style={styles.sourceSection}>
          <AppText variant="h3" style={styles.sectionTitle}>
            로그 정보
          </AppText>
          <View style={styles.sourceList}>
            <SourceRow label="장소 / 기기" value={deviceLabel} />
            <SourceRow label="기기 소스" value={formatDiveImportSource(dive.source.format)} />
            <SourceRow label="다이브 번호" value={diveNumber} />
          </View>
        </View>
      </ScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  content: {
    gap: spacing['2xl'],
  },
  notFound: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['3xl'],
  },
  notFoundTitle: {
    textAlign: 'center',
    fontSize: 19,
    lineHeight: 26,
  },
  notFoundDescription: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  hero: {
    gap: spacing.xs,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  eyebrow: {
    color: colors.primaryStrong,
    fontSize: 14,
    lineHeight: 20,
  },
  date: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  deviceLabel: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 23,
  },
  depthBlock: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  depthLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  depthValue: {
    color: colors.primaryStrong,
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 54,
    letterSpacing: -1.2,
  },
  profileSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 25,
  },
  profileEmpty: {
    color: colors.textTertiary,
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: spacing.xl,
  },
  metrics: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  metricRow: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
  },
  metricRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  metric: {
    flex: 1,
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  metricDivided: {
    borderLeftWidth: 1,
    borderLeftColor: colors.divider,
    paddingLeft: spacing.lg,
    paddingRight: 0,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  sourceSection: {
    gap: spacing.md,
  },
  sourceList: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sourceLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  sourceValue: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    textAlign: 'right',
  },
});
