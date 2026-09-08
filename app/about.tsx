import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { MountainScene } from '@/components/ui/MountainScene';
import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, radius, spacing, type } from '@/lib/theme';

// Company/product "About" page — the handoff doc's public-pages spec
// (§7) asks for company story, mission and product background. There's
// no fabricated founding history here (no invented dates, founders,
// investors, or user counts) — just an honest description of what the
// product actually does and how it actually works, grounded in the real
// flows already built (Discover → Join → pay the organizer directly →
// show up), same "real data or nothing" rule as the rest of this app.

const BELIEFS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  { icon: 'people-outline', title: 'Real people, not profiles', body: 'Every organizer and participant is a real person you can message before you show up.' },
  { icon: 'compass-outline', title: 'Experiences, not listings', body: "Adventures are hosted by people who actually run them — not a directory of things you'll never book." },
  { icon: 'shield-checkmark-outline', title: 'Trust before scale', body: 'Guidelines, reporting, and reviews come first — growth is not worth cutting corners on safety.' },
  { icon: 'flag-outline', title: 'Community over transactions', body: "Crews and the Feed exist because people keep adventuring together, not just once." },
];

const STEPS: { title: string; body: string }[] = [
  { title: 'Discover', body: 'Browse real adventures on Discover — hiking, camping, cycling, and more, filtered by what you actually want to do.' },
  { title: 'Join', body: "Agree to the organizer's guidelines and join. Joining never charges you — you pay the organizer directly, and they set the price." },
  { title: 'Meet', body: 'Show up, meet the people going, and message the organizer beforehand if you have questions.' },
  { title: 'Belong', body: 'Post about it on the Feed, review the organizer, and build a crew with the people you keep adventuring with.' },
];

export default function About() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PublicHeader active="About" />

        <View style={[styles.heroSection, isWide ? styles.heroSectionWide : styles.heroSectionNarrow]}>
          <View style={styles.heroBg}>
            <MountainScene height={isWide ? 360 : 260} rounded={false} />
          </View>
          <View style={styles.heroScrim} />
          <View style={styles.heroContentWrap}>
            <View style={[styles.sectionInner, styles.heroInner]}>
              <Text style={styles.heroEyebrow}>ABOUT THRILLIQ</Text>
              <Text style={styles.heroTitle}>Real adventures. Real people.</Text>
              <Text style={styles.heroSubtitle}>
                ThrillIQ connects people in Nairobi with adventures hosted by real organizers — and with the people who show up to them.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInner}>
            <Text style={styles.sectionHeading}>What we believe</Text>
            <View style={styles.beliefRow}>
              {BELIEFS.map((b) => (
                <View key={b.title} style={[styles.beliefCard, isWide && styles.beliefCardWide]}>
                  <View style={styles.beliefIconWrap}>
                    <Ionicons name={b.icon} size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.beliefTitle}>{b.title}</Text>
                  <Text style={styles.beliefBody}>{b.body}</Text>
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
          <View style={[styles.sectionInner, styles.trustRow, isWide && styles.trustRowWide]}>
            <View style={[styles.trustPanel, isWide && styles.trustPanelWide]}>
              <Text style={styles.trustEyebrow}>SAFETY & TRUST</Text>
              <Text style={styles.trustTitle}>Built around guidelines, reporting, and real reviews.</Text>
              <Text style={styles.trustBody}>
                Every adventure has guidelines you agree to before joining, a report option if something's wrong, and reviews left by people who actually
                went.
              </Text>
              <Pressable onPress={() => router.push('/safety')} hitSlop={8}>
                <Text style={styles.trustLink}>Read our safety approach →</Text>
              </Pressable>
            </View>
            <View style={[styles.trustPanel, isWide && styles.trustPanelWide]}>
              <Text style={styles.trustEyebrow}>FOR ORGANIZERS</Text>
              <Text style={styles.trustTitle}>Host the adventures you already run.</Text>
              <Text style={styles.trustBody}>
                Set the date, price, and details. ThrillIQ doesn't process payments — participants pay you directly, and you manage who's coming.
              </Text>
              <Pressable onPress={() => router.push('/for-organizers')} hitSlop={8}>
                <Text style={styles.trustLink}>Learn more →</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.closingSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.closingTitle}>Find your next adventure.</Text>
            <Button label="Join ThrillIQ" onPress={() => router.push('/auth')} style={styles.closingBtn} />
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
  sectionHeading: { ...type.sectionHeading, marginBottom: spacing.lg, textAlign: 'center' },

  heroSection: { position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  heroSectionWide: { height: 360 },
  heroSectionNarrow: { height: 280 },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.55)' },
  heroContentWrap: { width: '100%', alignItems: 'center' },
  heroInner: { paddingTop: 0, paddingBottom: spacing.xxxl, alignItems: 'center' },
  heroEyebrow: { ...type.caption, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5, fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' },
  heroTitle: { ...type.display, fontSize: 34, lineHeight: 40, color: '#fff', textAlign: 'center' },
  heroSubtitle: { ...type.largeBody, color: 'rgba(255,255,255,0.92)', marginTop: spacing.sm, textAlign: 'center', maxWidth: 560 },

  beliefRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  beliefCard: { width: '100%', gap: spacing.sm, alignItems: 'flex-start' },
  beliefCardWide: { width: '46%', minWidth: 260 },
  beliefIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beliefTitle: { ...type.bodyEmphasis },
  beliefBody: { ...type.secondary, color: colors.textSecondary },

  stepRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  stepCard: { width: '100%', gap: spacing.xs },
  stepCardWide: { width: '22%', minWidth: 200 },
  stepNumber: { ...type.sectionHeading, color: colors.primary },
  stepTitle: { ...type.bodyEmphasis },
  stepBody: { ...type.secondary, color: colors.textSecondary },

  trustRow: { gap: spacing.xxl },
  trustRowWide: { flexDirection: 'row' },
  trustPanel: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  trustPanelWide: { flex: 1 },
  trustEyebrow: { ...type.caption, color: colors.primary, fontWeight: '700', letterSpacing: 1 },
  trustTitle: { ...type.cardTitle },
  trustBody: { ...type.body, color: colors.textSecondary, marginBottom: spacing.xs },
  trustLink: { ...type.bodyEmphasis, color: colors.primary },

  closingSection: { backgroundColor: colors.textPrimary, alignItems: 'center' },
  closingTitle: { ...type.screenHeading, color: '#fff', textAlign: 'center', marginBottom: spacing.lg },
  closingBtn: { alignSelf: 'center', paddingHorizontal: spacing.xxl },
});
