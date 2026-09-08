import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, useWindowDimensions, View } from 'react-native';

import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { Seo } from '@/components/ui/Seo';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, radius, spacing, type } from '@/lib/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Every answer here describes real, already-built behavior — join/leave,
// the waitlist, the "pay the organizer directly" rule, reporting, and
// guideline acknowledgement all exist in the app today (see
// app/adventure/[id].tsx, lib/reportsProvider, lib/waitlistProvider).
// Nothing here promises a feature (background checks, insurance, 24/7
// support) that isn't actually built.
interface FaqItem {
  q: string;
  a: string;
}
interface FaqCategory {
  title: string;
  items: FaqItem[];
}

const CATEGORIES: FaqCategory[] = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'What is ThrillIQ?',
        a: 'ThrillIQ connects people in Nairobi with real adventures — hikes, camping trips, cycling rides, and more — hosted by real organizers. You browse, join, show up, and meet the people going.',
      },
      {
        q: 'Do I need an account to browse adventures?',
        a: "No. Discover, adventure pages, and Crews are public — you can browse without signing in. You'll need an account to join an adventure, post, or message.",
      },
    ],
  },
  {
    title: 'Joining adventures',
    items: [
      {
        q: 'How do I join an adventure?',
        a: "Open the adventure, agree to the organizer's guidelines, and tap Join. If it's full, you can join the waitlist instead and you'll see your position in line.",
      },
      {
        q: 'Can I cancel after joining?',
        a: "Yes — open the adventure and leave it any time before it happens. Your spot opens up for someone else, including anyone on the waitlist.",
      },
      {
        q: 'What happens if the organizer cancels?',
        a: "You'll get a notification letting you know. Cancelled adventures come off Discover for everyone else too.",
      },
    ],
  },
  {
    title: 'Payments & pricing',
    items: [
      {
        q: 'Does ThrillIQ charge me to join?',
        a: 'No. Joining an adventure never charges you through the app — you pay the organizer directly, however they arrange it. ThrillIQ does not process or hold payments.',
      },
      {
        q: 'Is the price shown upfront?',
        a: "Yes — every adventure shows its price (or 'Free') on its card and detail page before you join.",
      },
    ],
  },
  {
    title: 'Safety & trust',
    items: [
      {
        q: 'How do I report a problem?',
        a: "Every adventure, post, and profile has a report option — spam, inappropriate content, a safety concern, or something else. Reports go to the team, not to the other person.",
      },
      {
        q: "What's the emergency contact field for?",
        a: "It's optional, lives on your profile, and is shown back to you as a reminder once you've joined an adventure — so it's there if you need it.",
      },
      {
        q: 'What are adventure guidelines?',
        a: "Each organizer sets guidelines for their adventure (things like 'no alcohol' or 'pets ok'). You agree to them before joining, and the organizer can see who has.",
      },
    ],
  },
  {
    title: 'Hosting',
    items: [
      {
        q: 'How do I host an adventure?',
        a: 'Sign in and tap Create. Set the details, date, price, and guidelines, and it goes live on Discover.',
      },
      {
        q: 'How do I manage who joins?',
        a: 'Your Organizer Dashboard (reachable from Profile once you host something) shows your adventures, participants, and reviews in one place.',
      },
    ],
  },
  {
    title: 'Account & privacy',
    items: [
      {
        q: 'Who can see my profile?',
        a: 'You control this in Profile → Privacy — separate settings for your profile, location, social activity, and messaging.',
      },
      {
        q: 'Can I control who messages me?',
        a: 'Yes, through the messaging privacy setting in Profile → Privacy.',
      },
    ],
  },
];

function FaqRow({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onToggle}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowQuestion}>{item.q}</Text>
        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </View>
      {isOpen && <Text style={styles.rowAnswer}>{item.a}</Text>}
    </Pressable>
  );
}

export default function Faqs() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    if (Platform.OS !== 'web') LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.page}>
      <Seo
        title="FAQs"
        description="Answers to common questions about joining and hosting adventures on ThrillIQ."
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <PublicHeader />

        <View style={[styles.section, styles.heroSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.heroEyebrow}>SUPPORT</Text>
            <Text style={styles.heroTitle}>Frequently Asked Questions</Text>
            <Text style={styles.heroSubtitle}>Answers to what people actually ask about joining, hosting, and staying safe on ThrillIQ.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionInner, isWide && styles.contentWide]}>
            {CATEGORIES.map((cat) => (
              <View key={cat.title} style={styles.categoryBlock}>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <View style={styles.categoryCard}>
                  {cat.items.map((item, i) => {
                    const id = `${cat.title}-${i}`;
                    return (
                      <View key={id}>
                        <FaqRow item={item} isOpen={openId === id} onToggle={() => toggle(id)} />
                        {i < cat.items.length - 1 && <View style={styles.divider} />}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            <View style={styles.contactBox}>
              <Text style={styles.contactTitle}>Questions about safety specifically?</Text>
              <Text style={styles.contactBody}>Guidelines, reporting, and what to expect before you join.</Text>
              <Pressable onPress={() => router.push('/safety')} hitSlop={8}>
                <Text style={styles.contactLink}>Read our safety approach →</Text>
              </Pressable>
            </View>

            <View style={styles.contactBox}>
              <Text style={styles.contactTitle}>Still stuck?</Text>
              <Text style={styles.contactBody}>Send us a message and we'll get back to you.</Text>
              <Pressable onPress={() => router.push('/contact')} hitSlop={8}>
                <Text style={styles.contactLink}>Contact us →</Text>
              </Pressable>
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
  sectionInner: { width: '100%', maxWidth: DESKTOP_CONTENT_MAX_WIDTH, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
  contentWide: { maxWidth: 760 },

  heroSection: { backgroundColor: colors.primarySurface },
  heroEyebrow: { ...type.caption, color: colors.primary, fontWeight: '700', letterSpacing: 1.5, marginBottom: spacing.sm },
  heroTitle: { ...type.display, fontSize: 32 },
  heroSubtitle: { ...type.largeBody, color: colors.textSecondary, marginTop: spacing.sm, maxWidth: 560 },

  categoryBlock: { marginBottom: spacing.xxl },
  categoryTitle: { ...type.sectionHeading, marginBottom: spacing.md },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: { padding: spacing.lg },
  rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  rowQuestion: { ...type.bodyEmphasis, flex: 1 },
  rowAnswer: { ...type.body, color: colors.textSecondary, marginTop: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border },

  contactBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  contactTitle: { ...type.cardTitle },
  contactBody: { ...type.secondary, color: colors.textSecondary, marginBottom: spacing.xs },
  contactLink: { ...type.bodyEmphasis, color: colors.primary },
});
