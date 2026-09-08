import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LegalListItem, LegalParagraph, LegalSection } from '@/components/ui/LegalSection';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { colors, spacing, typography } from '@/lib/theme';

const LAST_UPDATED = 'September 8, 2026';

export default function PrivacyPolicy() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Privacy Policy" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>

        <LegalSection title="1. What this covers">
          <LegalParagraph>
            This Privacy Policy explains what information ThrillIQ collects, how we use it, and the choices you
            have. It applies to your use of the ThrillIQ app.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="2. Information we collect">
          <LegalListItem>
            <Text style={styles.bold}>Account information</Text> — your name, email address or phone number, and a
            password, or the identity information provided by a social sign-in provider (Google or Apple) if you use
            one.
          </LegalListItem>
          <LegalListItem>
            <Text style={styles.bold}>Profile information</Text> — anything you choose to add, such as a bio,
            interests, adventure preferences, and profile tags.
          </LegalListItem>
          <LegalListItem>
            <Text style={styles.bold}>Location</Text> — only ever your city or general area, based on what you enter
            or your privacy settings allow. ThrillIQ never collects or shows an exact address.
          </LegalListItem>
          <LegalListItem>
            <Text style={styles.bold}>Adventure activity</Text> — adventures you create, join, or like, and your
            messages with organizers and participants.
          </LegalListItem>
          <LegalListItem>
            <Text style={styles.bold}>Device and usage data</Text> — basic technical information (such as app
            version and crash logs) used to keep the App working reliably.
          </LegalListItem>
        </LegalSection>

        <LegalSection title="3. How we use your information">
          <LegalListItem>To create and maintain your account, and to authenticate you when you sign in.</LegalListItem>
          <LegalListItem>To show you adventures, organizers, and participants relevant to you.</LegalListItem>
          <LegalListItem>To deliver messages and notifications about adventures you're part of.</LegalListItem>
          <LegalListItem>To enforce our Terms of Service and keep the community safe.</LegalListItem>
          <LegalListItem>To fix bugs and improve the App.</LegalListItem>
        </LegalSection>

        <LegalSection title="4. Who can see your information">
          <LegalParagraph>
            Your profile visibility, location visibility, and who can message or connect with you are controlled by
            the privacy settings in your profile — you decide what other users see. Organizers can see the profiles
            of participants who join their adventures, and vice versa, so you can coordinate safely.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="5. Third-party services">
          <LegalParagraph>
            ThrillIQ uses trusted service providers to operate the App, including Firebase (Google) for
            authentication, data storage, and messaging infrastructure, and Google Sign-In for social login. These
            providers process data on our behalf and are bound to protect it. We do not sell your personal
            information to advertisers or data brokers.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="6. Payments">
          <LegalParagraph>
            ThrillIQ does not process adventure payments. Any payment you make to an organizer happens directly
            between you and them, outside the App, and is subject to whatever payment method you both use — not this
            Privacy Policy.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="7. Data retention">
          <LegalParagraph>
            We keep your account and adventure data for as long as your account is active, so the App keeps working
            the way you expect. If you delete your account, we delete or anonymize your personal data within a
            reasonable time, except where we're required to keep it (for example, to resolve disputes or comply with
            the law).
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="8. Your choices and rights">
          <LegalListItem>You can review and edit your profile information at any time from Edit Profile.</LegalListItem>
          <LegalListItem>You can control who sees your profile, location, and activity from Privacy Settings.</LegalListItem>
          <LegalListItem>You can request a copy of your data or ask us to delete your account by contacting us below.</LegalListItem>
        </LegalSection>

        <LegalSection title="9. Changes to this policy">
          <LegalParagraph>
            If we make material changes to this Privacy Policy, we'll let you know in the App before they take
            effect.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="10. Contact us">
          <LegalParagraph>
            Questions about this policy, or a request about your data? Reach us at privacy@thrilliq.app.
          </LegalParagraph>
        </LegalSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  updated: { ...typography.small },
  bold: { fontWeight: '700' },
});
