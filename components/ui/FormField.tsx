import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing, type } from '@/lib/theme';

interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
}

// The input system every text field in the app should go through: label,
// optional hint (explains the field, doesn't repeat the label), required
// indicator, error state, focus ring, and a live character count when
// maxLength is set. Placeholder is still supported but is never the only
// label — see design-system section 9.
export function FormField({ label, hint, error, required, maxLength, value, onFocus, onBlur, ...inputProps }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const length = typeof value === 'string' ? value.length : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
        {maxLength ? (
          <Text style={[styles.count, length > maxLength && styles.countOver]}>
            {length}/{maxLength}
          </Text>
        ) : null}
      </View>
      <TextInput
        value={value}
        maxLength={maxLength}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, focused && styles.inputFocused, !!error && styles.inputError]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...inputProps}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  label: { ...type.inputLabel },
  required: { color: colors.error },
  count: { ...type.caption, color: colors.textMuted },
  countOver: { color: colors.error },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 50,
    ...type.input,
    color: colors.textPrimary,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.error },
  hint: { ...type.secondary, color: colors.textMuted },
  errorText: { ...type.secondary, color: colors.error },
});
