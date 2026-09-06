import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { DEFAULT_PRIVACY, User } from '@/lib/types';

export default function ParticipantProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { myId, authenticated, adventures, fetchOtherProfile, ensureThreadForAdventure } = useApp();
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    fetchOtherProfile(id).then((p) => {
      if (!cancelled) setProfile(p);
    });
    return () => {
      cancelled = true;
    };
  }, [id, fetchOtherProfile]);

  // Computable today without a Connections system: adventures where both
  // people appear, either as organizer or participant.
  const sharedAdventures = useMemo(() => {
    return adventures.filter((a) => {
      const ids = [a.organizerId, ...a.participantIds];
      return ids.includes(id) && ids.includes(myId);
    });
  }, [adventures, id, myId]);

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Profile" />
        <View style={styles.content}>
          <Skeleton style={{ height: 200 }} />
        </View>
      </SafeAreaView>
    );
  }

  const privacy = profile.privacy ?? DEFAULT_PRIVACY;
  const isSelf = id === myId;
  const showLocation = privacy.locationVisibility !== 'Hidden' && !!profile.location;

  const preferenceBits = [profile.experienceLevel, profile.preferredSocialLevel, profile.preferredPace ? `${profile.preferredPace} pace` : null].filter(
    Boolean
  );

  const handleMessage = () => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    const adventureId = sharedAdventures[0]?.id ?? `direct-${id}`;
    const threadId = ensureThreadForAdventure(adventureId, id);
    router.push(`/chat/${threadId}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={profile.name} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Avatar initials={profile.initials} hue={profile.avatarHue} size={80} />
          <Text style={styles.name}>{profile.name}</Text>
          {!!profile.username && <Text style={styles.username}>@{profile.username}</Text>}
          {showLocation && <Text style={styles.location}>{profile.location}</Text>}
        </View>

        {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        {preferenceBits.length > 0 && (
          <View style={styles.chipRow}>
            {preferenceBits.map((bit) => (
              <Badge key={bit} label={bit as string} tone="accent" />
            ))}
          </View>
        )}

        {!!profile.interests?.length && (
          <View style={styles.chipRow}>
            {profile.interests.map((interest) => (
              <Badge key={interest} label={interest} tone="neutral" />
            ))}
          </View>
        )}

        {privacy.showCompletedAdventures && (
          <View style={styles.statsRow}>
            <Stat value={profile.completedAdventuresCount ?? 0} label="Completed" />
            {privacy.showConnections && <Stat value={profile.connectionsCount ?? 0} label="Connections" />}
          </View>
        )}

        {!isSelf && sharedAdventures.length > 0 && (
          <View style={styles.sharedBox}>
            <Text style={styles.sharedText}>
              You've been on {sharedAdventures.length} adventure{sharedAdventures.length > 1 ? 's' : ''} together — met at{' '}
              {sharedAdventures[0].title}.
            </Text>
          </View>
        )}

        {!isSelf && <Button label="Message" onPress={handleMessage} style={{ marginTop: spacing.md }} />}
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
  content: { padding: spacing.lg, gap: spacing.md },
  header: { alignItems: 'center', gap: spacing.xs },
  name: { ...typography.heading, marginTop: spacing.sm },
  username: { ...typography.caption },
  location: { ...typography.small },
  bio: { ...typography.body, textAlign: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  statLabel: { ...typography.small, marginTop: 2 },
  sharedBox: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  sharedText: { color: colors.hosting, fontSize: 13 },
});
