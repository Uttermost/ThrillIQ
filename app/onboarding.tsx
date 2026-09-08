import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { MountainScene } from '@/components/ui/MountainScene';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';

export default function Onboarding() {
  const { completeOnboarding, authenticated } = useApp();

  const handleGetStarted = async () => {
    await completeOnboarding();
    // Same landing logic as app/index.tsx: signed-out web visitors get the
    // marketing homepage, everyone else goes straight to Discover.
    if (Platform.OS === 'web' && !authenticated) {
      router.replace('/home');
    } else {
      router.replace('/(tabs)/discover');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <MountainScene height={180} />
        <Text style={styles.title}>Meet. Explore. Belong.</Text>
        <Text style={styles.subtitle}>Find real adventures near Nairobi, hosted by people you can message directly.</Text>

        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} style={{ marginTop: 1 }} />
          <Text style={styles.noticeText}>Adventures are run independently. Pay organizers directly, not through this app.</Text>
        </View>

        <Button label="Get started" onPress={handleGetStarted} style={styles.cta} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
    ...typography.caption,
  },
  cta: {
    marginTop: spacing.md,
  },
});
