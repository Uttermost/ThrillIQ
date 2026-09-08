import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { MountainScene } from '@/components/ui/MountainScene';
import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { useApp } from '@/lib/store';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, radius, spacing, type } from '@/lib/theme';

// Public marketing page for hosting, distinct from /organizer (the
// auth-gated dashboard) and /organizer/[id] (per-adventure management).
// Every claim here is grounded in what Create and the Organizer Dashboard
// actually do — no fabricated "verified organizer" badges, no invented
// join/organizer counts, no platform-fee percentage that isn't real (there
// simply is no fee: ThrillIQ never processes payment). Same rule as the
// rest of this app's public pages.
const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  { icon: 'cash-outline', title: 'No platform fees', body: "Set your own price. ThrillIQ doesn't process payments or take a cut — participants pay you directly." },
  { icon: 'shield-checkmark-outline', title: 'Set your own guidelines', body: 'Alcohol policy, pets, age requirements — whatever matters for your adventure, participants agree to it before joining.' },
  { icon: 'people-outline', title: "See who's coming", body: 'A real participant list, plus a waitlist that fills automatically when someone drops out.' },
  { icon: 'star-outline', title: 'Build a real reputation', body: 'Reviews from people who actually joined, visible on your Organizer Dashboard.' },
  { icon: 'chatbubble-outline', title: 'Message participants directly', body: 'Answer questions and confirm meeting points before the day arrives.' },
];

// The dashboard preview below shows these labeled but empty — a "—"
// placeholder, not an invented number. Real values only appear once
// someone's actually hosted an adventure.
const DASHBOARD_STATS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'flag-outline', label: 'Hosted' },
  { icon: 'calendar-outline', label: 'Upcoming' },
  { icon: 'people-outline', label: 'Participants' },
  { icon: 'star-outline', label: 'Average rating' },
];

const STEPS: { title: string; body: string }[] = [
  { title: 'Create your adventure', body: 'Title, category, description, date, and meeting point — Create walks you through it.' },
  { title: 'Set the details', body: 'Difficulty and vibe, who it\'s for, transport, what\'s included, your price and cancellation policy.' },
  { title: 'Publish & manage', body: "People join, you track them from your Organizer Dashboard, and you message anyone directly." },
  { title: 'Get reviewed', body: 'After it happens, participants can leave a review — real feedback that builds your reputation over time.' },
];

