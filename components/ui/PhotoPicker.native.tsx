import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '@/lib/theme';

interface PhotoPickerProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}

// There's no Firebase Storage bucket deployed for this project, so photos
// are kept as inline base64 data URIs (see Review.photos) rather than
// uploaded to a CDN — quality is kept low to bound Firestore document size.
export function PhotoPicker({ photos, onChange, max = 3 }: PhotoPickerProps) {
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const remaining = max - photos.length;

  const handlePick = async () => {
    if (remaining <= 0) return;
    setPicking(true);
    setError(null);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Photo library permission denied.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.5,
        allowsMultipleSelection: true,
        selectionLimit: remaining,
      });
      if (result.canceled) return;
      // expo-image-picker's own docs guarantee `base64` is always JPEG-encoded
      // regardless of the source file's format (asset.mimeType reports the
      // *original* file's type, e.g. image/png, which would mismatch the
      // actual bytes here) — the data URI's declared type must say JPEG.
      const dataUris = result.assets.filter((a) => !!a.base64).map((a) => `data:image/jpeg;base64,${a.base64}`);
      onChange([...photos, ...dataUris]);
    } catch {
      setError("Couldn't load photos.");
    } finally {
      setPicking(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {photos.map((uri, i) => (
          <View key={i} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} />
            <Pressable
              onPress={() => onChange(photos.filter((_, idx) => idx !== i))}
              style={styles.removeBtn}
              accessibilityLabel="Remove photo">
              <Ionicons name="close" size={12} color="#fff" />
            </Pressable>
          </View>
        ))}
        {remaining > 0 && (
          <Pressable style={styles.addBtn} onPress={handlePick} disabled={picking}>
            <Ionicons name="camera-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorHint}>{error}</Text>}
      <Text style={styles.hint}>Optional — add up to {max} photos from the day.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  thumbWrap: { width: 64, height: 64 },
  thumb: { width: 64, height: 64, borderRadius: radius.md },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  hint: { ...type.secondary, color: colors.textMuted },
  errorHint: { ...type.secondary, color: colors.danger },
});
