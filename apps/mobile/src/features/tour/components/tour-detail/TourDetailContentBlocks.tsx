import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import type { TourContentBlock } from '@/src/features/tour/types/tour-meeting-detail';

type TourDetailContentBlocksProps = {
  blocks: TourContentBlock[];
};

export function TourDetailContentBlocks({ blocks }: TourDetailContentBlocksProps) {
  return (
    <View style={styles.container}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        switch (block.type) {
          case 'heading':
            return (
              <AppText key={key} variant="h2" style={styles.heading}>
                {block.text}
              </AppText>
            );
          case 'subheading':
            return (
              <AppText key={key} variant="h3" style={styles.subheading}>
                {block.text}
              </AppText>
            );
          case 'body':
            return (
              <AppText key={key} variant="bodySmall" color="textSecondary" style={styles.body}>
                {block.text}
              </AppText>
            );
          case 'image':
            return (
              <View key={key} style={styles.imageBlock}>
                <Image
                  source={{ uri: block.uri }}
                  style={styles.image}
                  resizeMode="cover"
                  accessibilityLabel={block.caption ?? '투어 소개 이미지'}
                />
                {block.caption ? (
                  <AppText variant="caption" color="textTertiary" style={styles.imageCaption}>
                    {block.caption}
                  </AppText>
                ) : null}
              </View>
            );
          case 'bulletList':
            return (
              <View key={key} style={styles.listBlock}>
                {block.title ? <AppText variant="label">{block.title}</AppText> : null}
                {block.items.map((item) => (
                  <AppText key={item} variant="bodySmall" color="textSecondary" style={styles.listItem}>
                    · {item}
                  </AppText>
                ))}
              </View>
            );
          default:
            return null;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  heading: {
    marginTop: spacing.xs,
  },
  subheading: {
    color: colors.primaryStrong,
  },
  body: {
    lineHeight: 22,
  },
  imageBlock: {
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  imageCaption: {
    lineHeight: 18,
  },
  listBlock: {
    gap: spacing.xs,
    width: '100%',
  },
  listItem: {
    lineHeight: 20,
  },
});
