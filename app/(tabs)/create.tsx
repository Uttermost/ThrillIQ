import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { FormField } from '@/components/ui/FormField';
import { InlineError } from '@/components/ui/StateViews';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { Audience, Category, Difficulty, Intensity, NewAdventureDraft, Pace, SocialLevel, Transport, WhenBucket } from '@/lib/types';

const CATEGORIES: Category[] = [
  'Hiking',
  'Road trip',
  'Camping',
  'Cycling',
  'Wellness',
  'Water',
  'Photography',
  'Networking',
  'Social',
  'Other',
];
const DIFFICULTIES: Difficulty[] = ['Easy', 'Moderate', 'Challenging', 'Extreme'];
const SOCIAL_LEVELS: SocialLevel[] = ['Quiet', 'Social', 'Very Social'];
const PACES: Pace[] = ['Relaxed', 'Moderate', 'Fast'];
const INTENSITIES: Intensity[] = ['Easy', 'Moderate', 'Challenging', 'Extreme'];
const TRANSPORTS: Transport[] = ['Own transport', 'Organizer transport', 'Carpool available'];
const AUDIENCES: Audience[] = ['Solo friendly', 'Couples', 'Families', 'Beginners', 'Experienced', 'Networking'];
const WHEN_BUCKETS: WhenBucket[] = ['This week', 'This month', 'Later'];
const TITLE_MIN = 5;
const TITLE_MAX = 100;

const EMPTY_DRAFT: NewAdventureDraft = {
  title: '',
  schedule: '',
  priceKsh: '',
  spots: '',
  category: 'Hiking',
  difficulty: 'Moderate',
  socialLevel: 'Social',
  pace: 'Moderate',
  intensity: 'Moderate',
  transport: 'Own transport',
  audience: [],
  when: 'This week',
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

  const titleTooShort = draft.title.trim().length > 0 && draft.title.trim().length < TITLE_MIN;
  const canPublish = draft.title.trim().length >= TITLE_MIN && draft.schedule.trim().length > 0;

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

  const single = <T extends string>(key: keyof NewAdventureDraft) => (values: T[]) => {
    if (values.length > 0) setDraft((d) => ({ ...d, [key]: values[values.length - 1] }));
  };
  const setCategory = single<Category>('category');
  const setDifficulty = single<Difficulty>('difficulty');
  const setSocialLevel = single<SocialLevel>('socialLevel');
  const setPace = single<Pace>('pace');
  const setIntensity = single<Intensity>('intensity');
  const setTransport = single<Transport>('transport');
  const setWhen = single<WhenBucket>('when');
  const setAudience = (values: Audience[]) => setDraft((d) => ({ ...d, audience: values }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>New adventure</Text>

        <FormField
          label="Adventure title"
          required
          value={draft.title}
          onChangeText={(title) => setDraft((d) => ({ ...d, title }))}
          placeholder="e.g. Ngong Hills Sunrise Hike"
          hint="Choose a name participants will immediately understand."
          error={titleTooShort ? `At least ${TITLE_MIN} characters.` : undefined}
          maxLength={TITLE_MAX}
        />
        <FormField
          label="Date and meeting time"
          required
          value={draft.schedule}
          onChangeText={(schedule) => setDraft((d) => ({ ...d, schedule }))}
          placeholder="e.g. Sat, Sep 12 · 6:00am"
          hint="Exactly when and where participants should show up."
        />

        <ChipGroup label="Category" options={CATEGORIES} selected={[draft.category]} onChange={setCategory} multi={false} />

        <ChipGroup label="Difficulty" options={DIFFICULTIES} selected={[draft.difficulty]} onChange={setDifficulty} multi={false} />
        <Text style={styles.hint}>The level that best represents the physical or technical challenge.</Text>

        <ChipGroup label="Social level" options={SOCIAL_LEVELS} selected={[draft.socialLevel]} onChange={setSocialLevel} multi={false} />
        <Text style={styles.hint}>How much interaction should participants expect?</Text>

        <ChipGroup label="Pace" options={PACES} selected={[draft.pace]} onChange={setPace} multi={false} />

        <ChipGroup label="Intensity" options={INTENSITIES} selected={[draft.intensity]} onChange={setIntensity} multi={false} />

        <ChipGroup label="Transport" options={TRANSPORTS} selected={[draft.transport]} onChange={setTransport} multi={false} />

        <ChipGroup label="Who it's for" options={AUDIENCES} selected={draft.audience} onChange={setAudience} multi />
        <Text style={styles.hint}>Select all that reasonably apply — helps the right people find it.</Text>

        <ChipGroup label="When" options={WHEN_BUCKETS} selected={[draft.when]} onChange={setWhen} multi={false} />
        <Text style={styles.hint}>An approximate window — so people can filter Discover by it. Put the exact date above.</Text>

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
        <Text style={styles.hint}>Price shown for information only. Participants pay the organizer directly.</Text>

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
  hint: { ...typography.small, marginTop: -spacing.xs },
});
