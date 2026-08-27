import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { FadeInView } from '@/src/components/motion';
import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppButton, AppCard, AppHeader, AppText, SectionHeader } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';

const diveActions = [
  {
    id: 'manual',
    title: '다이빙 기록',
    description: '수동으로 다이빙 로그를 추가합니다.',
    icon: 'create-outline' as const,
  },
  {
    id: 'import',
    title: '로그 가져오기',
    description: '파일 또는 다이빙 컴퓨터에서 가져옵니다.',
    icon: 'download-outline' as const,
  },
  {
    id: 'computer',
    title: '다이빙 컴퓨터',
    description: '지원 기기 연동 (추후 제공)',
    icon: 'watch-outline' as const,
  },
];

export default function DiveScreen() {
  return (
    <ScreenLayout
      header={<AppHeader title="다이빙" subtitle="로그 기록과 다이빙 컴퓨터 연동" />}
      contentContainerStyle={styles.content}>
      <FadeInView index={0}>
        <AppButton label="다이빙 기록 추가" size="lg" fullWidth />
      </FadeInView>

      <FadeInView index={1}>
        <SectionHeader title="Dive" subtitle="빠른 작업" />
        {diveActions.map((action, actionIndex) => (
          <AppCard
            key={action.id}
            pressable
            elevated
            style={[styles.actionCard, actionIndex > 0 && styles.actionSpacing]}>
            <View style={styles.actionRow}>
              <View style={styles.iconWrap}>
                <Ionicons name={action.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.actionText}>
                <AppText variant="h3">{action.title}</AppText>
                <AppText variant="bodySmall">{action.description}</AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </View>
          </AppCard>
        ))}
      </FadeInView>

      <FadeInView index={2}>
        <AppCard variant="soft" style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons name="water-outline" size={24} color={colors.primary} />
          </View>
          <AppText variant="h3">아직 다이빙 로그가 없습니다</AppText>
          <AppText variant="bodySmall" style={styles.emptyText}>
            첫 다이빙을 기록하거나 다이빙 컴퓨터에서 가져와 보세요.
          </AppText>
        </AppCard>
      </FadeInView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  actionCard: {
    paddingVertical: spacing.md,
  },
  actionSpacing: {
    marginTop: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
    gap: spacing.xs,
  },
  emptyCard: {
    gap: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    marginTop: spacing.md,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingHorizontal: spacing.xl,
  },
});
