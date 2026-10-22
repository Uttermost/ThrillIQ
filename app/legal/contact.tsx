import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { colors, radius, spacing, type } from '@/lib/theme';

interface ContactOption {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  email: string;
}

// Same addresses already promised in the Privacy Policy and Terms of
// Service — keep this list in sync with those if either changes.
const OPTIONS: ContactOption[] = [
  {
    icon: 'help-buoy-outline',
    title: 'General support',
    description: 'Questions about using the app, an adventure, or your account.',
    email: 'support@thrilliq.com',
  },
  {
    icon: 'warning-outline',
    title: 'Safety concerns',
    description:
      "For a safety issue that needs attention beyond a single post or profile. To report specific content, use the flag icon on it instead — that goes straight to our moderation queue.",
    email: 'safety@thrilliq.com',
  },
  {
    icon: 'shield-outline',
    title: 'Privacy',
    description: 'Questions about your data, or to request your account be deleted.',
    email: 'privacy@thrilliq.com',
  },
  {
    icon: 'document-text-outline',
    title: 'Legal',
    description: 'Questions about our Terms of Service.',
    email: 'legal@thrilliq.com',
  },
];

export default function Contact() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Contact & support" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Check the{' '}
          <Text style={styles.link} onPress={() => router.push('/legal/faq')}>
            FAQ
          </Text>{' '}
          first — many common questions are already answered there. Otherwise, here's how to reach us.
        </Text>

        {OPTIONS.map((option) => (
          <Pressable key={option.email} style={styles.card} onPress={() => Linking.openURL(`mailto:${option.email}`)}>
            <View style={styles.cardIcon}>
              <Ionicons name={option.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{option.title}</Text>
              <Text style={styles.cardDescription}>{option.description}</Text>
              <Text style={styles.cardEmail}>{option.email}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl * 2 },
  intro: { ...type.body, color: colors.textSecondary, marginBottom: spacing.sm },
  link: { color: colors.primary, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { ...type.bodyEmphasis },
  cardDescription: { ...type.secondary, color: colors.textSecondary },
  cardEmail: { ...type.secondary, color: colors.primary, fontWeight: '600', marginTop: 2 },
});
