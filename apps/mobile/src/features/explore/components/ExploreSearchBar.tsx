import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, layout, radius, shadows, spacing } from '@/src/constants';

type ExploreSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  topInset: number;
};

export function ExploreSearchBar({
  value,
  onChangeText,
  onClear,
  topInset,
}: ExploreSearchBarProps) {
  return (
    <View
      style={[styles.container, { paddingTop: topInset + spacing.sm }]}
      pointerEvents="box-none">
      <View style={[styles.searchWrap, shadows.md]}>
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="잠수풀, 포인트, 샵, 투어 검색"
          placeholderTextColor={colors.textTertiary}
          style={styles.searchInput}
          returnKeyType="search"
          accessibilityLabel="장소 검색"
        />
        {value.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="검색어 지우기"
            onPress={onClear}
            hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.sm,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
});
