import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdventureCard } from '@/components/AdventureCard';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { FormField } from '@/components/ui/FormField';
import { InlineError } from '@/components/ui/StateViews';
import { formatDateLabel, formatTimeLabel } from '@/lib/dateFormat';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, type } from '@/lib/theme';
import { Adventure, Audience, Category, Difficulty, Intensity, NewAdventureDraft, Pace, SocialLevel, Transport } from '@/lib/types';

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
const TITLE_MIN = 5;
const TITLE_MAX = 100;
const DESCRIPTION_MAX = 600;
const POLICY_MAX = 300;
const PREP_MAX = 300;

const STEP_TITLES = [
  'Basics',
  'When',
  'Location',
  'Adventure style',
  'Participants',
  'Transport',
  'Preparation',
  'Price',
  'Preview & publish',
] as const;

function defaultScheduledAt(): number {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.getTime();
}

function makeEmptyDraft(): NewAdventureDraft {
  return {
    title: '',
    description: '',
    scheduledAt: defaultScheduledAt(),
    location: '',
    latitude: null,
    longitude: null,
    priceKsh: '',
    cancellationPolicy: '',
    spots: '',
    category: 'Hiking',
    difficulty: 'Moderate',
    socialLevel: 'Social',
    pace: 'Moderate',
    intensity: 'Moderate',
    transport: 'Own transport',
    audience: [],
    childrenWelcome: false,
    equipment: '',
    included: '',
    excluded: '',
    noAlcohol: false,
    petsOk: false,
  };
}

// Deliberately narrower than the spec's 11-step wizard: no Save Draft (no
// draft-persistence backend exists).
function isStepValid(step: number, draft: NewAdventureDraft): boolean {
  switch (step) {
    case 0: // Basics
      return draft.title.trim().length >= TITLE_MIN && draft.description.trim().length > 0;
    case 1: // When
      return draft.scheduledAt > Date.now();
    case 2: // Location
      return draft.location.trim().length > 0;
    case 4: // Participants
      return draft.spots.trim().length > 0 && (parseInt(draft.spots, 10) || 0) > 0;
    default:
      return true;
  }
}

