import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';

import { colors, shadows } from '@/src/constants';

type ProfileMapMarkerPinProps = {
  profileImageUrl?: string | null;
  isCurrentUser?: boolean;
};

export function ProfileMapMarkerPin({
  profileImageUrl,
  isCurrentUser = false,
}: ProfileMapMarkerPinProps) {
  return (
    <View
      style={[
        styles.ring,
        isCurrentUser ? styles.ringCurrentUser : styles.ringOther,
        shadows.sm,
      ]}>
      <View style={styles.avatar}>
        {profileImageUrl ? (
          <Image source={{ uri: profileImageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="person" size={18} color={colors.primary} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    backgroundColor: colors.white,
  },
  ringCurrentUser: {
    borderColor: colors.error,
  },
  ringOther: {
    borderColor: colors.white,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
});
