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

export default function EmailAuth() {
  const { signInWithEmail } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = name.trim().length > 0 && email.trim().length > 0 && password.length > 0 && agreed;

  const handleContinue = async () => {
    if (!canContinue) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail({ name, email, password });
      router.replace('/(tabs)/discover');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Continue with email" />
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
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          secureTextEntry
          textContentType="password"
        />

        <TermsConsentCheckbox checked={agreed} onToggle={() => setAgreed((v) => !v)} />
        <Button label="Continue" onPress={handleContinue} disabled={!canContinue} loading={loading} style={{ marginTop: spacing.sm }} />
        {error && <InlineError message={error} onRetry={handleContinue} />}
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
