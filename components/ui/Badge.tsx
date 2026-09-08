import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/lib/theme';

type Tone = 'hosting' | 'success' | 'neutral' | 'accent' | 'danger';

export function Badge({ label, tone = 'neutral', style }: { label: string; tone?: Tone; style?: ViewStyle }) {
  const palette = tones[tone];
  return (
    <View style={[styles.base, { backgroundColor: palette.bg }, style]}>
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const tones: Record<Tone, { bg: string; text: string }> = {
  hosting: { bg: 'rgba(0,0,0,0.55)', text: '#fff' },
  success: { bg: colors.successBg, text: colors.success },
  neutral: { bg: colors.surfaceMuted, text: colors.textSecondary },
  accent: { bg: colors.accentMuted, text: colors.accent },
  danger: { bg: colors.dangerBg, text: colors.danger },
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
