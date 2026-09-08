import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { colors, radius, spacing, typography } from '@/lib/theme';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqGroup {
  heading: string;
  items: FaqItem[];
}

const GROUPS: FaqGroup[] = [
  {
    heading: 'Getting started',
    items: [
      {
        question: 'What is ThrillIQ?',
        answer:
          'ThrillIQ helps you discover hikes, road trips, and other outdoor adventures near you, and connect with the organizers and other people joining them.',
      },
      {
        question: 'Who runs the adventures I find on ThrillIQ?',
        answer:
          'Independent organizers, not ThrillIQ. We provide the tools to discover, join, and message about adventures — the adventure itself is run entirely by its organizer.',
      },
      {
        question: 'Do I need to create an account?',
        answer:
          'Yes. An account lets you join adventures, message organizers and participants, and keep track of what you’re hosting or attending.',
      },
    ],
  },
  {
    heading: 'Payments',
    items: [
      {
        question: 'How do I pay for an adventure?',
        answer:
          'Directly to the organizer, outside the app. ThrillIQ doesn’t process, hold, or refund any adventure payments — check with the organizer for accepted payment methods.',
      },
      {
        question: 'Can I get a refund if I can’t make it?',
        answer:
          'Refunds are entirely up to the organizer’s own policy, since payment happens directly with them. Message them from the adventure chat as early as you can.',
      },
    ],
  },
  {
    heading: 'Joining and hosting',
    items: [
      {
        question: 'How do I join an adventure?',
        answer: 'Open it from Discover and tap Join. If it’s full, you can still message the organizer to ask about a waitlist.',
      },
      {
        question: 'Can I cancel after joining?',
        answer: 'Yes, from the adventure screen. The organizer is notified and your spot opens up for someone else.',
      },
      {
        question: 'How do I host my own adventure?',
        answer: 'Tap Create from the tabs, fill in the details, and publish it. It’ll show up on Discover for others to find.',
      },
      {
        question: 'What if an organizer cancels an adventure I joined?',
        answer: 'You’ll get a notification right away, and it’s removed from your upcoming list.',
      },
    ],
  },
  {
    heading: 'Privacy and safety',
    items: [
      {
        question: 'Is my exact location shared with other users?',
        answer:
          'No. ThrillIQ never collects or shows an exact address — at most, your city or general area, and only if your privacy settings allow it.',
      },
      {
        question: 'Who can see my profile?',
        answer:
          'You control this in Privacy Settings — everyone, only connections, or only participants you’ve shared an adventure with.',
      },
      {
        question: 'Who can message me?',
        answer: 'Also up to you, in Privacy Settings — connections, participants, or nobody.',
      },
    ],
  },
  {
    heading: 'Account',
    items: [
      {
        question: 'How do I edit my profile?',
        answer: 'Go to Profile and tap the pencil icon, or open Edit Profile directly.',
      },
      {
        question: 'How do I log out?',
        answer: 'From Profile, scroll down and tap Log out.',
      },
      {
        question: 'How do I delete my account or my data?',
        answer: 'Contact us at privacy@thrilliq.app and we’ll take care of it — see the Privacy Policy for details.',
      },
    ],
  },
];

export default function Faq() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="FAQ" />
      <ScrollView contentContainerStyle={styles.content}>
        {GROUPS.map((group) => (
          <View key={group.heading} style={styles.group}>
            <Text style={styles.heading}>{group.heading}</Text>
            <View style={styles.card}>
              {group.items.map((item, index) => {
                const key = `${group.heading}-${index}`;
                const open = openKey === key;
                return (
                  <View key={key} style={index > 0 ? styles.itemBorder : undefined}>
                    <Pressable style={styles.itemRow} onPress={() => setOpenKey(open ? null : key)}>
                      <Text style={styles.question}>{item.question}</Text>
                      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                    </Pressable>
                    {open && <Text style={styles.answer}>{item.answer}</Text>}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <Text style={styles.footer}>
          Still have questions? See our{' '}
          <Text style={styles.link} onPress={() => router.push('/legal/terms')}>
            Terms of Service
          </Text>
          {', '}
          <Text style={styles.link} onPress={() => router.push('/legal/privacy')}>
            Privacy Policy
          </Text>
          , or reach us at support@thrilliq.app.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  group: { gap: spacing.sm },
  heading: { ...typography.subheading, fontSize: 15 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
  },
  question: { ...typography.body, fontSize: 14, fontWeight: '600', flex: 1 },
  answer: { ...typography.caption, paddingHorizontal: spacing.md, paddingBottom: spacing.md, lineHeight: 19 },
  footer: { ...typography.caption, textAlign: 'center', lineHeight: 19 },
  link: { color: colors.textPrimary, fontWeight: '600' },
});
