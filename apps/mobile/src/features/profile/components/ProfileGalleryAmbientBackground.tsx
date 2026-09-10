import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { animation } from '@/src/constants';

type ProfileGalleryAmbientBackgroundProps = {
  uri: string | null;
  progress: SharedValue<number>;
  topInset: number;
  bottomInset: number;
};

export function ProfileGalleryAmbientBackground({
  uri,
  progress,
  topInset,
  bottomInset,
}: ProfileGalleryAmbientBackgroundProps) {
  const [displayUri, setDisplayUri] = useState(uri);
  const crossfade = useSharedValue(1);

  useEffect(() => {
    if (!uri || uri === displayUri) {
      return;
    }

    crossfade.value = withTiming(0, { duration: animation.fast }, (finished) => {
      if (!finished) {
        return;
      }

      runOnJS(setDisplayUri)(uri);
      crossfade.value = withTiming(1, { duration: animation.normal });
    });
  }, [crossfade, displayUri, uri]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const imageStyle = useAnimatedStyle(() => ({
    opacity: crossfade.value,
  }));

  if (!displayUri) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          top: -topInset,
          bottom: -bottomInset,
        },
        containerStyle,
      ]}>
      <Animated.View style={[styles.imageWrap, imageStyle]}>
        <Image
          source={{ uri: displayUri }}
          style={styles.image}
          resizeMode="cover"
          blurRadius={Platform.OS === 'ios' ? 32 : 14}
        />
      </Animated.View>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={48} tint="dark" style={styles.blurOverlay} />
      ) : (
        <View style={styles.androidBlurFallback} />
      )}
      <LinearGradient
        colors={[
          'rgba(6, 31, 66, 0.55)',
          'rgba(6, 31, 66, 0.42)',
          'rgba(6, 31, 66, 0.62)',
          'rgba(6, 31, 66, 0.78)',
        ]}
        locations={[0, 0.35, 0.7, 1]}
        style={styles.tintGradient}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 0,
    overflow: 'hidden',
    backgroundColor: '#061F42',
  },
  imageWrap: {
    ...StyleSheet.absoluteFill,
  },
  image: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.15 }],
  },
  blurOverlay: {
    ...StyleSheet.absoluteFill,
  },
  androidBlurFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 31, 66, 0.5)',
  },
  tintGradient: {
    ...StyleSheet.absoluteFill,
  },
});
