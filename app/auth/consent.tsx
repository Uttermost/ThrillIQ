import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/StateViews';
import { TermsConsentCheckbox } from '@/components/ui/TermsConsent';
import { CURRENT_TERMS_VERSION } from '@/lib/legal';
import { useApp } from '@/lib/store';
import { colors, spacing, typography } from '@/lib/theme';

// Reached only via app/_layout.tsx's AuthGate, for a session that's
// authenticated but has no recorded Terms/Privacy agreement — a signed-in
// account from before this field existed, most realistically. Every normal
// sign-in path already requires this checkbox before it ever gets here, so
// this screen only exists to close that one gap, not as a second copy of
// the signup flow's own gating.
export default function ConsentGate() {
  const { updateProfile, signOut } = useApp();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!agreed) return;
    setLoading(true);
    setError(null);
    try {
      await updateProfile({ agreedToTermsAt: Date.now(), agreedToTermsVersion: CURRENT_TERMS_VERSION });
      router.replace('/(tabs)/discover');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Our Terms have been updated</Text>
        <Text style={styles.subtitle}>Please review and agree to continue using ThrillIQ.</Text>

        <TermsConsentCheckbox checked={agreed} onToggle={() => setAgreed((v) => !v)} />

        {error && <InlineError message={error} onRetry={handleContinue} />}

        <Button label="Agree & continue" onPress={handleContinue} disabled={!agreed} loading={loading} />
        <Button label="Log out instead" variant="ghost" onPress={handleLogOut} disabled={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.lg },
  title: { ...typography.title, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
