import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { colors, spacing, type } from '@/lib/theme';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

interface LegalDocumentProps {
  title: string;
  updatedLabel: string;
  intro: string;
  sections: LegalSection[];
}

// Shared long-form layout for Privacy Policy / Terms of Service — both are
// just a title, a last-updated line, an intro paragraph, and a list of
// heading+paragraphs sections, so one component renders either.
export function LegalDocument({ title, updatedLabel, intro, sections }: LegalDocumentProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={title} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>{updatedLabel}</Text>
        <Text style={styles.intro}>{intro}</Text>
        {sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.paragraphs.map((p, i) => (
              <Text key={i} style={styles.paragraph}>
                {p}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl * 2 },
  updated: { ...type.secondary, color: colors.textMuted },
  intro: { ...type.body, color: colors.textPrimary, marginBottom: spacing.sm },
  section: { gap: spacing.xs, marginBottom: spacing.md },
  heading: { ...type.bodyEmphasis, fontSize: 16, marginBottom: 2 },
  paragraph: { ...type.body, color: colors.textSecondary },
});
