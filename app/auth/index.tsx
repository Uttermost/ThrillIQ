import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { SocialButton } from '@/components/ui/SocialButton';
import { InlineError } from '@/components/ui/StateViews';
import { MountainScene } from '@/components/ui/MountainScene';
import { SocialProvider, useApp } from '@/lib/store';
import { colors, spacing, typography } from '@/lib/theme';

export default function AuthLanding() {
  const { signInWithProvider, termsAccepted, acceptTerms } = useApp();
  const [agreed, setAgreed] = useState(termsAccepted);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleAgreed = () => {
    const next = !agreed;
    setAgreed(next);
    if (next) acceptTerms();
  };

  const handleSocial = async (provider: SocialProvider) => {
    if (!agreed) return;
    setLoadingProvider(provider);
    setError(null);
    try {
      await signInWithProvider(provider);
      router.replace('/(tabs)/discover');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const goTo = (path: '/auth/email' | '/auth/phone') => {
    if (!agreed) return;
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <MountainScene height={140} />
        <Text style={styles.title}>Welcome to ThrillIQ</Text>
        <Text style={styles.subtitle}>Sign in or create an account to start exploring.</Text>

        <View style={styles.group}>
          <SocialButton provider="google" onPress={() => handleSocial('google')} loading={loadingProvider === 'google'} disabled={!agreed} />
          <SocialButton provider="apple" onPress={() => handleSocial('apple')} loading={loadingProvider === 'apple'} disabled={!agreed} />
        </View>

        {error && <InlineError message={error} onRetry={() => setError(null)} retryLabel="Dismiss" />}

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.group}>
          <Button
            label="Continue with email"
            variant="secondary"
            onPress={() => goTo('/auth/email')}
            disabled={!agreed}
          />
          <Button
            label="Continue with phone number"
            variant="secondary"
            onPress={() => goTo('/auth/phone')}
            disabled={!agreed}
          />
        </View>

        <Checkbox checked={agreed} onToggle={toggleAgreed} style={styles.terms}>
          <Text style={styles.termsText}>
            I agree to ThrillIQ's{' '}
            <Text style={styles.termsLink} onPress={() => router.push('/legal/terms')}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={styles.termsLink} onPress={() => router.push('/legal/privacy')}>
              Privacy Policy
            </Text>
            .
          </Text>
        </Checkbox>

        <Text style={styles.disclaimer}>New here? We'll create your account automatically.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.lg },
  title: { ...typography.title, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  group: { gap: spacing.sm },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: { ...typography.small },
  disclaimer: { ...typography.small, textAlign: 'center' },
  terms: { paddingHorizontal: spacing.xs },
  termsText: { ...typography.caption, lineHeight: 18 },
  termsLink: { color: colors.textPrimary, fontWeight: '600' },
});
