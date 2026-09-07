import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { InlineError } from '@/components/ui/StateViews';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { Category, Difficulty, ExperienceLevel, Intensity, Pace, ProfileTag, SocialLevel } from '@/lib/types';

const INTEREST_OPTIONS = ['Hiking', 'Road trips', 'Photography', 'Cycling', 'Nature', 'Camping', 'Wildlife', 'Running'] as const;
const CATEGORY_OPTIONS: Category[] = [
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
const DIFFICULTY_OPTIONS: Difficulty[] = ['Easy', 'Moderate', 'Challenging', 'Extreme'];
const SOCIAL_OPTIONS: SocialLevel[] = ['Quiet', 'Social', 'Very Social'];
const PACE_OPTIONS: Pace[] = ['Relaxed', 'Moderate', 'Fast'];
const INTENSITY_OPTIONS: Intensity[] = ['Easy', 'Moderate', 'Challenging', 'Extreme'];
const EXPERIENCE_OPTIONS: ExperienceLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const TAG_OPTIONS: ProfileTag[] = ['Photography', 'Networking', 'Families', 'Solo adventures', 'Couples'];

export default function EditProfile() {
  const { me, updateProfile } = useApp();

  const [name, setName] = useState(me.name);
  const [username, setUsername] = useState(me.username ?? '');
  const [bio, setBio] = useState(me.bio ?? '');
  const [location, setLocation] = useState(me.location ?? '');
  const [interests, setInterests] = useState<string[]>(me.interests ?? []);
  const [categories, setCategories] = useState<Category[]>(me.adventureCategories ?? []);
  const [difficulty, setDifficulty] = useState<Difficulty[]>(me.preferredDifficulty ? [me.preferredDifficulty] : []);
  const [social, setSocial] = useState<SocialLevel[]>(me.preferredSocialLevel ? [me.preferredSocialLevel] : []);
  const [pace, setPace] = useState<Pace[]>(me.preferredPace ? [me.preferredPace] : []);
  const [intensity, setIntensity] = useState<Intensity[]>(me.preferredIntensity ? [me.preferredIntensity] : []);
  const [experience, setExperience] = useState<ExperienceLevel[]>(me.experienceLevel ? [me.experienceLevel] : []);
  const [tags, setTags] = useState<ProfileTag[]>(me.tags ?? []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const completion = useMemo(() => {
    const checks = [
      bio.trim().length > 0,
      location.trim().length > 0,
      interests.length > 0,
      categories.length > 0,
      difficulty.length > 0,
      social.length > 0,
      pace.length > 0,
      intensity.length > 0,
      experience.length > 0,
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  }, [bio, location, interests, categories, difficulty, social, pace, intensity, experience]);

  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        location: location.trim(),
        interests,
        adventureCategories: categories,
        preferredDifficulty: difficulty[0] ?? null,
        preferredSocialLevel: social[0] ?? null,
        preferredPace: pace[0] ?? null,
        preferredIntensity: intensity[0] ?? null,
        experienceLevel: experience[0] ?? null,
        tags,
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Edit profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.photoRow}>
          <Avatar initials={me.initials} hue={me.avatarHue} size={72} />
          <Text style={styles.photoNote}>Photo upload isn't available yet.</Text>
        </View>

        <View style={styles.completionRow}>
          <View style={styles.completionTrack}>
            <View style={[styles.completionFill, { width: `${completion}%` }]} />
          </View>
          <Text style={styles.completionLabel}>{completion}% complete</Text>
        </View>

        <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={colors.textMuted} style={styles.input} />
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Bio"
          placeholderTextColor={colors.textMuted}
          multiline
          style={[styles.input, styles.multiline]}
        />
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Location (city or area)"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Text style={styles.hint}>Approximate location only — never your exact address.</Text>

        <ChipGroup label="Interests" options={INTEREST_OPTIONS} selected={interests} onChange={setInterests} />
        <ChipGroup label="Adventure categories" options={CATEGORY_OPTIONS} selected={categories} onChange={setCategories} />
        <ChipGroup label="Preferred difficulty" options={DIFFICULTY_OPTIONS} selected={difficulty} onChange={setDifficulty} multi={false} />
        <ChipGroup label="Social level" options={SOCIAL_OPTIONS} selected={social} onChange={setSocial} multi={false} />
        <ChipGroup label="Pace" options={PACE_OPTIONS} selected={pace} onChange={setPace} multi={false} />
        <ChipGroup label="Intensity" options={INTENSITY_OPTIONS} selected={intensity} onChange={setIntensity} multi={false} />
        <ChipGroup label="Experience level" options={EXPERIENCE_OPTIONS} selected={experience} onChange={setExperience} multi={false} />
        <ChipGroup label="Also interested in" options={TAG_OPTIONS} selected={tags} onChange={setTags} />

        <View style={styles.statsRow}>
          <Stat value={me.completedAdventuresCount ?? 0} label="Completed" />
          <Stat value={me.connectionsCount ?? 0} label="Connections" />
          <Stat value={me.crewIds?.length ?? 0} label="Crews" />
        </View>

        <Button label="Save changes" onPress={handleSave} disabled={!canSave} loading={saving} style={{ marginTop: spacing.md }} />
        {error && <InlineError message={error} onRetry={handleSave} />}
        {saved && !error && <Text style={styles.savedText}>✓ Profile updated.</Text>}

        <Button label="Privacy settings" variant="ghost" onPress={() => router.push('/profile/privacy')} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  photoRow: { alignItems: 'center', gap: spacing.sm },
  photoNote: { ...typography.small },
  completionRow: { gap: spacing.xs },
  completionTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  completionFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  completionLabel: { ...typography.small, textAlign: 'right' },
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
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  hint: { ...typography.small, marginTop: -spacing.sm },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  statLabel: { ...typography.small, marginTop: 2 },
  savedText: { color: colors.success, textAlign: 'center', fontWeight: '600' },
});
