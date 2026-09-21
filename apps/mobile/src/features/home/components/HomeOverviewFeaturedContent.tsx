import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { DiveProfileChart } from '@/src/features/dive/components/DiveProfileChart';
import { canRenderProfile } from '@/src/features/dive/utils/dive-ledger';
import type { HomeOverviewPanel } from '@/src/features/home/types/home-overview';

type HomeOverviewFeaturedContentProps = {
  panel: HomeOverviewPanel;
};

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <AppText variant="caption" style={styles.statLabel}>
        {label}
      </AppText>
      <AppText variant="body" style={styles.statValue}>
        {value}
      </AppText>
    </View>
  );
}

export function HomeOverviewFeaturedContent({ panel }: HomeOverviewFeaturedContentProps) {
  if (panel.type === 'recent') {
    const hasProfile = canRenderProfile(panel.profile);

    return (
      <View style={styles.panelBody}>
        <View style={styles.panelHeader}>
          <AppText variant="h3" style={styles.panelTitle}>
            {panel.site}
          </AppText>
          <AppText variant="bodySmall" style={styles.panelSubtitle}>
            {panel.date}
          </AppText>
        </View>

        <View style={styles.statsRow}>
          <StatCell label="최대 수심" value={`${panel.maxDepth}m`} />
          <View style={styles.statDivider} />
          <StatCell label="다이브 시간" value={`${panel.durationMin}분`} />
          <View style={styles.statDivider} />
          <StatCell label="수온" value={`${panel.waterTempC}°C`} />
        </View>

        {hasProfile ? (
          <DiveProfileChart profile={panel.profile} variant="featured" />
        ) : (
          <AppText variant="caption" style={styles.emptyNote}>
            프로파일 데이터 없음
          </AppText>
        )}
      </View>
    );
  }

  if (panel.type === 'buddy') {
    return (
      <View style={styles.panelBody}>
        <View style={styles.panelHeader}>
          <AppText variant="h3" style={styles.panelTitle}>
            {`${panel.count}명 근처`}
          </AppText>
          <AppText variant="bodySmall" style={styles.panelSubtitle}>
            주변에서 활동 중인 다이버
          </AppText>
        </View>

        <View style={styles.listBlock}>
          {panel.buddies.map((buddy, index) => (
            <View
              key={buddy.id}
              style={[styles.listRow, index < panel.buddies.length - 1 && styles.listRowDivider]}>
              <View style={styles.listRowMain}>
                <AppText variant="body" style={styles.listTitle}>
                  {buddy.nickname}
                </AppText>
                <AppText variant="caption" style={styles.listMeta}>
                  {`${buddy.certification} · ${buddy.diveCount} dives · ${buddy.region}`}
                </AppText>
                <AppText variant="caption" style={styles.listStatus} numberOfLines={1}>
                  {buddy.status}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (panel.type === 'gear') {
    const maintenance = panel.maintenance;

    return (
      <View style={styles.panelBody}>
        <View style={styles.panelHeader}>
          <AppText variant="h3" style={styles.panelTitle}>
            {maintenance ? '점검 필요' : '장비 상태 양호'}
          </AppText>
          <AppText variant="bodySmall" style={styles.panelSubtitle}>
            {maintenance ? maintenance.equipmentName : '등록된 장비 점검 일정 없음'}
          </AppText>
        </View>

        {maintenance ? (
          <>
            <View style={styles.statusPill}>
              <AppText variant="caption" style={styles.statusPillText}>
                {maintenance.status === 'due' ? '점검 예정' : '곧 점검'}
              </AppText>
            </View>
            <AppText variant="bodySmall" style={styles.messageText}>
              {maintenance.message}
            </AppText>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '35%' }]} />
            </View>
          </>
        ) : (
          <AppText variant="bodySmall" style={styles.messageText}>
            모든 등록 장비가 정상 범위입니다.
          </AppText>
        )}
      </View>
    );
  }

  const fillRatio = panel.totalSeats > 0 ? panel.filledSeats / panel.totalSeats : 0;

  return (
    <View style={styles.panelBody}>
      <View style={styles.panelHeader}>
        <AppText variant="h3" style={styles.panelTitle}>
          {panel.tour.title}
        </AppText>
        <AppText variant="bodySmall" style={styles.panelSubtitle}>
          {`${panel.tour.location} · ${panel.tour.date}`}
        </AppText>
      </View>

      <View style={styles.statsRow}>
        <StatCell label="참가" value={`${panel.filledSeats}/${panel.totalSeats}명`} />
        <View style={styles.statDivider} />
        <StatCell label="유형" value={panel.tour.type === 'official' ? '공식 투어' : '커뮤니티'} />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${fillRatio * 100}%` }]} />
      </View>
      <AppText variant="caption" style={styles.progressCaption}>
        {panel.totalSeats - panel.filledSeats > 0
          ? `잔여 ${panel.totalSeats - panel.filledSeats}석`
          : '마감 임박'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  panelBody: {
    gap: spacing.lg,
  },
  panelHeader: {
    gap: spacing.xs,
  },
  panelTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  panelSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statCell: {
    flex: 1,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.sm,
  },
  statLabel: {
    color: colors.textTertiary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  listBlock: {
    gap: 0,
  },
  listRow: {
    paddingVertical: spacing.md,
  },
  listRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  listRowMain: {
    gap: spacing.xs,
  },
  listTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  listMeta: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  listStatus: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusPillText: {
    color: colors.warning,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  progressCaption: {
    color: colors.textTertiary,
    fontSize: 14,
    lineHeight: 18,
  },
  emptyNote: {
    color: colors.textTertiary,
    fontSize: 15,
    lineHeight: 20,
  },
});
