import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DESKTOP_CONTENT_MAX_WIDTH, colors, spacing, type } from '@/lib/theme';

const EXPLORE_LINKS = [
  { label: 'Discover', href: '/discover' },
  { label: 'Feed', href: '/feed' },
  { label: 'People', href: '/connections' },
  { label: 'Crews', href: '/crews' },
];

// About/FAQs/Safety now exist as real pages — see app/about.tsx,
// app/faqs.tsx, app/safety.tsx. Legal pages (Terms, Privacy, etc.) still
// don't, so they stay out of this list rather than linking nowhere.
const COMPANY_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Safety', href: '/safety' },
];

export function PublicFooter() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionInner}>
        <Text style={styles.footerLogo}>ThrillIQ</Text>
        <Text style={styles.footerTagline}>Think. Explore. Connect.</Text>
        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.columnHeading}>Explore</Text>
            {EXPLORE_LINKS.map((link) => (
              <Pressable key={link.href} onPress={() => router.push(link.href as never)} hitSlop={8}>
                <Text style={styles.linkText}>{link.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.column}>
            <Text style={styles.columnHeading}>Company</Text>
            {COMPANY_LINKS.map((link) => (
              <Pressable key={link.href} onPress={() => router.push(link.href as never)} hitSlop={8}>
                <Text style={styles.linkText}>{link.label}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => router.push('/auth')} hitSlop={8}>
              <Text style={styles.linkText}>Sign in</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.copyright}>© {new Date().getFullYear()} ThrillIQ. Adventures are run independently by their organizers.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { alignItems: 'center', backgroundColor: colors.surfaceMuted },
  sectionInner: { width: '100%', maxWidth: DESKTOP_CONTENT_MAX_WIDTH, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
  footerLogo: { ...type.sectionHeading, color: colors.primary, fontWeight: '800' },
  footerTagline: { ...type.secondary, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.xl },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxxl, marginBottom: spacing.lg },
  column: { gap: spacing.sm, minWidth: 120 },
  columnHeading: { ...type.bodyEmphasis, marginBottom: spacing.xs },
  linkText: { ...type.secondary, color: colors.textSecondary },
  copyright: { ...type.secondary, color: colors.textMuted },
});
