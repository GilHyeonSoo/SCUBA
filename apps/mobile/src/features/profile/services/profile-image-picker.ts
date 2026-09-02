import { Alert, type AlertButton } from 'react-native';

import type { ImagePickerOptions } from 'expo-image-picker';

type ImagePickerModule = typeof import('expo-image-picker');

const pickerOptions: ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
};

async function loadImagePicker(): Promise<ImagePickerModule | null> {
  try {
    return await import('expo-image-picker');
  } catch {
    return null;
  }
}

function showNativeModuleMissingAlert() {
  Alert.alert(
    '앱 재빌드 필요',
    '프로필 사진 변경을 사용하려면 개발 빌드를 다시 실행해야 합니다.\n\n터미널에서 pnpm ios 또는 pnpm android를 실행해 주세요.',
  );
}

async function withImagePicker<T>(
  handler: (imagePicker: ImagePickerModule) => Promise<T>,
): Promise<T | null> {
  const imagePicker = await loadImagePicker();
  if (!imagePicker) {
    showNativeModuleMissingAlert();
    return null;
  }

  try {
    return await handler(imagePicker);
  } catch {
    showNativeModuleMissingAlert();
    return null;
  }
}

async function pickFromLibrary(): Promise<string | null> {
  return withImagePicker(async (ImagePicker) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 선택하려면 갤러리 접근 권한이 필요합니다.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    if (result.canceled || !result.assets[0]?.uri) {
      return null;
    }

    return result.assets[0].uri;
  });
}

async function takePhoto(): Promise<string | null> {
  return withImagePicker(async (ImagePicker) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진을 촬영하려면 카메라 접근 권한이 필요합니다.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync(pickerOptions);
    if (result.canceled || !result.assets[0]?.uri) {
      return null;
    }

    return result.assets[0].uri;
  });
}

type ProfileImagePickerOptions = {
  hasImage: boolean;
  onSelect: (uri: string) => void;
  onRemove?: () => void;
};

export function openProfileImagePicker({
  hasImage,
  onSelect,
  onRemove,
}: ProfileImagePickerOptions) {
  const options: AlertButton[] = [
    {
      text: '사진 보관함에서 선택',
      onPress: async () => {
        const uri = await pickFromLibrary();
        if (uri) {
          onSelect(uri);
        }
      },
    },
    {
      text: '카메라로 촬영',
      onPress: async () => {
        const uri = await takePhoto();
        if (uri) {
          onSelect(uri);
        }
      },
    },
  ];

  if (hasImage && onRemove) {
    options.push({
      text: '사진 삭제',
      style: 'destructive',
      onPress: onRemove,
    });
  }

  options.push({
    text: '취소',
    style: 'cancel',
  });

  Alert.alert('프로필 사진 변경', '사진을 선택하는 방법을 고르세요.', options, {
    cancelable: true,
  });
}
