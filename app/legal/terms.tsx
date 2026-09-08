import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LegalListItem, LegalParagraph, LegalSection } from '@/components/ui/LegalSection';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { colors, spacing, typography } from '@/lib/theme';

const LAST_UPDATED = 'September 8, 2026';

export default function TermsOfService() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Terms of Service" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>

        <LegalSection title="1. Agreement to these terms">
          <LegalParagraph>
            These Terms of Service ("Terms") govern your access to and use of ThrillIQ (the "App"). By creating an
            account or otherwise using the App, you agree to be bound by these Terms and by our Privacy Policy. If
            you do not agree, do not use the App.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="2. What ThrillIQ is">
          <LegalParagraph>
            ThrillIQ helps people discover and join hikes, road trips, and other outdoor adventures, and connect
            with the organizers and participants running them. ThrillIQ provides the discovery, messaging, and
            coordination tools — it does not itself organize, guide, transport, insure, or supervise any adventure.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="3. Adventures are independently organized">
          <LegalParagraph>
            Every adventure listed in the App is created and run by an independent organizer, not by ThrillIQ.
            ThrillIQ is not a party to any arrangement between an organizer and a participant, and does not vet,
            certify, or guarantee the safety, quality, or legality of any adventure.
          </LegalParagraph>
          <LegalListItem>Payments for an adventure are made directly to the organizer, outside the App. ThrillIQ does not process, hold, or refund adventure payments.</LegalListItem>
          <LegalListItem>Cancellations, refunds, and changes to an adventure are the organizer's responsibility.</LegalListItem>
          <LegalListItem>You are responsible for assessing whether an adventure is right for your fitness, experience, and risk tolerance before joining.</LegalListItem>
        </LegalSection>

        <LegalSection title="4. Your account">
          <LegalParagraph>
            You must provide accurate information when creating your account and keep it up to date. You are
            responsible for all activity that happens under your account, and for keeping your login credentials
            secure. You must be at least 18 years old, or the age of legal majority in your jurisdiction, to use
            ThrillIQ.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="5. Acceptable use">
          <LegalParagraph>When using ThrillIQ, you agree not to:</LegalParagraph>
          <LegalListItem>Impersonate another person or misrepresent your affiliation with anyone.</LegalListItem>
          <LegalListItem>Harass, threaten, or endanger another user, organizer, or participant.</LegalListItem>
          <LegalListItem>Post false, misleading, or fraudulent adventure listings.</LegalListItem>
          <LegalListItem>Use the App to solicit payments outside the scope of a listed adventure, or to run unrelated commercial activity.</LegalListItem>
          <LegalListItem>Attempt to interfere with, reverse-engineer, or disrupt the App or its infrastructure.</LegalListItem>
        </LegalSection>

        <LegalSection title="6. Assumption of risk">
          <LegalParagraph>
            Outdoor activities such as hiking and road trips carry inherent risks, including injury, illness, and
            death. By joining any adventure through ThrillIQ, you voluntarily assume all such risks. To the fullest
            extent permitted by law, ThrillIQ disclaims liability for any injury, loss, or damage arising from an
            adventure, its organizer, or another participant.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="7. Content you share">
          <LegalParagraph>
            You retain ownership of the profile information, messages, and adventure listings you submit. By posting
            content in the App, you grant ThrillIQ a non-exclusive license to store, display, and transmit that
            content as needed to operate the service. You are responsible for content you post and for having the
            right to post it.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="8. Termination">
          <LegalParagraph>
            You may stop using ThrillIQ and delete your account at any time. We may suspend or terminate access to
            the App for anyone who violates these Terms or puts other users at risk.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="9. Disclaimers and limitation of liability">
          <LegalParagraph>
            The App is provided "as is," without warranties of any kind. To the fullest extent permitted by law,
            ThrillIQ is not liable for indirect, incidental, or consequential damages arising from your use of the
            App or participation in any adventure.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="10. Changes to these terms">
          <LegalParagraph>
            We may update these Terms from time to time. If we make material changes, we'll let you know in the App
            before they take effect. Continuing to use ThrillIQ after changes take effect means you accept the
            updated Terms.
          </LegalParagraph>
        </LegalSection>

        <LegalSection title="11. Contact us">
          <LegalParagraph>Questions about these Terms? Reach us at support@thrilliq.app.</LegalParagraph>
        </LegalSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  updated: { ...typography.small },
});
