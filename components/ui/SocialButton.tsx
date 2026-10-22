import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/lib/theme';

type Provider = 'google' | 'apple';

const CONFIG: Record<Provider, { label: string; icon: keyof typeof Ionicons.glyphMap; bg: string; border?: string; text: string }> = {
  google: { label: 'Continue with Google', icon: 'logo-google', bg: '#fff', border: colors.border, text: colors.textPrimary },
  apple: { label: 'Continue with Apple', icon: 'logo-apple', bg: '#000', text: '#fff' },
};

export function SocialButton({
  provider,
  onPress,
  loading,
  disabled,
  style,
}: {
  provider: Provider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const config = CONFIG[provider];
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: config.bg, borderColor: config.border ?? config.bg },
        pressed && styles.pressed,
        (loading || disabled) && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={config.text} />
      ) : (
        <>
          <Ionicons name={config.icon} size={18} color={config.text} />
          <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  label: { fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
});
