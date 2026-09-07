import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { PhotoPicker } from '@/components/ui/PhotoPicker';
import { useApp } from '@/lib/store';
import { colors, CONTENT_MAX_WIDTH, radius, spacing, type } from '@/lib/theme';
import { Post } from '@/lib/types';

const POST_MAX = 500;

interface EditPostSheetProps {
  visible: boolean;
  onClose: () => void;
  post: Post;
}

export function EditPostSheet({ visible, onClose, post }: EditPostSheetProps) {
  const { updatePost } = useApp();
  const { width } = useWindowDimensions();
  const isWide = width > CONTENT_MAX_WIDTH;
  const [text, setText] = useState(post.text);
  const [photos, setPhotos] = useState<string[]>(post.photos ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-seed from the current post each time the sheet opens, rather than
  // once on mount — PostCard keeps this sheet mounted the whole time, so a
  // stale open (edit, close without saving, edit again) must start fresh
  // from what's actually on the post today, not what the last draft left.
  useEffect(() => {
    if (visible) {
      setText(post.text);
      setPhotos(post.photos ?? []);
      setError(null);
    }
  }, [visible, post.text, post.photos]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await updatePost(post.id, { text, photos });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, isWide && styles.sheetCentered]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Edit post</Text>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Share something with the community…"
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={POST_MAX}
          style={styles.input}
        />
        <PhotoPicker photos={photos} onChange={setPhotos} max={3} />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.actionsRow}>
          <Button label="Save changes" onPress={handleSave} disabled={!text.trim()} loading={saving} style={styles.actionBtn} />
          <Button label="Cancel" variant="secondary" onPress={onClose} disabled={saving} style={styles.actionBtn} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sheetCentered: {
    left: undefined,
    right: undefined,
    alignSelf: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center' },
  title: { ...type.sectionHeading },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 80,
    textAlignVertical: 'top',
    ...type.body,
    color: colors.textPrimary,
  },
  errorText: { ...type.secondary, color: colors.danger },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1 },
});
