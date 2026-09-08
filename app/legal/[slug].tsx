import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { getLegalDoc } from '@/lib/legalDocs';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, radius, spacing, type } from '@/lib/theme';

// Shared template for the smaller policy documents (Cookie Policy,
// Community Guidelines, Safety Policy, Organizer Terms, Cancellation &
// Refund, Copyright Policy, Report Abuse) — see lib/legalDocs.ts for the
// content and its "draft, real facts, bracketed placeholders for real
// legal decisions" rule, same as app/terms.tsx and app/privacy.tsx. Terms
// and Privacy stay their own standalone files rather than moving into
// this template, since they already shipped and work.
export default function LegalDocPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  const doc = getLegalDoc(slug);

  if (!doc) {
    return (
      <View style={styles.page}>
        <PublicHeader />
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>Document not found</Text>
          <Pressable onPress={() => router.push('/home')} hitSlop={8}>
            <Text style={styles.contactLink}>← Back home</Text>
          </Pressable>
        </View>
        <PublicFooter />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PublicHeader />

        <View style={[styles.section, styles.heroSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.heroEyebrow}>LEGAL</Text>
            <Text style={styles.heroTitle}>{doc.title}</Text>
            <Text style={styles.heroSubtitle}>Draft — pending legal review. Last updated September 2026.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionInner, isWide && styles.contentWide]}>
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                This page is a working draft, not a finalized legal document. What it describes about how ThrillIQ actually works is accurate; anything
                that's a real legal or business decision rather than a product fact needs confirmation before this is relied on as a live policy.
              </Text>
            </View>
            {doc.sections.map((s) => (
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

  notFoundWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl },
  notFoundTitle: { ...type.screenHeading },
});
