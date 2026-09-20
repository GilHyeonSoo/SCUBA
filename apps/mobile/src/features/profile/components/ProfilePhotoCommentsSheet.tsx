import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/components/ui';
import { colors, radius, spacing } from '@/src/constants';
import { usePhotoCommentsState } from '@/src/features/social/hooks/usePhotoSocialState';
import type { PhotoComment } from '@/src/features/social/types';

type ProfilePhotoCommentsSheetProps = {
  photoId: string | null;
  visible: boolean;
  onClose: () => void;
  authorDisplayName?: string;
};

function formatCommentTime(createdAt: number): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function ProfilePhotoCommentsSheet({
  photoId,
  visible,
  onClose,
  authorDisplayName = '다이버',
}: ProfilePhotoCommentsSheetProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const { comments, addComment, isSubmitting } = usePhotoCommentsState(
    photoId,
    authorDisplayName,
  );

  const handleSubmit = () => {
    if (!photoId || draft.trim().length === 0 || isSubmitting) {
      return;
    }

    addComment(draft);
    setDraft('');
  };

  const renderItem = ({ item }: { item: PhotoComment }) => (
    <View style={styles.commentRow}>
      <AppText variant="label" style={styles.commentAuthor}>
        {item.userDisplayName}
      </AppText>
      <AppText variant="bodySmall" style={styles.commentBody}>
        {item.body}
      </AppText>
      <AppText variant="caption" style={styles.commentTime}>
        {formatCommentTime(item.createdAt)}
      </AppText>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.sheetWrap, { paddingBottom: insets.bottom }]}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <AppText variant="h3" style={styles.title}>
            댓글
          </AppText>

          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <AppText variant="bodySmall" style={styles.empty}>
                첫 댓글을 남겨보세요.
              </AppText>
            }
          />

          <View style={styles.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="댓글 추가..."
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="댓글 등록"
              disabled={draft.trim().length === 0 || isSubmitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.sendButton,
                draft.trim().length === 0 && styles.sendButtonDisabled,
                pressed && styles.sendButtonPressed,
              ]}>
              <AppText variant="label" color="primary">
                게시
              </AppText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  sheetWrap: {
    maxHeight: '72%',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    minHeight: 280,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    marginBottom: spacing.sm,
  },
  title: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  empty: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  commentRow: {
    gap: 2,
  },
  commentAuthor: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  commentBody: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 21,
  },
  commentTime: {
    color: colors.textTertiary,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  input: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sendButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonPressed: {
    opacity: 0.7,
  },
});