export default function Create() {
  const { createAdventure, myId } = useApp();
  const [draft, setDraft] = useState<NewAdventureDraft>(makeEmptyDraft);
  const [step, setStep] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSuccess(false);
        setStep(0);
        setDraft(makeEmptyDraft());
      };
    }, [])
  );

  const titleTooShort = draft.title.trim().length > 0 && draft.title.trim().length < TITLE_MIN;
  const lastStep = STEP_TITLES.length - 1;
  const stepOk = isStepValid(step, draft);
  const allStepsOk = useMemo(
    () => STEP_TITLES.map((_, i) => i).every((i) => i === lastStep || isStepValid(i, draft)),
    [draft, lastStep]
  );

  const handlePublish = async () => {
    if (!allStepsOk) return;
    setPublishing(true);
    setError(null);
    try {
      const created = await createAdventure(draft);
      setDraft(makeEmptyDraft());
      setStep(0);
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
  const setAudience = (values: Audience[]) => setDraft((d) => ({ ...d, audience: values }));

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setDraft((d) => ({ ...d, latitude: position.coords.latitude, longitude: position.coords.longitude }));
    } catch {
      setLocationError("Couldn't get your location.");
    } finally {
      setLocating(false);
    }
  };

  const previewAdventure: Adventure = {
    id: 'preview',
    title: draft.title.trim() || 'Untitled adventure',
    description: draft.description.trim(),
    category: draft.category,
    difficulty: draft.difficulty,
    socialLevel: draft.socialLevel,
    pace: draft.pace,
    intensity: draft.intensity,
    transport: draft.transport,
    audience: draft.audience,
    dateLabel: formatDateLabel(draft.scheduledAt),
    meetingTime: formatTimeLabel(draft.scheduledAt),
    dateTimestamp: draft.scheduledAt,
    location: draft.location.trim() || 'Location TBC',
    latitude: draft.latitude,
    longitude: draft.longitude,
    priceKsh: parseInt(draft.priceKsh, 10) || 0,
    cancellationPolicy: draft.cancellationPolicy.trim(),
    spotsTotal: Math.max(1, parseInt(draft.spots, 10) || 1),
    spotsFilled: 0,
    childrenWelcome: draft.childrenWelcome,
    equipment: draft.equipment.trim(),
    included: draft.included.trim(),
    excluded: draft.excluded.trim(),
    organizerId: myId,
    participantIds: [],
    guidelines: [...(draft.noAlcohol ? ['No alcohol'] : []), ...(draft.petsOk ? ['Pets ok'] : [])],
    likedByMe: false,
    likeCount: 0,
    coordinate: { x: 0.5, y: 0.5 },
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>New adventure</Text>
        <Text style={styles.stepIndicator}>
          Step {step + 1} of {STEP_TITLES.length} · {STEP_TITLES[step]}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((step + 1) / STEP_TITLES.length) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
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
              label="Description"
              required
              value={draft.description}
              onChangeText={(description) => setDraft((d) => ({ ...d, description }))}
              placeholder="What will you do, and what should people expect?"
              hint="Tell participants what they will experience and what they should expect."
              maxLength={DESCRIPTION_MAX}
              multiline
              numberOfLines={4}
            />
            <ChipGroup label="Category" options={CATEGORIES} selected={[draft.category]} onChange={setCategory} multi={false} />
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.sectionLabel}>Date and time</Text>
            <DateTimeField
              value={new Date(draft.scheduledAt)}
              onChange={(date) => setDraft((d) => ({ ...d, scheduledAt: date.getTime() }))}
              minimumDate={new Date()}
            />
            <Text style={styles.hint}>Exactly when participants should show up.</Text>
          </>
        )}

        {step === 2 && (
          <>
            <FormField
              label="Meeting point"
              required
              value={draft.location}
              onChangeText={(location) => setDraft((d) => ({ ...d, location }))}
              placeholder="e.g. Ngong Hills Main Gate, Kajiado"
              hint="Where participants should meet you — as specific as you can make it."
            />
            <Pressable onPress={handleUseCurrentLocation} style={styles.locationBtn} disabled={locating}>
              <Ionicons name="locate-outline" size={16} color={colors.primary} />
              <Text style={styles.locationBtnLabel}>
                {locating ? 'Locating…' : draft.latitude != null ? 'Location attached ✓' : 'Use my current location'}
              </Text>
            </Pressable>
            {locationError && <Text style={styles.hint}>{locationError}</Text>}
            <Text style={styles.hint}>Optional — lets people find this adventure with "Near me" on Discover.</Text>
          </>
        )}

        {step === 3 && (
          <>
            <ChipGroup label="Difficulty" options={DIFFICULTIES} selected={[draft.difficulty]} onChange={setDifficulty} multi={false} />
            <Text style={styles.hint}>The level that best represents the physical or technical challenge.</Text>

            <ChipGroup label="Social level" options={SOCIAL_LEVELS} selected={[draft.socialLevel]} onChange={setSocialLevel} multi={false} />
            <Text style={styles.hint}>How much interaction should participants expect?</Text>

            <ChipGroup label="Pace" options={PACES} selected={[draft.pace]} onChange={setPace} multi={false} />
            <ChipGroup label="Intensity" options={INTENSITIES} selected={[draft.intensity]} onChange={setIntensity} multi={false} />
          </>
        )}

        {step === 4 && (
          <>
            <View style={styles.row}>
              <TextInput
                value={draft.spots}
                onChangeText={(spots) => setDraft((d) => ({ ...d, spots: spots.replace(/[^0-9]/g, '') }))}
                placeholder="Total spots"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                style={[styles.input, styles.flex]}
              />
            </View>
            <ChipGroup label="Who it's for" options={AUDIENCES} selected={draft.audience} onChange={setAudience} multi />
            <Text style={styles.hint}>Select all that reasonably apply — helps the right people find it.</Text>

            <Pressable
              onPress={() => setDraft((d) => ({ ...d, childrenWelcome: !d.childrenWelcome }))}
              style={[styles.toggleChip, draft.childrenWelcome && styles.toggleChipActive]}>
              <Text style={[styles.toggleChipLabel, draft.childrenWelcome && styles.toggleChipLabelActive]}>Children welcome</Text>
            </Pressable>
          </>
        )}

        {step === 5 && <ChipGroup label="Transport" options={TRANSPORTS} selected={[draft.transport]} onChange={setTransport} multi={false} />}

        {step === 6 && (
          <>
            <FormField
              label="What to bring"
              value={draft.equipment}
              onChangeText={(equipment) => setDraft((d) => ({ ...d, equipment }))}
              placeholder="e.g. Hiking shoes, 2L water, sunscreen"
              hint="Optional — what participants should bring or wear."
              maxLength={PREP_MAX}
              multiline
            />
            <FormField
              label="What's included"
              value={draft.included}
              onChangeText={(included) => setDraft((d) => ({ ...d, included }))}
              placeholder="e.g. Guide, park entry"
              hint="Optional — what's covered by the price above."
              maxLength={PREP_MAX}
              multiline
            />
            <FormField
              label="What's not included"
              value={draft.excluded}
              onChangeText={(excluded) => setDraft((d) => ({ ...d, excluded }))}
              placeholder="e.g. Transport, food and drinks"
              hint="Optional — what participants should plan for separately."
              maxLength={PREP_MAX}
              multiline
            />
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
          </>
        )}

        {step === 7 && (
          <>
            <View style={styles.row}>
              <TextInput
                value={draft.priceKsh}
                onChangeText={(priceKsh) => setDraft((d) => ({ ...d, priceKsh: priceKsh.replace(/[^0-9]/g, '') }))}
                placeholder="Price KSh (info only)"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                style={[styles.input, styles.flex]}
              />
            </View>
            <Text style={styles.hint}>Price shown for information only. Participants pay the organizer directly.</Text>
            <FormField
              label="Cancellation policy"
              value={draft.cancellationPolicy}
              onChangeText={(cancellationPolicy) => setDraft((d) => ({ ...d, cancellationPolicy }))}
              placeholder="e.g. Full refund if cancelled 24h before start"
              hint="Optional — let participants know what to expect if plans change."
              maxLength={POLICY_MAX}
              multiline
            />
          </>
        )}

        {step === 8 && (
          <>
            <Text style={styles.previewHint}>This is how your adventure will appear on Discover.</Text>
            <AdventureCard adventure={previewAdventure} onPress={() => {}} />
            {(draft.equipment || draft.included || draft.excluded || draft.cancellationPolicy) && (
              <View style={styles.prepSummary}>
                {draft.equipment ? <Text style={styles.prepLine}>Bring: {draft.equipment}</Text> : null}
                {draft.included ? <Text style={styles.prepLine}>Included: {draft.included}</Text> : null}
                {draft.excluded ? <Text style={styles.prepLine}>Not included: {draft.excluded}</Text> : null}
                {draft.cancellationPolicy ? <Text style={styles.prepLine}>Cancellation: {draft.cancellationPolicy}</Text> : null}
              </View>
            )}
            {error && <InlineError message={error} retryLabel="Retry" onRetry={handlePublish} />}
            {success && !error && <Text style={styles.successText}>✓ Published. It's live on Discover.</Text>}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <Pressable style={styles.backBtn} onPress={() => setStep((s) => Math.max(0, s - 1))} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
        )}
        {step < lastStep ? (
          <Button label="Next" onPress={() => setStep((s) => Math.min(lastStep, s + 1))} disabled={!stepOk} style={styles.nextBtn} />
        ) : (
          <Button label="Publish" onPress={handlePublish} disabled={!allStepsOk} loading={publishing} style={styles.nextBtn} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, gap: spacing.xs },
  heading: { ...type.screenHeading },
  stepIndicator: { ...type.secondary, color: colors.textSecondary },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: colors.primary },
  content: { padding: spacing.lg, paddingTop: 0, gap: spacing.md },
  previewHint: { ...type.secondary, color: colors.textSecondary },
  prepSummary: { gap: spacing.xs, padding: spacing.lg, backgroundColor: colors.surfaceMuted, borderRadius: radius.lg },
  prepLine: { ...type.secondary, color: colors.textSecondary },
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
    alignSelf: 'flex-start',
  },
  toggleChipActive: { backgroundColor: colors.accentMuted, borderColor: colors.accent },
  toggleChipLabel: { ...type.chip, color: colors.textPrimary },
  toggleChipLabelActive: { color: colors.hosting },
  successText: { color: colors.success, textAlign: 'center', fontWeight: '600' },
  hint: { ...type.secondary, color: colors.textMuted, marginTop: -spacing.xs },
  sectionLabel: { ...type.inputLabel },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start' },
  locationBtnLabel: { ...type.bodyEmphasis, color: colors.primary },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingRight: spacing.sm },
  backLabel: { ...type.bodyEmphasis },
  nextBtn: { flex: 1 },
});
