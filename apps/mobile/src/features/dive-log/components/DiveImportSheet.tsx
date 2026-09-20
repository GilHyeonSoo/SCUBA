import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppBadge, AppButton, AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { ACCEPTED_IMPORT_EXTENSIONS } from '@/src/features/dive-log/import/supported-brands';
import { SUPPORTED_DIVE_BRANDS } from '@/src/features/dive-log/import/supported-brands';
import type { DiveImportFormat, SupportedBrandRoute } from '@/src/features/dive-log/types';

type DiveImportSheetProps = {
  visible: boolean;
  isImporting: boolean;
  onClose: () => void;
  onPickFile: (format?: DiveImportFormat) => void;
};

function routeLabel(route: SupportedBrandRoute): string {
  if (route === 'direct') return '직접 파일';
  if (route === 'subsurface') return 'Subsurface 경유';
  return '직접 + Subsurface';
}

export function DiveImportSheet({
  visible,
  isImporting,
  onClose,
  onPickFile,
}: DiveImportSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="닫기" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <AppText variant="h2">다이빙 로그 가져오기</AppText>
          <AppText variant="bodySmall" style={styles.subtitle}>
            브랜드별로 export한 파일을 SCUBA로 불러옵니다. BLE 직접 연결은 다음 단계에서 제공됩니다.
          </AppText>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {SUPPORTED_DIVE_BRANDS.map((brand) => (
              <View key={brand.id} style={styles.brandCard}>
                <View style={styles.brandTop}>
                  <AppText variant="h3">{brand.name}</AppText>
                  <View style={styles.badges}>
                    <AppBadge label={routeLabel(brand.route)} tone="primary" />
                    {brand.verified ? <AppBadge label="검증됨" tone="success" /> : null}
                  </View>
                </View>
                <AppText variant="bodySmall" style={styles.brandNote}>
                  {brand.note}
                </AppText>
              </View>
            ))}
          </ScrollView>

          <AppText variant="caption" style={styles.extensions}>
            지원 확장자: {ACCEPTED_IMPORT_EXTENSIONS.join(', ')}
          </AppText>

          <AppButton
            label={isImporting ? '가져오는 중...' : '파일 선택'}
            size="lg"
            fullWidth
            loading={isImporting}
            disabled={isImporting}
            onPress={() => onPickFile()}
          />
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.closeButton}
            disabled={isImporting}>
            <AppText variant="label" color="primary">
              닫기
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  scroll: {
    maxHeight: 360,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  brandCard: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  brandTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexShrink: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  brandNote: {
    color: colors.textSecondary,
  },
  extensions: {
    color: colors.textTertiary,
    textAlign: 'center',
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
