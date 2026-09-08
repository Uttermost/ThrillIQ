import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, radius, spacing, type } from '@/lib/theme';

// DRAFT legal text, not a reviewed or finalized legal instrument. Sections
// describing what the product actually does (adventures run independently,
// no payment processing, reporting, guidelines) are grounded in real,
// already-built behavior — same rule as About/FAQs/Safety. Anything that's
// a real legal/business decision rather than a product fact — the
// registered company entity, its address, governing-law jurisdiction, a
// monitored contact address — is left as an explicit [bracketed]
// placeholder instead of an invented fact. This needs a legal review pass
// before it's relied on as a live policy.
interface LegalSection {
  heading: string;
  paragraphs: string[];
}

const SECTIONS: LegalSection[] = [
  {
    heading: '1. Agreement to these Terms',
    paragraphs: [
      'These Terms of Service ("Terms") govern your use of ThrillIQ (the "Service"). By creating an account or using the Service, you agree to these Terms. If you do not agree, do not use the Service.',
      'The Service is operated by [Company legal name], a company registered in [jurisdiction — Kenya assumed, pending confirmation] ("we," "us," "ThrillIQ").',
    ],
  },
  {
    heading: '2. What ThrillIQ Is',
    paragraphs: [
      'ThrillIQ is a platform that helps people discover and join adventures — hikes, camping trips, cycling rides, and similar activities — and connect with other people going.',
      'Adventures listed on ThrillIQ are organized and run independently by their organizers, not by ThrillIQ. ThrillIQ is not a party to any arrangement between you and an organizer, and does not supervise, insure, or guarantee the safety or quality of any adventure.',
    ],
  },
  {
    heading: '3. Eligibility & Accounts',
    paragraphs: [
      'You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account. Adventures marked "Children welcome" may include minors accompanied by the adult who holds the account.',
      "You're responsible for the accuracy of the information on your account and for keeping your login credentials secure. Let us know if you believe your account has been accessed without your permission.",
    ],
  },
  {
    heading: '4. Payments',
    paragraphs: [
      'ThrillIQ does not process, hold, or transmit payments for adventures. Where an adventure has a price, that price and any payment arrangement is between you and the organizer directly. Joining an adventure through the app does not charge you and does not constitute payment.',
    ],
  },
  {
    heading: '5. Guidelines & Conduct',
    paragraphs: [
      'Each adventure has guidelines set by its organizer, which you agree to before joining. Beyond that, you agree not to use the Service to harass, threaten, or endanger others; post spam or inappropriate content; misrepresent your identity; or use the Service for anything unlawful.',
      'Every adventure, post, and profile can be reported for spam, inappropriate content, a safety concern, or another reason. We review reports and may remove content or restrict accounts that violate these Terms.',
    ],
  },
  {
    heading: '6. Content You Post',
    paragraphs: [
      'You retain ownership of the posts, photos, reviews, and other content you add to ThrillIQ. By posting it, you grant us a license to display it within the Service to the audience your privacy settings allow.',
      "You're responsible for what you post. Don't post anything you don't have the rights to, or anything that violates someone else's rights.",
    ],
  },
  {
    heading: '7. Reviews',
    paragraphs: [
      'Reviews must reflect a genuine experience with the adventure or organizer being reviewed. We may remove reviews that violate these Terms.',
    ],
  },
  {
    heading: '8. Termination',
    paragraphs: [
      'You can stop using the Service at any time. We may suspend or terminate accounts that violate these Terms, including repeated or serious guideline or conduct violations.',
    ],
  },
  {
    heading: '9. Disclaimers & Limitation of Liability',
    paragraphs: [
      'The Service is provided "as is." Adventures involve inherent risk, and you participate in them at your own discretion and risk. To the maximum extent permitted by law, ThrillIQ is not liable for any injury, loss, or damage arising from an adventure, from another user\'s conduct, or from your use of the Service.',
      '[Specific liability cap and indemnification language pending legal review.]',
    ],
  },
  {
    heading: '10. Governing Law',
    paragraphs: ['These Terms are governed by the laws of [jurisdiction — pending confirmation], without regard to conflict-of-law principles.'],
  },
  {
    heading: '11. Changes to these Terms',
    paragraphs: ["We may update these Terms as the Service changes. We'll update the date below when we do."],
  },
  {
    heading: '12. Contact',
    paragraphs: ['Questions about these Terms: [insert contact address].'],
  },
];

export default function Terms() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PublicHeader />

        <View style={[styles.section, styles.heroSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.heroEyebrow}>LEGAL</Text>
            <Text style={styles.heroTitle}>Terms of Service</Text>
            <Text style={styles.heroSubtitle}>Draft — pending legal review. Last updated September 2026.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionInner, isWide && styles.contentWide]}>
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                This page is a working draft, not a finalized legal document. Bracketed text marks details — company entity, jurisdiction, contact
                address — that need confirmation before this is relied on as a live policy.
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
});
