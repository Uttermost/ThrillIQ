import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmPanel } from '@/components/ui/ConfirmPanel';
import { InlineError } from '@/components/ui/StateViews';
import { MountainScene } from '@/components/ui/MountainScene';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';

export default function AdventureDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { myId, authenticated, adventures, users, fetchOtherProfile, joinAdventure, leaveAdventure, ensureThreadForAdventure } =
    useApp();
  const adventure = adventures.find((a) => a.id === id);

  const [agreed, setAgreed] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  useEffect(() => {
    if (!adventure) return;
    [adventure.organizerId, ...adventure.participantIds].forEach((uid) => {
      if (!users[uid]) fetchOtherProfile(uid);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adventure?.organizerId, adventure?.participantIds.join(',')]);

  if (!adventure) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Adventure" />
        <Text style={styles.notFound}>This adventure is no longer available.</Text>
      </SafeAreaView>
    );
  }

  const isJoined = adventure.participantIds.includes(myId);
  const isFull = adventure.spotsFilled >= adventure.spotsTotal;

  const handleMessageOrganizer = () => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    const threadId = ensureThreadForAdventure(adventure.id, adventure.organizerId);
    router.push(`/chat/${threadId}`);
  };

  const handleJoin = async () => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    setJoining(true);
    setJoinError(null);
    try {
      await joinAdventure(adventure.id);
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    setLeaveError(null);
    try {
      await leaveAdventure(adventure.id);
      setConfirmingLeave(false);
    } catch (e) {
      setLeaveError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLeaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={adventure.title} />
      <ScrollView contentContainerStyle={styles.content}>
        <MountainScene height={160} />
        <Text style={styles.title}>{adventure.title}</Text>
        <Text style={styles.meta}>
          {adventure.dateLabel}
          {adventure.meetingTime ? `, ${adventure.meetingTime}` : ''} · {adventure.difficulty} · ~KSh{' '}
          {adventure.priceKsh.toLocaleString()} · {adventure.spotsFilled}/{adventure.spotsTotal} spots
        </Text>

        <View style={styles.peopleSection}>
          <Text style={styles.peopleTitle}>Who's going</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peopleRow}>
            {[adventure.organizerId, ...adventure.participantIds].map((uid) => {
              const person = users[uid];
              if (!person) return null;
              return (
                <Pressable key={uid} style={styles.personChip} onPress={() => router.push(`/profile/${uid}`)}>
                  <Avatar initials={person.initials} hue={person.avatarHue} size={44} />
                  <Text style={styles.personName} numberOfLines={1}>
                    {uid === adventure.organizerId ? 'Organizer' : person.name.split(' ')[0]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <Button label="Message organizer" onPress={handleMessageOrganizer} variant="secondary" style={{ marginTop: spacing.md }} />

        {!isJoined ? (
          <>
            <View style={styles.guidelines}>
              <View style={styles.guidelinesHeader}>
                <Ionicons name="warning-outline" size={16} color={colors.hosting} />
                <Text style={styles.guidelinesTitle}>Guidelines</Text>
              </View>
              <Text style={styles.guidelinesText}>{adventure.guidelines.join(' · ')}</Text>
            </View>

            <Pressable style={styles.agreeRow} onPress={() => setAgreed((v) => !v)}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.agreeLabel}>I agree to the adventure guidelines</Text>
            </Pressable>

            <Button
              label={isFull ? 'Adventure full' : 'Join adventure'}
              onPress={handleJoin}
              disabled={!agreed || isFull}
              loading={joining}
              style={{ marginTop: spacing.md }}
            />
            <Text style={styles.disclaimer}>Joining does not charge you. Pay the organizer directly.</Text>

            {joinError && <InlineError message={joinError} onRetry={handleJoin} />}
          </>
        ) : (
          <>
            <View style={styles.goingBadgeRow}>
              <Badge label="✓ You're going" tone="success" />
            </View>

            {!confirmingLeave ? (
              <Pressable onPress={() => setConfirmingLeave(true)}>
                <Text style={styles.leaveLink}>Leave adventure</Text>
              </Pressable>
            ) : (
              <ConfirmPanel
                message="Leave this adventure? Your spot opens up for someone else."
                confirmLabel="Yes, leave"
                cancelLabel="Stay"
                loading={leaving}
                onConfirm={handleLeave}
                onCancel={() => {
                  setConfirmingLeave(false);
                  setLeaveError(null);
                }}
              />
            )}
            {leaveError && <InlineError message={leaveError} onRetry={handleLeave} />}

            <Text style={styles.disclaimer}>Joining does not charge you. Pay the organizer directly.</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.sm },
  notFound: { ...typography.body, padding: spacing.lg },
  title: { ...typography.heading, marginTop: spacing.sm },
  meta: { ...typography.caption },
  guidelines: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  guidelinesHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  guidelinesTitle: { fontWeight: '700', color: colors.hosting, fontSize: 14 },
  guidelinesText: { color: colors.hosting, fontSize: 13 },
  agreeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  agreeLabel: { ...typography.caption, flex: 1 },
  disclaimer: { ...typography.small, textAlign: 'center', marginTop: spacing.sm },
  goingBadgeRow: { marginTop: spacing.md },
  leaveLink: { color: colors.danger, textAlign: 'center', fontWeight: '600', marginTop: spacing.md, fontSize: 14 },
  peopleSection: { marginTop: spacing.md, gap: spacing.sm },
  peopleTitle: { ...typography.caption, fontWeight: '700' },
  peopleRow: { flexDirection: 'row', gap: spacing.md },
  personChip: { alignItems: 'center', width: 56 },
  personName: { ...typography.small, marginTop: spacing.xs },
});
