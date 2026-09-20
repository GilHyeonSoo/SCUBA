import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadeInView } from '@/src/components/motion';
import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import {
  COLLAPSIBLE_ACTION_FAB_SIZE,
  CollapsibleActionFab,
} from '@/src/components/ui/CollapsibleActionFab';
import { AppText } from '@/src/components/ui';
import { colors, getTabBarChromeHeight, spacing } from '@/src/constants';
import { DiveImportSheet } from '@/src/features/dive-log/components/DiveImportSheet';
import { useDiveImport } from '@/src/features/dive-log/hooks/useDiveImport';
import { useDiveLogStore } from '@/src/features/dive-log/stores/dive-log-store';
import { DiveLatestSection } from '@/src/features/dive/components/DiveLatestSection';
import { DiveLedgerEmptyState } from '@/src/features/dive/components/DiveLedgerEmptyState';
import { DivePreviousLogItem } from '@/src/features/dive/components/DivePreviousLogItem';
import { DiveYearPicker } from '@/src/features/dive/components/DiveYearPicker';
import {
  filterDivesByYear,
  getAvailableYears,
  getMostRecentDiveYear,
} from '@/src/features/dive/utils/dive-ledger';

const FAB_CHROME_HEIGHT = COLLAPSIBLE_ACTION_FAB_SIZE + spacing.md + spacing.lg;

export default function DiveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dives = useDiveLogStore((state) => state.dives);
  const lastImportedAt = useDiveLogStore((state) => state.lastImportedAt);
  const { isImporting, isSheetVisible, openImportSheet, closeImportSheet, pickAndImport } =
    useDiveImport();

  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(() => getAvailableYears(dives, currentYear), [dives, currentYear]);
  const mostRecentDiveYear = useMemo(() => getMostRecentDiveYear(dives), [dives]);
  const [selectedYear, setSelectedYear] = useState(() => mostRecentDiveYear ?? currentYear);

  useEffect(() => {
    if (mostRecentDiveYear != null) {
      setSelectedYear(mostRecentDiveYear);
    }
  }, [lastImportedAt, mostRecentDiveYear]);

  const effectiveYear = availableYears.includes(selectedYear) ? selectedYear : availableYears[0];
  const yearDives = useMemo(
    () => filterDivesByYear(dives, effectiveYear),
    [dives, effectiveYear],
  );
  const latestDive = yearDives[0] ?? null;
  const previousDives = latestDive ? yearDives.slice(1) : yearDives;

  const scrollBottomInset = getTabBarChromeHeight(insets.bottom) + FAB_CHROME_HEIGHT;

  const handleRecordPress = () => {
    Alert.alert('준비 중', '수동 다이빙 기록 화면은 다음 단계에서 연결됩니다.');
  };

  const handleDetailPress = (diveId: string) => {
    router.push(`/(tabs)/dive/${diveId}`);
  };

  const showAddActions = () => {
    Alert.alert('기록 추가', undefined, [
      { text: '직접 기록', onPress: handleRecordPress },
      { text: '파일에서 가져오기', onPress: openImportSheet },
      { text: '취소', style: 'cancel' },
    ]);
  };

  const hasLogs = dives.length > 0;
  const hasYearLogs = yearDives.length > 0;

  return (
    <View style={styles.screen}>
      <ScreenLayout
        contentTopSpacing={spacing.lg}
        contentContainerStyle={[styles.content, { paddingBottom: scrollBottomInset }]}>
        <FadeInView index={0}>
          <DiveYearPicker
            years={availableYears}
            selectedYear={effectiveYear}
            onSelectYear={setSelectedYear}
          />
        </FadeInView>

        {hasLogs ? (
          hasYearLogs ? (
            <>
              {latestDive ? (
                <FadeInView index={1}>
                  <DiveLatestSection dive={latestDive} onDetailPress={handleDetailPress} />
                </FadeInView>
              ) : null}

              {previousDives.length > 0 ? (
                <FadeInView index={2}>
                  <AppText variant="label" style={styles.previousHeader}>
                    이전 기록
                  </AppText>
                  <View style={styles.previousList}>
                    {previousDives.map((dive) => (
                      <DivePreviousLogItem
                        key={dive.id}
                        dive={dive}
                        onPress={handleDetailPress}
                      />
                    ))}
                  </View>
                </FadeInView>
              ) : null}
            </>
          ) : (
            <FadeInView index={1}>
              <View style={styles.yearEmpty}>
                <AppText variant="h3">{effectiveYear}년 기록이 없습니다</AppText>
                <AppText variant="bodySmall" style={styles.yearEmptyText}>
                  다른 연도를 선택하거나 새 다이빙을 기록해 보세요.
                </AppText>
              </View>
            </FadeInView>
          )
        ) : (
          <FadeInView index={1}>
            <DiveLedgerEmptyState
              isImporting={isImporting}
              onImportPress={openImportSheet}
              onRecordPress={handleRecordPress}
            />
          </FadeInView>
        )}
      </ScreenLayout>

      {hasLogs ? (
        <CollapsibleActionFab
          label="기록 추가"
          accessibilityLabel="기록 추가"
          labelWidth={68}
          onPress={showAddActions}
        />
      ) : null}

      <DiveImportSheet
        visible={isSheetVisible}
        isImporting={isImporting}
        onClose={closeImportSheet}
        onPickFile={(format) => void pickAndImport(format)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
  },
  previousHeader: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
  },
  previousList: {
    marginTop: spacing.xs,
  },
  yearEmpty: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
  },
  yearEmptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
});
