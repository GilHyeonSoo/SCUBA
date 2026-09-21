import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLLAPSIBLE_ACTION_FAB_SIZE } from '@/src/components/ui/CollapsibleActionFab';
import { colors, getTabBarChromeHeight, layout, radius, shadows, spacing } from '@/src/constants';
import { DiveAddSourceOptions } from '@/src/features/dive/components/DiveAddSourceOptions';

type DiveAddOptionsFabPanelProps = {
  visible: boolean;
  isImporting?: boolean;
  onBluetoothPress: () => void;
  onImportPress: () => void;
  onDismiss: () => void;
};

export function DiveAddOptionsFabPanel({
  visible,
  isImporting,
  onBluetoothPress,
  onImportPress,
  onDismiss,
}: DiveAddOptionsFabPanelProps) {
  const insets = useSafeAreaInsets();

  if (!visible) {
    return null;
  }

  const bottom =
    getTabBarChromeHeight(insets.bottom) + spacing.md + COLLAPSIBLE_ACTION_FAB_SIZE + spacing.sm;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="옵션 닫기"
        onPress={onDismiss}
        style={styles.backdrop}
      />
      <View style={[styles.panel, shadows.lg, { bottom }]}>
        <DiveAddSourceOptions
          isImporting={isImporting}
          onBluetoothPress={onBluetoothPress}
          onImportPress={onImportPress}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 35,
  },
  panel: {
    position: 'absolute',
    right: layout.screenPaddingHorizontal,
    left: layout.screenPaddingHorizontal,
    zIndex: 36,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
  },
});
