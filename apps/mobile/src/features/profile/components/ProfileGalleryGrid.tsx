import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '@/src/constants';
import { openGalleryImagePicker } from '@/src/features/profile/services/profile-image-picker';
import { useProfileGalleryStore } from '@/src/features/profile/stores/profile-gallery-store';
import type { ProfileGalleryImage } from '@/src/features/profile/types';

const GRID_COLUMNS = 3;
const GRID_GAP = 1;
const CELL_ASPECT_RATIO = 1.2;

type ProfileGalleryGridProps = {
  onImagePress: (image: ProfileGalleryImage) => void;
};

export function ProfileGalleryGrid({ onImagePress }: ProfileGalleryGridProps) {
  const images = useProfileGalleryStore((state) => state.images);
  const addImage = useProfileGalleryStore((state) => state.addImage);
  const { cellWidth, cellHeight } = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    const width = (screenWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
    return {
      cellWidth: width,
      cellHeight: width * CELL_ASPECT_RATIO,
    };
  }, []);

  const handleAddImage = () => {
    openGalleryImagePicker((uri) => {
      addImage(uri);
    });
  };

  return (
    <View style={styles.grid}>
      {images.map((image, index) => {
        const isLastInRow = (index + 1) % GRID_COLUMNS === 0;

        return (
          <Pressable
            key={image.id}
            accessibilityRole="imagebutton"
            accessibilityLabel="프로필 사진 보기"
            onPress={() => onImagePress(image)}
            style={[
              styles.cell,
              {
                width: cellWidth,
                height: cellHeight,
                marginRight: isLastInRow ? 0 : GRID_GAP,
                marginBottom: GRID_GAP,
              },
            ]}>
            <View style={styles.imageFrame}>
              <Image
                source={{ uri: image.uri }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          </Pressable>
        );
      })}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="사진 추가"
        onPress={handleAddImage}
        style={[
          styles.cell,
          styles.addCell,
          {
            width: cellWidth,
            height: cellHeight,
            marginRight:
              (images.length + 1) % GRID_COLUMNS === 0 ? 0 : GRID_GAP,
            marginBottom: GRID_GAP,
          },
        ]}>
        <Ionicons name="add" size={28} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  imageFrame: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addCell: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
