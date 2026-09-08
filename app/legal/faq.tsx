import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { colors, radius, spacing, type } from '@/lib/theme';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

// Real, specific answers reflecting how this app actually behaves — not
// generic boilerplate. Keep this in sync when the underlying feature
// changes (e.g. if account deletion ever becomes self-service).
const SECTIONS: FaqSection[] = [
  {
    title: 'Getting started',
    items: [
      {
        question: 'What is ThrillIQ?',
        answer:
          "A Kenya-first platform for discovering and joining group adventures — hikes, road trips, camping and more — organized by other members, plus a social feed to share photos and updates and follow along.",
      },
      {
        question: 'Do I need an account to browse?',
        answer:
          'No. Discover, adventure details, and organizer profiles are all visible without signing in. You only need an account to join an adventure, message an organizer, post, follow someone, or save something.',
      },
      {
        question: 'How do I join an adventure?',
        answer:
          "Open an adventure, review its safety guidelines, agree to them, and tap Join. If it's full, you can join the waitlist and we'll notify you if a spot opens up.",
      },
    ],
  },
  {
    title: 'Payments',
    items: [
      {
        question: 'Does ThrillIQ charge me to join an adventure?',
        answer:
          "No. ThrillIQ never processes payment for adventures. The price shown is what the organizer charges directly — you pay them, not us, and joining in the app never charges your card.",
      },
      {
        question: 'What if I need to cancel?',
        answer: "Check the adventure's cancellation policy before joining. Refunds, if any, are between you and the organizer — ThrillIQ isn't a party to that arrangement.",
      },
    ],
  },
  {
    title: 'Safety',
    items: [
      {
        question: 'What are guidelines, and why do I have to agree to them?',
        answer:
          "Each adventure sets its own safety guidelines — gear to bring, meeting point rules, and so on. Agreeing before you join creates a timestamped record that you saw them. It's not a substitute for your own judgement on the day.",
      },
      {
        question: 'Is my emergency contact shared with anyone?',
        answer:
          "No. It's private to your account and is only ever shown back to you, as a reminder before an adventure — never to organizers, other participants, or anyone else.",
      },
      {
        question: 'How do I report something?',
        answer:
          'Tap the flag icon on a post, comment, adventure, review, or profile. Every report goes to our moderation queue and is reviewed by a real person.',
      },
    ],
  },
  {
    title: 'Social features',
    items: [
      {
        question: "What's the difference between Following and a Connection?",
        answer:
          "Following is one-way and needs no approval — it just curates who shows up in your Feed's Following tab. A Connection is mutual and needs both people to accept; it's what unlocks direct messaging outside of an adventure's own chat thread.",
      },
      {
        question: 'Can I delete my own posts or comments?',
        answer: 'Yes, any time — the delete option is right on the post or comment itself. Reposting works the same way and can be undone with one tap.',
      },
    ],
  },
  {
    title: 'Account & privacy',
    items: [
      {
        question: 'What data do you collect?',
        answer: 'See our Privacy Policy for the full picture. In short: your profile info, the content you post, and your location only if you choose to share it for "near me" search.',
      },
      {
        question: 'How do I request my data be deleted?',
        answer: "There's no self-service delete yet. Email us at privacy@thrilliq.com and we'll process your request.",
      },
    ],
  },
];

export default function Faq() {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Frequently asked questions" />
      <ScrollView contentContainerStyle={styles.content}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => {
              const key = `${section.title}:${item.question}`;
              const expanded = expandedKey === key;
              return (
                <Pressable
                  key={key}
                  style={styles.item}
                  onPress={() => setExpandedKey(expanded ? null : key)}
                  accessibilityLabel={item.question}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.question}>{item.question}</Text>
                    <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                  </View>
                  {expanded && <Text style={styles.answer}>{item.answer}</Text>}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xl * 2 },
  section: { gap: spacing.sm },
  sectionTitle: { ...type.sectionHeading },
  item: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  question: { ...type.bodyEmphasis, flex: 1 },
  answer: { ...type.body, color: colors.textSecondary },
});
