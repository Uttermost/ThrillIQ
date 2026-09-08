import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '@/lib/theme';

// Same checkbox visual as the adventure-guidelines agreement in
// app/adventure/[id].tsx, reused here for the equivalent signup gate.
interface TermsConsentCheckboxProps {
  checked: boolean;
  onToggle: () => void;
}

export function TermsConsentCheckbox({ checked, onToggle }: TermsConsentCheckboxProps) {
  // Deliberately NOT one big row-level Pressable: the label wraps onto
  // multiple lines and contains inline links, so a tap anywhere in the row
  // (including squarely on "Terms of Service") would sometimes land on a
  // link instead of toggling — the link should always win there. Only the
  // checkbox glyph itself (with generous hitSlop) toggles; the two links
  // stay independently tappable via nested <Text onPress>.
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        accessibilityLabel={checked ? 'Unagree to Terms and Privacy Policy' : 'Agree to Terms and Privacy Policy'}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>{checked && <Ionicons name="checkmark" size={14} color="#fff" />}</View>
      </Pressable>
      <Text style={styles.label}>
        I agree to the{' '}
        <Text style={styles.link} onPress={() => router.push('/legal/terms')}>
          Terms of Service
        </Text>{' '}
        and{' '}
        <Text style={styles.link} onPress={() => router.push('/legal/privacy')}>
          Privacy Policy
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { ...type.secondary, flex: 1 },
  link: { color: colors.primary, fontWeight: '600' },
});
