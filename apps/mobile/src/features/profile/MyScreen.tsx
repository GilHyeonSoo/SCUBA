import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenLayout } from '@/src/components/layout/ScreenLayout';
import { AppText } from '@/src/components/ui';
import { colors, getTabBarChromeHeight, layout, spacing } from '@/src/constants';
import { ProfileAvatar } from '@/src/features/profile/components/ProfileAvatar';
import { ProfileGalleryAmbientBackground } from '@/src/features/profile/components/ProfileGalleryAmbientBackground';
import { ProfileGalleryExhibition } from '@/src/features/profile/components/ProfileGalleryExhibition';
import { ProfileGalleryGrid } from '@/src/features/profile/components/ProfileGalleryGrid';
import { ProfileGalleryViewer } from '@/src/features/profile/components/ProfileGalleryViewer';
import { useProfileGalleryStore } from '@/src/features/profile/stores/profile-gallery-store';
import { useProfileStore } from '@/src/features/profile/stores/profile-store';
import type { ProfileGalleryImage } from '@/src/features/profile/types';
import { getProfileDisciplineLines } from '@/src/features/profile/utils';
import { getExhibitionLayout } from '@/src/features/profile/utils/exhibition-layout';

const ICON_SIZE = 20;
const ICON_BAR_LINE_COLOR = colors.textTertiary;
const ICON_BAR_LINE_IMMERSIVE = 'rgba(255, 255, 255, 0.28)';
const GALLERY_TRANSITION_MS = 360;
const GALLERY_TRANSITION_EASING = Easing.bezier(0.4, 0, 0.2, 1);
type ProfileIconActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  isActive?: boolean;
  isImmersive?: boolean;
  onPress?: () => void;
};

function ProfileIconAction({
  icon,
  accessibilityLabel,
  isActive = false,
  isImmersive = false,
  onPress,
}: ProfileIconActionProps) {
  const handlePress = onPress ?? (() => undefined);
  const iconColor = isActive
    ? isImmersive
      ? colors.white
      : colors.primaryStrong
    : isImmersive
      ? 'rgba(255, 255, 255, 0.88)'
      : colors.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isActive ? { selected: true } : undefined}
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      style={({ pressed }) => [styles.iconAction, pressed && onPress && styles.iconActionPressed]}>
      <Ionicons name={icon} size={ICON_SIZE} color={iconColor} />
      <View
        style={[
          styles.iconActiveIndicator,
          !isActive && styles.iconActiveIndicatorHidden,
          isActive && isImmersive && styles.iconActiveIndicatorImmersive,
        ]}
      />
    </Pressable>
  );
}

