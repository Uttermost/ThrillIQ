import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { SocialButton } from '@/components/ui/SocialButton';
import { InlineError } from '@/components/ui/StateViews';
import { MountainScene } from '@/components/ui/MountainScene';
import { SocialProvider, useApp } from '@/lib/store';
import { colors, spacing, typography } from '@/lib/theme';

export default function AuthLanding() {
  const { signInWithProvider } = useApp();
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSocial = async (provider: SocialProvider) => {
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <MountainScene height={140} />
        <Text style={styles.title}>Welcome to ThrillIQ</Text>
        <Text style={styles.subtitle}>Sign in or create an account to start exploring.</Text>

        <View style={styles.group}>
          <SocialButton provider="google" onPress={() => handleSocial('google')} loading={loadingProvider === 'google'} />
          <SocialButton provider="apple" onPress={() => handleSocial('apple')} loading={loadingProvider === 'apple'} />
        </View>

        {error && <InlineError message={error} onRetry={() => setError(null)} retryLabel="Dismiss" />}

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.group}>
          <Button label="Continue with email" variant="secondary" onPress={() => router.push('/auth/email')} />
          <Button label="Continue with phone number" variant="secondary" onPress={() => router.push('/auth/phone')} />
        </View>

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
});
