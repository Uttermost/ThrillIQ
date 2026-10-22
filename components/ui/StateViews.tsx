import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { colors, spacing, typography } from '@/lib/theme';

export function EmptyState({ icon, title, message }: { icon: keyof typeof Ionicons.glyphMap; title: string; message: string }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={32} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export function ErrorState({ title, message, onRetry, retryLabel = 'Retry' }: { title: string; message: string; onRetry: () => void; retryLabel?: string }) {
  return (
    <View style={styles.container}>
      <Ionicons name="warning-outline" size={32} color={colors.danger} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Button label={retryLabel} onPress={onRetry} variant="primary" style={{ marginTop: spacing.md, minWidth: 120 }} />
    </View>
  );
}

export function InlineError({ message, onRetry, retryLabel = 'Retry' }: { message: string; onRetry: () => void; retryLabel?: string }) {
  return (
    <View style={styles.inline}>
      <Text style={styles.inlineText}>⚠ {message}</Text>
      <Button label={retryLabel} onPress={onRetry} variant="danger" style={styles.inlineButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    ...typography.subheading,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...typography.caption,
    textAlign: 'center',
  },
  inline: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  inlineText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  inlineButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
