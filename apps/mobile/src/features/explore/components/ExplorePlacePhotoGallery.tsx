import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants';
import type { ExplorePlaceCategory, ExplorePlaceImage } from '@/src/features/explore/types';

const categoryGradients: Record<ExplorePlaceCategory, readonly [string, string]> = {
  pool: ['#0090DB', '#005C96'],
  site: ['#5383E6', '#005C96'],
  shop: ['#3B6FD4', '#082B5C'],
  tour: ['#C47A18', '#8A4F0F'],
};

const categoryIcons: Record<ExplorePlaceCategory, keyof typeof Ionicons.glyphMap> = {
  pool: 'water',
  site: 'location',
  shop: 'storefront',
  tour: 'boat',
};

type ExplorePlacePhotoGalleryProps = {
  category: ExplorePlaceCategory;
  images: ExplorePlaceImage[];
};

function PlaceholderGallery({ category }: { category: ExplorePlaceCategory }) {
  const gradient = categoryGradients[category];

  return (
    <LinearGradient
      colors={[...gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.placeholderCard}>
      <Ionicons name={categoryIcons[category]} size={40} color="rgba(255,255,255,0.9)" />
    </LinearGradient>
  );
}

type GalleryPhotoProps = {
  image: ExplorePlaceImage;
  index: number;
  onError: (key: string) => void;
};

function GalleryPhoto({ image, index, onError }: GalleryPhotoProps) {
  const key = image.id ?? `${image.url}-${index}`;

  return (
    <View style={[styles.photoCard, index === 0 ? styles.primaryPhoto : styles.secondaryPhoto]}>
      <Image
        source={{ uri: image.url }}
        style={styles.photoImage}
        resizeMode="cover"
        onError={() => onError(key)}
      />
    </View>
  );
}

export function ExplorePlacePhotoGallery({ category, images }: ExplorePlacePhotoGalleryProps) {
  const [failedKeys, setFailedKeys] = useState<Set<string>>(() => new Set());

  const visibleImages = useMemo(
    () =>
      images.filter((image, index) => {
        const key = image.id ?? `${image.url}-${index}`;
        return !failedKeys.has(key);
      }),
    [failedKeys, images],
  );

  const handleImageError = (key: string) => {
    setFailedKeys((current) => {
      if (current.has(key)) {
        return current;
      }

      const next = new Set(current);
      next.add(key);
      return next;
    });
  };

  if (!visibleImages.length) {
    return <PlaceholderGallery category={category} />;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.photoRow}>
      {visibleImages.map((image, index) => (
        <GalleryPhoto
          key={image.id ?? `${image.url}-${index}`}
          image={image}
          index={index}
          onError={handleImageError}
        />
      ))}
    </ScrollView>
  );
}

const photoHeight = 204;

const styles = StyleSheet.create({
  photoRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  photoCard: {
    height: photoHeight,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  primaryPhoto: {
    width: 300,
  },
  secondaryPhoto: {
    width: 200,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCard: {
    height: photoHeight,
    width: '100%',
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
