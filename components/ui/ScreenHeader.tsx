import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/lib/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onEdit?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
}

export function ScreenHeader({ title, subtitle, onEdit, actionIcon = 'pencil', actionLabel = 'Edit' }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back} accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </Pressable>
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onEdit ? (
        <Pressable onPress={onEdit} hitSlop={12} accessibilityLabel={actionLabel}>
          <Ionicons name={actionIcon} size={20} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <View style={{ width: 22 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  back: { width: 22 },
  titleWrap: { flex: 1 },
  title: { ...typography.subheading },
  subtitle: { ...typography.small, marginTop: 1 },
});
