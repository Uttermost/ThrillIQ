import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { InlineError } from '@/components/ui/StateViews';
import { TermsConsentCheckbox } from '@/components/ui/TermsConsent';
import { useApp } from '@/lib/store';
import { colors, radius, spacing } from '@/lib/theme';

export default function PhoneAuth() {
  const { sendPhoneCode } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+254');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, '');
  const canContinue = name.trim().length > 0 && digits.length >= 9 && agreed;

  const handleSendCode = async () => {
    if (!canContinue) return;
    // Firebase's phone auth requires strict E.164 (+ and digits only) — the
    // placeholder shows spaces as a formatting hint, so strip them here
    // regardless of how the user actually typed it.
    const normalizedPhone = `+${digits}`;
    setLoading(true);
    setError(null);
    try {
      await sendPhoneCode(normalizedPhone);
      router.push({ pathname: '/auth/otp', params: { phone: normalizedPhone, name } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Continue with phone" />
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="words"
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+254 7XX XXX XXX"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
        />

        <TermsConsentCheckbox checked={agreed} onToggle={() => setAgreed((v) => !v)} />
        <Button label="Send code" onPress={handleSendCode} disabled={!canContinue} loading={loading} style={{ marginTop: spacing.sm }} />
        {error && <InlineError message={error} onRetry={handleSendCode} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
