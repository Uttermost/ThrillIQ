import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { InlineError } from '@/components/ui/StateViews';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';

export default function VerifyOtp() {
  const { phone, name } = useLocalSearchParams<{ phone: string; name: string }>();
  const { verifyPhoneCode, sendPhoneCode } = useApp();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      await verifyPhoneCode({ phone, name, code });
      router.replace('/(tabs)/discover');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    try {
      await sendPhoneCode(phone);
      setResent(true);
    } catch {
      setResent(false);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Enter code" subtitle={phone} />
      <View style={styles.content}>
        <Text style={styles.hint}>We sent a 6-digit code to {phone}.</Text>
        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
          placeholder="······"
          placeholderTextColor={colors.textMuted}
          style={styles.codeInput}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Button label="Verify" onPress={handleVerify} disabled={code.length !== 6} loading={loading} />
        {error && <InlineError message={error} onRetry={handleVerify} />}

        <Pressable onPress={handleResend} disabled={resending} style={styles.resendRow}>
          <Text style={styles.resendText}>{resending ? 'Resending…' : 'Resend code'}</Text>
        </Pressable>
        {resent && <Text style={styles.resentText}>✓ Code resent.</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  hint: { ...typography.caption },
  codeInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  resendRow: { alignItems: 'center', marginTop: spacing.sm },
  resendText: { color: colors.accent, fontWeight: '600', fontSize: 14 },
  resentText: { color: colors.success, textAlign: 'center', fontSize: 13 },
});
