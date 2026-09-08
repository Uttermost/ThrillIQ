import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { Seo } from '@/components/ui/Seo';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, radius, spacing, type } from '@/lib/theme';

// DRAFT legal text — see app/terms.tsx for the same caveat. Unlike Terms,
// almost everything here is directly verifiable from the codebase (what's
// collected, which third-party services are used, what privacy controls
// exist) rather than a business decision, so most of this section is
// grounded fact rather than placeholder. What's still a real decision
// (data retention period, deletion timelines, a monitored contact
// address, governing jurisdiction) stays a [bracketed] placeholder.
interface LegalSection {
  heading: string;
  paragraphs: string[];
}

const SECTIONS: LegalSection[] = [
  {
    heading: '1. What this covers',
    paragraphs: [
      'This Privacy Policy describes what information ThrillIQ collects, how it\'s used, and the controls you have over it. It applies to the ThrillIQ app and website.',
    ],
  },
  {
    heading: '2. What we collect',
    paragraphs: [
      'Account information: your name, initials, avatar color, a short bio, and — if you add them — your role, location text, and username.',
      'Sign-in information: depending on how you sign in, your email address, phone number, or Google account details, handled through Firebase Authentication (a Google service).',
      'Adventure & social activity: adventures you create or join, posts, comments, reviews, crew memberships, and connections with other people.',
      'Optional profile preferences: interests, adventure categories, preferred difficulty/pace/intensity, and experience level, if you choose to set them.',
      'Emergency contact: a name and phone number you can optionally add. It\'s private — used only to remind you of it after you\'ve joined an adventure — and is not shown to organizers or other participants.',
      'Location: only if you grant permission, used to sort adventures by distance on Discover. You can decline this and still use the app.',
      'Photos: any photos you add to a post or review.',
    ],
  },
  {
    heading: '3. How we use it',
    paragraphs: [
      'To operate the Service: show you adventures, connect you with organizers and other participants, and run the social features (Feed, Crews, messaging).',
      'To keep the Service safe: review reports, enforce our Terms, and act on guideline violations.',
      'To communicate with you: notifications about adventures you\'re part of, connection requests, and similar activity.',
    ],
  },
  {
    heading: '4. Third-party services',
    paragraphs: [
      'ThrillIQ is built on Firebase (Google Cloud), which handles authentication and stores app data (accounts, adventures, posts, messages, and related content) on our behalf. Google processes this data under its own terms as our service provider.',
      "We don't sell your information to third parties.",
    ],
  },
  {
    heading: '5. What\'s visible to others',
    paragraphs: [
      'Adventures, crews, and public profiles are browsable by anyone, signed in or not — this is core to how ThrillIQ works.',
      'Your Profile → Privacy settings let you control visibility of your profile, location, social activity, and who can message you.',
      'Your emergency contact, sign-in details, and account credentials are never shown to other users.',
    ],
  },
  {
    heading: '6. Your controls',
    paragraphs: [
      "You can review and change most of what you've shared from your Profile. You can leave an adventure, delete posts you've made, and adjust your privacy settings at any time.",
      '[Data retention periods and account-deletion process pending confirmation.]',
    ],
  },
  {
    heading: '7. Children',
    paragraphs: [
      'ThrillIQ accounts are for people 18 or older (or the age of majority in your jurisdiction). Adventures marked "Children welcome" may include minors, but they participate under the adult account holder — minors do not hold their own ThrillIQ accounts.',
    ],
  },
  {
    heading: '8. Security',
    paragraphs: [
      'We rely on Firebase\'s security infrastructure and access-control rules to protect your data, and we restrict who inside ThrillIQ can access it. No system is perfectly secure, and we can\'t guarantee absolute security.',
    ],
  },
  {
    heading: '9. Your rights',
    paragraphs: [
      'Depending on where you live, you may have rights to access, correct, or delete your personal information. [Specific process and applicable data-protection law pending legal review.]',
    ],
  },
  {
    heading: '10. Changes to this policy',
    paragraphs: ["We'll update the date below whenever this policy changes."],
  },
  {
    heading: '11. Contact',
    paragraphs: ['Questions about this policy: use the Contact page.'],
  },
];

export default function Privacy() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  return (
    <View style={styles.page}>
      <Seo title="Privacy Policy" description="How ThrillIQ collects, uses, and protects your data." />
      <ScrollView contentContainerStyle={styles.scroll}>
        <PublicHeader />

        <View style={[styles.section, styles.heroSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.heroEyebrow}>LEGAL</Text>
            <Text style={styles.heroTitle}>Privacy Policy</Text>
            <Text style={styles.heroSubtitle}>Draft — pending legal review. Last updated September 2026.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionInner, isWide && styles.contentWide]}>
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                This page is a working draft, not a finalized legal document. What's collected and how it's used is accurate to how the app actually
                works; bracketed text marks the handful of items — retention periods, applicable data-protection law — that need confirmation before
                this is relied on as a live policy.
              </Text>
            </View>
            {SECTIONS.map((s) => (
              <View key={s.heading} style={styles.block}>
                <Text style={styles.blockHeading}>{s.heading}</Text>
                {s.paragraphs.map((p, i) => (
                  <Text key={i} style={styles.blockBody}>
                    {p}
                  </Text>
                ))}
              </View>
            ))}
            <Pressable onPress={() => router.push('/contact')} hitSlop={8}>
              <Text style={styles.contactLink}>Contact us →</Text>
            </Pressable>
          </View>
        </View>

        <PublicFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },

  section: { alignItems: 'center' },
  sectionInner: { width: '100%', maxWidth: DESKTOP_CONTENT_MAX_WIDTH, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
  contentWide: { maxWidth: 760 },

  heroSection: { backgroundColor: colors.surfaceMuted },
  heroEyebrow: { ...type.caption, color: colors.textSecondary, fontWeight: '700', letterSpacing: 1.5, marginBottom: spacing.sm },
  heroTitle: { ...type.display, fontSize: 32 },
  heroSubtitle: { ...type.body, color: colors.textSecondary, marginTop: spacing.sm },

  noticeBox: {
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  noticeText: { ...type.secondary, color: colors.textPrimary },

  block: { marginBottom: spacing.xl },
  blockHeading: { ...type.sectionHeading, marginBottom: spacing.sm },
  blockBody: { ...type.body, color: colors.textSecondary, marginBottom: spacing.sm },
  contactLink: { ...type.bodyEmphasis, color: colors.primary },
});
