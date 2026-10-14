import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/src/components/ui';
import { colors, spacing } from '@/src/constants';
import {
  TOUR_DETAIL_TERMS_COLLAPSED_PARAGRAPH_COUNT,
  type TourDetailTermsBlock,
} from '@/src/features/tour/types/tour-meeting-detail';

const COLLAPSED_PREVIEW_MAX_HEIGHT = 88;
const CHEVRON_BOUNCE_OFFSET = 5;
const CHEVRON_BOUNCE_MS = 900;

type TourDetailTermsSectionProps = {
  terms: TourDetailTermsBlock[];
};

function countParagraphs(terms: TourDetailTermsBlock[]): number {
  return terms.reduce((sum, block) => sum + block.paragraphs.length, 0);
}

export function TourDetailTermsSection({ terms }: TourDetailTermsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const chevronOffset = useSharedValue(0);
  const totalParagraphs = useMemo(() => countParagraphs(terms), [terms]);
  const canExpand = totalParagraphs > TOUR_DETAIL_TERMS_COLLAPSED_PARAGRAPH_COUNT;

  const collapsedContent = useMemo(() => {
    const lines: string[] = [];
    for (const block of terms) {
      for (const paragraph of block.paragraphs) {
        lines.push(paragraph);
        if (lines.length >= TOUR_DETAIL_TERMS_COLLAPSED_PARAGRAPH_COUNT) {
          return lines;
        }
      }
    }
    return lines;
  }, [terms]);

  useEffect(() => {
    if (expanded || !canExpand) {
      chevronOffset.value = 0;
      return;
    }

    chevronOffset.value = withRepeat(
      withSequence(
        withTiming(CHEVRON_BOUNCE_OFFSET, {
          duration: CHEVRON_BOUNCE_MS,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(0, {
          duration: CHEVRON_BOUNCE_MS,
          easing: Easing.inOut(Easing.quad),
        }),
      ),
      -1,
      false,
    );
  }, [canExpand, chevronOffset, expanded]);

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: chevronOffset.value }],
  }));

  return (
    <View style={styles.container}>
      {expanded ? (
        <View style={styles.fullContent}>
          {terms.map((block) => (
            <View key={block.title} style={styles.termsGroup}>
              <AppText variant="label" style={styles.termsHeading}>{block.title}</AppText>
              {block.paragraphs.map((paragraph) => (
                <AppText
                  key={paragraph}
                  variant="bodySmall"
                  color="textSecondary"
                  style={styles.paragraph}>
                  {paragraph}
                </AppText>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.previewShell}>
          <View style={styles.previewClip}>
            {collapsedContent.map((paragraph) => (
              <AppText
                key={paragraph}
                variant="bodySmall"
                color="textSecondary"
                style={styles.paragraph}>
                {paragraph}
              </AppText>
            ))}
          </View>
          {canExpand ? (
            <LinearGradient
              pointerEvents="none"
              colors={[
                'rgba(255, 255, 255, 0)',
                'rgba(255, 255, 255, 0.65)',
                colors.background,
              ]}
              locations={[0, 0.45, 1]}
              style={styles.previewFade}
            />
          ) : null}
        </View>
      )}

      {canExpand ? (
        <View style={styles.toggleRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={expanded ? '상세정보 접기' : '상세정보 펼치기'}
            hitSlop={12}
            onPress={() => setExpanded((value) => !value)}
            style={({ pressed }) => [styles.toggleButton, pressed && styles.togglePressed]}>
            <Animated.View style={chevronAnimatedStyle}>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={colors.primaryStrong}
              />
            </Animated.View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  fullContent: {
    gap: spacing.lg,
  },
  previewShell: {
    position: 'relative',
    maxHeight: COLLAPSED_PREVIEW_MAX_HEIGHT,
    overflow: 'hidden',
  },
  previewClip: {
    gap: spacing.sm,
  },
  previewFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
  },
  termsGroup: {
    gap: spacing.sm,
  },
  termsHeading: {
    color: colors.textPrimary,
  },
  paragraph: {
    lineHeight: 22,
  },
  toggleRow: {
    alignItems: 'center',
    marginTop: -spacing.xs,
  },
  toggleButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  togglePressed: {
    opacity: 0.7,
  },
});
