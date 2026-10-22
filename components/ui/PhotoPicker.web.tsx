import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '@/lib/theme';

interface PhotoPickerProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.7;

// Downscales in-browser via canvas and returns a JPEG data URI — there's no
// Firebase Storage bucket deployed for this project, so photos are stored
// inline (see Review.photos) rather than uploaded to a CDN.
function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Could not read image.'));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not process image.'));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Cast for the same reason as DateTimeField.web.tsx's Input — React Native's
// types don't know about DOM host elements, and this file only runs on web.
const FileInput = 'input' as unknown as React.FC<React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement>; style?: unknown }>;

export function PhotoPicker({ photos, onChange, max = 3 }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = max - photos.length;

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Guard against a negative slice bound: -N drops the last N items
    // instead of returning none, so a stale `remaining` must never go
    // below zero here even though the UI already hides the add button at 0.
    const files = Array.from(e.target.files ?? []).slice(0, Math.max(0, remaining));
    e.target.value = '';
    if (files.length === 0) return;
    // allSettled, not all: one corrupt/unreadable file in a multi-select
    // shouldn't silently discard the others that decoded fine.
    const results = await Promise.allSettled(files.map(fileToDataUri));
    const dataUris = results.filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled').map((r) => r.value);
    if (dataUris.length > 0) onChange([...photos, ...dataUris]);
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
          <Pressable style={styles.addBtn} onPress={() => inputRef.current?.click()}>
            <Ionicons name="camera-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
      <FileInput ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
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
});
