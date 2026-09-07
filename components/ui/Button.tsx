import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, controlHeight, radius, spacing, type } from '@/lib/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'secondary' || variant === 'ghost' ? styles.secondaryHeight : styles.primaryHeight,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? colors.textPrimary : '#fff'} />
      ) : (
        <Text style={[styles.label, textVariantStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryHeight: { minHeight: controlHeight.button },
  secondaryHeight: { minHeight: controlHeight.buttonSecondary },
  label: { ...type.button },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.textPrimary },
  secondary: { backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: 'transparent' },
};

const textVariantStyles: Record<Variant, { color: string }> = {
  primary: { color: '#fff' },
  secondary: { color: colors.textPrimary },
  danger: { color: '#fff' },
  ghost: { color: colors.textPrimary },
};
