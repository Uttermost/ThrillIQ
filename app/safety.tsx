import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, radius, spacing, type } from '@/lib/theme';

// Describes only real, already-built safety features (guideline
// acknowledgement, reporting with its actual reason categories, the
// private emergency-contact reminder) plus standard, generic safety
// advice. No claims about features that don't exist — no background
// checks, ID verification, insurance, or a support hotline.
const REPORT_REASONS = ['Spam', 'Inappropriate content', 'Safety concern', 'Other'];

const TIPS = [
  'Meet in public, well-lit places for a first adventure with someone new.',
  'Tell a friend or family member which adventure you\'re joining and when.',
  'Add an emergency contact to your profile before you join.',
  'Trust your instincts — if something feels off, you can leave any adventure and report it.',
];

export default function Safety() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PublicHeader />

        <View style={[styles.section, styles.heroSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.heroEyebrow}>SAFETY</Text>
            <Text style={styles.heroTitle}>Safety at ThrillIQ</Text>
            <Text style={styles.heroSubtitle}>
              ThrillIQ connects you with real people running real adventures. Here's exactly what's built to help you stay safe — and what's on you.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionInner, isWide && styles.contentWide]}>
            <View style={styles.block}>
              <View style={styles.blockHeader}>
                <Ionicons name="warning-outline" size={20} color={colors.hosting} />
                <Text style={styles.blockTitle}>Before you join</Text>
              </View>
              <Text style={styles.blockBody}>
                Every adventure has guidelines set by its organizer — things like alcohol policy or whether pets are welcome. You agree to them before you
                can join, and the organizer can see who has.
              </Text>
              <Text style={styles.blockBody}>
                Adventures are run independently by their organizers, not by ThrillIQ. Joining never charges you through the app — you pay the organizer
                directly, on whatever terms they set out.
              </Text>
            </View>

            <View style={styles.block}>
              <View style={styles.blockHeader}>
                <Ionicons name="flag-outline" size={20} color={colors.hosting} />
                <Text style={styles.blockTitle}>Reporting</Text>
              </View>
              <Text style={styles.blockBody}>Every adventure, post, and profile has a report option. Reports go to the ThrillIQ team, not to the other person.</Text>
              <View style={styles.reasonRow}>
                {REPORT_REASONS.map((r) => (
                  <View key={r} style={styles.reasonChip}>
                    <Text style={styles.reasonChipText}>{r}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.block}>
              <View style={styles.blockHeader}>
                <Ionicons name="medkit-outline" size={20} color={colors.hosting} />
                <Text style={styles.blockTitle}>Emergency contact</Text>
              </View>
              <Text style={styles.blockBody}>
                Add an emergency contact in your profile. It's private — only shown back to you, as a reminder, once you've joined an adventure.
              </Text>
            </View>

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>General safety tips</Text>
              {TIPS.map((tip) => (
                <View key={tip} style={styles.tipRow}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.closingSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.closingTitle}>Questions about how something works?</Text>
            <Button label="See the FAQs" variant="secondary" onPress={() => router.push('/faqs')} style={styles.closingBtn} />
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

  heroSection: { backgroundColor: colors.primarySurface },
  heroEyebrow: { ...type.caption, color: colors.primary, fontWeight: '700', letterSpacing: 1.5, marginBottom: spacing.sm },
  heroTitle: { ...type.display, fontSize: 32 },
  heroSubtitle: { ...type.largeBody, color: colors.textSecondary, marginTop: spacing.sm, maxWidth: 560 },

  block: { marginBottom: spacing.xxl },
  blockHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  blockTitle: { ...type.sectionHeading },
  blockBody: { ...type.body, color: colors.textSecondary, marginBottom: spacing.sm },

  reasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  reasonChip: {
    backgroundColor: colors.dangerBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  reasonChipText: { ...type.caption, color: colors.danger, fontWeight: '600' },

  tipsCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  tipsTitle: { ...type.cardTitle, marginBottom: spacing.xs },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  tipText: { ...type.body, color: colors.textSecondary, flex: 1 },

  closingSection: { backgroundColor: colors.textPrimary, alignItems: 'center' },
  closingTitle: { ...type.screenHeading, color: '#fff', textAlign: 'center', marginBottom: spacing.lg },
  closingBtn: { alignSelf: 'center', paddingHorizontal: spacing.xxl },
});
