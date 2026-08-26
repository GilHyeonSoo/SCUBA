import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, TextStyle, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { typography, TypographyVariant } from '@/src/constants';

type TypewriterTextProps = {
  text: string;
  variant?: TypographyVariant;
  style?: TextStyle;
  charDelay?: number;
};

export function TypewriterText({
  text,
  variant = 'body',
  style,
  charDelay = 95,
}: TypewriterTextProps) {
  const [runId, setRunId] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRunId((id) => id + 1);
    }, []),
  );

  const chars = Array.from(text);
  const textStyle = [typography[variant], style];

  return (
    <View style={styles.row} accessibilityLabel={text}>
      {chars.map((char, index) => (
        <Animated.Text
          key={`${runId}-${index}-${char}`}
          entering={FadeIn.delay(index * charDelay).duration(300)}
          style={textStyle}>
          {char}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
});
