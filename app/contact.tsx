import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { FormField } from '@/components/ui/FormField';
import { InlineError } from '@/components/ui/StateViews';
import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { useApp } from '@/lib/store';
import { CONTENT_MAX_WIDTH, colors, radius, spacing, type } from '@/lib/theme';
import { ContactTopic } from '@/lib/types';

// A real, working contact form — submissions write to the contactMessages
// Firestore collection (see lib/contactProvider.web.ts and
// firestore.rules), not a fake mailto: link or an unmonitored address.
// Reachable signed in or not, same as the rest of the public site.
const TOPICS: ContactTopic[] = ['General question', 'Safety concern', 'Organizer question', 'Report a problem', 'Other'];
const MESSAGE_MAX = 2000;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Contact() {
  const { authenticated, me, submitContactMessage } = useApp();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  const [name, setName] = useState(authenticated ? me.name : '');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<ContactTopic>('General question');
  const [message, setMessage] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    const validName = trimmedName.length > 0;
    const validEmail = isValidEmail(email.trim());
    const validMessage = trimmedMessage.length > 0;

    setNameError(validName ? null : 'Enter your name.');
    setEmailError(validEmail ? null : 'Enter a valid email.');
    setMessageError(validMessage ? null : 'Enter a message.');
    if (!validName || !validEmail || !validMessage) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitContactMessage({ name: trimmedName, email: email.trim(), topic, message: trimmedMessage });
      setSent(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Couldn't send your message. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendAnother = () => {
    setSent(false);
    setMessage('');
    setSubmitError(null);
  };

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PublicHeader />

        <View style={[styles.section, styles.heroSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.heroEyebrow}>CONTACT</Text>
            <Text style={styles.heroTitle}>Get in touch</Text>
            <Text style={styles.heroSubtitle}>Questions, safety concerns, or something to report — send it our way.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionInner, isWide && styles.contentWide]}>
            {sent ? (
              <View style={styles.successCard}>
                <Ionicons name="checkmark-circle" size={40} color={colors.primary} />
                <Text style={styles.successTitle}>Message sent</Text>
                <Text style={styles.successBody}>Thanks — your message has gone straight to the ThrillIQ team.</Text>
                <Button label="Send another message" variant="secondary" onPress={handleSendAnother} style={styles.successBtn} />
              </View>
            ) : (
              <View style={styles.formCard}>
                <FormField label="Name" required value={name} onChangeText={setName} placeholder="Your name" error={nameError ?? undefined} />
                <FormField
                  label="Email"
                  required
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={emailError ?? undefined}
                />
                <ChipGroup label="Topic" options={TOPICS} selected={[topic]} onChange={(next) => next[0] && setTopic(next[0])} multi={false} />
                <FormField
                  label="Message"
                  required
                  value={message}
                  onChangeText={setMessage}
                  placeholder="How can we help?"
                  multiline
                  numberOfLines={5}
                  maxLength={MESSAGE_MAX}
                  error={messageError ?? undefined}
                />
                {submitError && <InlineError message={submitError} onRetry={() => setSubmitError(null)} retryLabel="Dismiss" />}
                <Button label="Send message" onPress={handleSubmit} loading={submitting} style={styles.submitBtn} />
              </View>
            )}

            <View style={styles.altCard}>
              <Text style={styles.altTitle}>Looking for a quick answer?</Text>
              <Text style={styles.altBody}>Most questions about joining, hosting, and safety are already answered.</Text>
              <View style={styles.altLinks}>
                <Text style={styles.altLink} onPress={() => router.push('/faqs')}>
                  See the FAQs →
                </Text>
                <Text style={styles.altLink} onPress={() => router.push('/safety')}>
                  Read our safety approach →
                </Text>
              </View>
            </View>
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
  sectionInner: { width: '100%', maxWidth: 1200, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
  contentWide: { maxWidth: 560 },

  heroSection: { backgroundColor: colors.primarySurface },
  heroEyebrow: { ...type.caption, color: colors.primary, fontWeight: '700', letterSpacing: 1.5, marginBottom: spacing.sm },
  heroTitle: { ...type.display, fontSize: 32 },
  heroSubtitle: { ...type.largeBody, color: colors.textSecondary, marginTop: spacing.sm },

  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  submitBtn: { marginTop: spacing.xs },

  successCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  successTitle: { ...type.cardTitle },
  successBody: { ...type.body, color: colors.textSecondary, textAlign: 'center' },
  successBtn: { marginTop: spacing.md },

  altCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.xs,
  },
  altTitle: { ...type.bodyEmphasis },
  altBody: { ...type.secondary, color: colors.textSecondary, marginBottom: spacing.sm },
  altLinks: { gap: spacing.sm },
  altLink: { ...type.bodyEmphasis, color: colors.primary },
});
