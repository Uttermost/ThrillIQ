import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/StateViews';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { ActivityType, NewAdventureDraft } from '@/lib/types';

const EMPTY_DRAFT: NewAdventureDraft = {
  title: '',
  schedule: '',
  priceKsh: '',
  spots: '',
  type: 'Hike',
  difficulty: 'Moderate',
  noAlcohol: false,
  petsOk: false,
};

export default function Create() {
  const { createAdventure } = useApp();
  const [draft, setDraft] = useState<NewAdventureDraft>(EMPTY_DRAFT);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => setSuccess(false);
    }, [])
  );

  const canPublish = draft.title.trim().length > 0 && draft.schedule.trim().length > 0;

  const handlePublish = async () => {
    if (!canPublish) return;
    setPublishing(true);
    setError(null);
    try {
      const created = await createAdventure(draft);
      setDraft(EMPTY_DRAFT);
      setSuccess(true);
      router.push(`/organizer/${created.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setPublishing(false);
    }
  };

  const toggleType = (type: ActivityType) => setDraft((d) => ({ ...d, type }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>New adventure</Text>

        <TextInput
          value={draft.title}
          onChangeText={(title) => setDraft((d) => ({ ...d, title }))}
          placeholder="Title, e.g. Ngong Hills hike"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <TextInput
          value={draft.schedule}
          onChangeText={(schedule) => setDraft((d) => ({ ...d, schedule }))}
          placeholder="Date and meeting time"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <View style={styles.row}>
          {(['Hike', 'Road trip'] as ActivityType[]).map((type) => (
            <Pressable key={type} onPress={() => toggleType(type)} style={[styles.typeChip, draft.type === type && styles.typeChipActive]}>
              <Text style={[styles.typeChipLabel, draft.type === type && styles.typeChipLabelActive]}>{type}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.row}>
          <TextInput
            value={draft.priceKsh}
            onChangeText={(priceKsh) => setDraft((d) => ({ ...d, priceKsh: priceKsh.replace(/[^0-9]/g, '') }))}
            placeholder="Price KSh (info only)"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            style={[styles.input, styles.flex]}
          />
          <TextInput
            value={draft.spots}
            onChangeText={(spots) => setDraft((d) => ({ ...d, spots: spots.replace(/[^0-9]/g, '') }))}
            placeholder="Spots"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            style={[styles.input, styles.flex]}
          />
        </View>

        <View style={styles.row}>
          <Pressable
            onPress={() => setDraft((d) => ({ ...d, noAlcohol: !d.noAlcohol }))}
            style={[styles.toggleChip, draft.noAlcohol && styles.toggleChipActive]}>
            <Text style={[styles.toggleChipLabel, draft.noAlcohol && styles.toggleChipLabelActive]}>No alcohol</Text>
          </Pressable>
          <Pressable
            onPress={() => setDraft((d) => ({ ...d, petsOk: !d.petsOk }))}
            style={[styles.toggleChip, draft.petsOk && styles.toggleChipActive]}>
            <Text style={[styles.toggleChipLabel, draft.petsOk && styles.toggleChipLabelActive]}>Pets ok</Text>
          </Pressable>
        </View>

        <Button label="Publish" onPress={handlePublish} disabled={!canPublish} loading={publishing} style={{ marginTop: spacing.lg }} />

        {error && <InlineError message={error} retryLabel="Retry" onRetry={handlePublish} />}
        {success && !error && <Text style={styles.successText}>✓ Published. It's live on Discover.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  heading: { ...typography.title, marginBottom: spacing.sm },
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
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1, minWidth: 0 },
  typeChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  typeChipActive: { backgroundColor: colors.textPrimary },
  typeChipLabel: { ...typography.caption, fontWeight: '600' },
  typeChipLabelActive: { color: '#fff' },
  toggleChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleChipActive: { backgroundColor: colors.accentMuted, borderColor: colors.accent },
  toggleChipLabel: { ...typography.caption, fontWeight: '600' },
  toggleChipLabelActive: { color: colors.accent },
  successText: { color: colors.success, textAlign: 'center', fontWeight: '600' },
});