export default function MyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useProfileStore((state) => state.profile);
  const galleryImages = useProfileGalleryStore((state) => state.images);
  const disciplineLines = getProfileDisciplineLines(profile);
  const [selectedImage, setSelectedImage] = useState<ProfileGalleryImage | null>(null);
  const [renderExhibition, setRenderExhibition] = useState(false);
  const [ambientUri, setAmbientUri] = useState<string | null>(galleryImages[0]?.uri ?? null);
  const [showImmersiveChrome, setShowImmersiveChrome] = useState(false);
  const transitionProgress = useSharedValue(0);

  const topInset = insets.top + spacing.lg + spacing.xl;
  const bottomInset = getTabBarChromeHeight(insets.bottom);
  const exhibitionLayout = useMemo(
    () =>
      getExhibitionLayout({
        screenHeight: Dimensions.get('window').height,
        topInset,
        bottomTabInset: bottomInset,
      }),
    [bottomInset, topInset],
  );
  const isImmersive = showImmersiveChrome;

  const finishExitExhibition = useCallback(() => {
    setRenderExhibition(false);
    setShowImmersiveChrome(false);
  }, []);

  const openDiverProfile = useCallback(() => {
    router.push('/(tabs)/my/profile');
  }, [router]);

  const openGear = useCallback(() => {
    router.push('/(tabs)/my/gear');
  }, [router]);

  const openSettings = useCallback(() => {
    Alert.alert('준비 중', '설정 기능은 곧 제공됩니다.');
  }, []);

  const handleActiveImageChange = useCallback((image: ProfileGalleryImage) => {
    setAmbientUri(image.uri);
  }, []);

  const toggleGalleryMode = useCallback(() => {
    if (renderExhibition) {
      cancelAnimation(transitionProgress);
      transitionProgress.value = withTiming(
        0,
        { duration: GALLERY_TRANSITION_MS, easing: GALLERY_TRANSITION_EASING },
        (finished) => {
          if (finished) {
            runOnJS(finishExitExhibition)();
          }
        },
      );
      return;
    }

    const initialImage = galleryImages[0];
    if (initialImage) {
      setAmbientUri(initialImage.uri);
    }
    setRenderExhibition(true);
    setShowImmersiveChrome(true);
    cancelAnimation(transitionProgress);
    transitionProgress.value = 0;
    transitionProgress.value = withTiming(1, {
      duration: GALLERY_TRANSITION_MS,
      easing: GALLERY_TRANSITION_EASING,
    });
  }, [finishExitExhibition, galleryImages, renderExhibition, transitionProgress]);

  const gridLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(transitionProgress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
  }));

  const exhibitionLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(transitionProgress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const iconBarBorderColor = isImmersive ? ICON_BAR_LINE_IMMERSIVE : ICON_BAR_LINE_COLOR;

  return (
    <ScreenLayout
      contentContainerStyle={styles.content}
      contentTopSpacing={spacing.xl}
      scrollEnabled={!renderExhibition}>
      {renderExhibition ? (
        <ProfileGalleryAmbientBackground
          uri={ambientUri}
          progress={transitionProgress}
          topInset={topInset}
          bottomInset={bottomInset}
        />
      ) : null}

      <View style={styles.foreground}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다이버 프로필 열기"
          onPress={openDiverProfile}
          style={({ pressed }) => [
            styles.profileSection,
            pressed && styles.profileSectionPressed,
          ]}>
          <View style={styles.profileRow}>
            <ProfileAvatar imageUrl={profile.profileImageUrl} size={88} />
            <View style={styles.identityBlock}>
              <AppText
                variant="h2"
                style={[styles.name, isImmersive && styles.nameImmersive]}>
                {profile.displayName}
              </AppText>
              <View style={styles.disciplineBlock}>
                {disciplineLines.map((line) => (
                  <AppText
                    key={line}
                    variant="bodySmall"
                    style={[
                      styles.disciplineText,
                      isImmersive && styles.disciplineTextImmersive,
                    ]}>
                    {line}
                  </AppText>
                ))}
              </View>
              {profile.bio ? (
                <AppText
                  variant="bodySmall"
                  style={[styles.bio, isImmersive && styles.bioImmersive]}>
                  {profile.bio}
                </AppText>
              ) : null}
            </View>
          </View>
        </Pressable>

        <View style={[styles.iconBar, { borderBottomColor: iconBarBorderColor }]}>
          <ProfileIconAction
            icon="construct-outline"
            accessibilityLabel="내 장비"
            isImmersive={isImmersive}
            onPress={openGear}
          />
          <View style={[styles.iconBarDivider, { backgroundColor: iconBarBorderColor }]} />
          <ProfileIconAction
            icon={renderExhibition ? 'grid' : 'grid-outline'}
            accessibilityLabel="갤러리"
            isActive={renderExhibition}
            isImmersive={isImmersive}
            onPress={toggleGalleryMode}
          />
          <View style={[styles.iconBarDivider, { backgroundColor: iconBarBorderColor }]} />
          <ProfileIconAction
            icon="settings-outline"
            accessibilityLabel="설정"
            isImmersive={isImmersive}
            onPress={openSettings}
          />
        </View>

        <View style={styles.galleryStage}>
          <Animated.View
            collapsable={false}
            pointerEvents={renderExhibition ? 'none' : 'auto'}
            style={gridLayerStyle}>
            <ProfileGalleryGrid onImagePress={setSelectedImage} />
          </Animated.View>

          {renderExhibition ? (
            <Animated.View
              collapsable={false}
              style={[
                exhibitionLayerStyle,
                styles.exhibitionOverlay,
                { height: exhibitionLayout.stageHeight },
              ]}>
              <ProfileGalleryExhibition
                layout={exhibitionLayout}
                onImagePress={setSelectedImage}
                onActiveImageChange={handleActiveImageChange}
              />
            </Animated.View>
          ) : null}
        </View>
      </View>

      <ProfileGalleryViewer image={selectedImage} onClose={() => setSelectedImage(null)} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    gap: 0,
  },
  foreground: {
    zIndex: 1,
  },
  profileSection: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  profileSectionPressed: {
    opacity: 0.7,
  },
  iconBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
  },
  iconAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  iconActiveIndicator: {
    width: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primaryStrong,
  },
  iconActiveIndicatorHidden: {
    opacity: 0,
  },
  iconActiveIndicatorImmersive: {
    backgroundColor: colors.white,
  },
  iconActionPressed: {
    opacity: 0.6,
  },
  iconBarDivider: {
    width: StyleSheet.hairlineWidth,
  },
  galleryStage: {
    position: 'relative',
    overflow: 'visible',
  },
  exhibitionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'visible',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  identityBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
  },
  nameImmersive: {
    color: colors.white,
  },
  disciplineBlock: {
    gap: 2,
  },
  disciplineText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  disciplineTextImmersive: {
    color: 'rgba(255, 255, 255, 0.78)',
  },
  bio: {
    color: colors.textPrimary,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  bioImmersive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
