import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/StateViews';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';

export default function EditAdventure() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { adventures, updateAdventure } = useApp();
  const adventure = adventures.find((a) => a.id === id);

  const [title, setTitle] = useState(adventure?.title ?? '');
  const [schedule, setSchedule] = useState(
    adventure ? `${adventure.dateLabel}${adventure.meetingTime ? `, ${adventure.meetingTime}` : ''}` : ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!adventure) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Edit adventure" />
        <Text style={styles.notFound}>This adventure no longer exists.</Text>
      </SafeAreaView>
    );
  }

  const canSave = title.trim().length > 0 && schedule.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateAdventure(adventure.id, { title: title.trim(), schedule: schedule.trim() });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Edit adventure" />
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor={colors.textMuted} style={styles.input} />
        <TextInput
          value={schedule}
          onChangeText={setSchedule}
          placeholder="Date and meeting time"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Button label="Save changes" onPress={handleSave} disabled={!canSave} loading={saving} style={{ marginTop: spacing.md }} />

        {error && <InlineError message={error} onRetry={handleSave} />}
        {saved && !error && (
          <Text style={styles.savedText}>✓ Changes saved. Participants notified.</Text>
        )}

        <Button label="Back to dashboard" variant="ghost" onPress={() => router.back()} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  notFound: { ...typography.body, padding: spacing.lg },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  savedText: { color: colors.success, textAlign: 'center', fontWeight: '600' },
});
