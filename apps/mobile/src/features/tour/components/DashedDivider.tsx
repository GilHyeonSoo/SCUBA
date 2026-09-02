import { StyleSheet, View } from 'react-native';

import { colors } from '@/src/constants';

type DashedDividerProps = {
  direction?: 'horizontal' | 'vertical';
};

const HORIZONTAL_SEGMENTS = 28;
const VERTICAL_SEGMENTS = 10;

export function DashedDivider({ direction = 'horizontal' }: DashedDividerProps) {
  const isHorizontal = direction === 'horizontal';
  const segments = isHorizontal ? HORIZONTAL_SEGMENTS : VERTICAL_SEGMENTS;

  return (
    <View
      style={[
        styles.container,
        isHorizontal ? styles.horizontalContainer : styles.verticalContainer,
      ]}>
      {Array.from({ length: segments }).map((_, index) => (
        <View
          key={`${direction}-${index}`}
          style={isHorizontal ? styles.horizontalDash : styles.verticalDash}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 4,
    paddingVertical: 2,
  },
  verticalContainer: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    gap: 4,
    paddingHorizontal: 2,
  },
  horizontalDash: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    maxWidth: 8,
  },
  verticalDash: {
    width: 1,
    flex: 1,
    backgroundColor: colors.border,
    maxHeight: 6,
  },
});