export default function ForOrganizers() {
  const { width } = useWindowDimensions();
  const { authenticated } = useApp();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  const goCreate = () => router.push(authenticated ? '/create' : '/auth');

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PublicHeader />

        <View style={[styles.heroSection, isWide ? styles.heroSectionWide : styles.heroSectionNarrow]}>
          <View style={styles.heroBg}>
            <MountainScene height={isWide ? 400 : 280} rounded={false} category="Road trip" />
          </View>
          <View style={styles.heroScrim} />
          <View style={styles.heroContentWrap}>
            <View style={[styles.sectionInner, styles.heroInner]}>
              <Text style={styles.heroEyebrow}>FOR ORGANIZERS</Text>
              <Text style={styles.heroTitle}>Host the adventures you already run.</Text>
              <Text style={styles.heroSubtitle}>
                Turn your hikes, rides, and meetups into something people can actually find and join — on your terms.
              </Text>
              <Button label="Create an adventure" onPress={goCreate} style={styles.heroBtn} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInner}>
            <View style={styles.benefitRow}>
              {BENEFITS.map((b) => (
                <View key={b.title} style={[styles.benefitCard, isWide && styles.benefitCardWide]}>
                  <View style={styles.benefitIconWrap}>
                    <Ionicons name={b.icon} size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.benefitTitle}>{b.title}</Text>
                  <Text style={styles.benefitBody}>{b.body}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.mutedSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.sectionHeading}>How it works</Text>
            <View style={styles.stepRow}>
              {STEPS.map((s, i) => (
                <View key={s.title} style={[styles.stepCard, isWide && styles.stepCardWide]}>
                  <Text style={styles.stepNumber}>{i + 1}</Text>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepBody}>{s.body}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionInner, isWide && styles.dashboardRow]}>
            <View style={[styles.dashboardCopy, isWide && styles.dashboardCopyWide]}>
              <Text style={styles.sectionHeading}>Your Organizer Dashboard</Text>
              <Text style={styles.dashboardBody}>
                Once you've hosted an adventure, your dashboard shows what's actually happening: adventures hosted, upcoming plans, total
                participants, and your average rating from real reviews.
              </Text>
              <Text style={styles.dashboardBody}>
                It's reachable from your Profile as soon as you host your first adventure — no separate signup.
              </Text>
              <Pressable onPress={() => router.push('/safety')} hitSlop={8}>
                <Text style={styles.dashboardLink}>How guidelines and reporting work →</Text>
              </Pressable>
            </View>
            <View style={[styles.dashboardStats, isWide && styles.dashboardStatsWide]}>
              <View style={styles.statGrid}>
                {DASHBOARD_STATS.map((s) => (
                  <View key={s.label} style={styles.statBox}>
                    <Ionicons name={s.icon} size={18} color={colors.textMuted} />
                    <Text style={styles.statValue}>—</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.statCaption}>What you'll see — filled in from your real adventures once you start hosting.</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.closingSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.closingTitle}>Ready to host your first adventure?</Text>
            <Button label="Create an adventure" onPress={goCreate} style={styles.closingBtn} />
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
  mutedSection: { backgroundColor: colors.surfaceMuted },
  sectionHeading: { ...type.sectionHeading, marginBottom: spacing.lg },

  heroSection: { position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  heroSectionWide: { height: 400 },
  heroSectionNarrow: { height: 320 },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.6)' },
  heroContentWrap: { width: '100%', alignItems: 'center' },
  heroInner: { paddingTop: 0, paddingBottom: spacing.xxxl },
  heroEyebrow: { ...type.caption, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5, fontWeight: '700', marginBottom: spacing.sm },
  heroTitle: { ...type.display, fontSize: 34, lineHeight: 40, color: '#fff', maxWidth: 560 },
  heroSubtitle: { ...type.largeBody, color: 'rgba(255,255,255,0.92)', marginTop: spacing.sm, marginBottom: spacing.lg, maxWidth: 520 },
  heroBtn: { alignSelf: 'flex-start', paddingHorizontal: spacing.xl },

  benefitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  benefitCard: { width: '100%', gap: spacing.sm, alignItems: 'flex-start' },
  benefitCardWide: { width: '30%', minWidth: 240 },
  benefitIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: { ...type.bodyEmphasis },
  benefitBody: { ...type.secondary, color: colors.textSecondary },

  stepRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  stepCard: { width: '100%', gap: spacing.xs },
  stepCardWide: { width: '22%', minWidth: 200 },
  stepNumber: { ...type.sectionHeading, color: colors.primary },
  stepTitle: { ...type.bodyEmphasis },
  stepBody: { ...type.secondary, color: colors.textSecondary },

  dashboardRow: { flexDirection: 'row', gap: spacing.xxxl },
  dashboardCopy: { gap: spacing.md },
  dashboardCopyWide: { flex: 1 },
  dashboardBody: { ...type.body, color: colors.textSecondary },
  dashboardLink: { ...type.bodyEmphasis, color: colors.primary },
  dashboardStats: { gap: spacing.sm, marginTop: spacing.xl },
  dashboardStatsWide: { flex: 1, marginTop: 0 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statBox: {
    width: '47%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: { ...type.sectionHeading, color: colors.textMuted },
  statLabel: { ...type.secondary, color: colors.textSecondary },
  statCaption: { ...type.caption, color: colors.textMuted, marginTop: spacing.xs },

  closingSection: { backgroundColor: colors.textPrimary, alignItems: 'center' },
  closingTitle: { ...type.screenHeading, color: '#fff', textAlign: 'center', marginBottom: spacing.lg },
  closingBtn: { alignSelf: 'center', paddingHorizontal: spacing.xxl },
});
