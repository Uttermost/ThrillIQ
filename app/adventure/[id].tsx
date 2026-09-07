import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmPanel } from '@/components/ui/ConfirmPanel';
import { InlineError } from '@/components/ui/StateViews';
import { MountainScene } from '@/components/ui/MountainScene';
import { StarRating } from '@/components/ui/StarRating';
import { colors, iconSize, radius, spacing, type } from '@/lib/theme';
import { useApp } from '@/lib/store';
import { Review } from '@/lib/types';

export default function AdventureDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    myId,
    authenticated,
    adventures,
    users,
    fetchOtherProfile,
    joinAdventure,
    leaveAdventure,
    ensureThreadForAdventure,
    hasReviewed,
    submitReview,
    fetchWaitlist,
    joinWaitlist,
    leaveWaitlist,
  } = useApp();
  const adventure = adventures.find((a) => a.id === id);

  const [agreed, setAgreed] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [waitlistBusy, setWaitlistBusy] = useState(false);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!adventure) return;
    [adventure.organizerId, ...adventure.participantIds].forEach((uid) => {
      if (!users[uid]) fetchOtherProfile(uid);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adventure?.organizerId, adventure?.participantIds.join(',')]);

  // None of the current seed adventures have happened yet (mockData.ts's
  // four listings are all future-dated) — this is correctly unreachable
  // until a real adventure's date passes, not a bug.
  const canReview = !!adventure && adventure.participantIds.includes(myId) && adventure.organizerId !== myId && adventure.dateTimestamp < Date.now();

  const adventureId = adventure?.id;
  useEffect(() => {
    if (!canReview || !adventureId) return;
    let cancelled = false;
    hasReviewed(adventureId).then((v) => {
      if (!cancelled) setAlreadyReviewed(v);
    });
    return () => {
      cancelled = true;
    };
  }, [canReview, adventureId, hasReviewed]);

  const needsWaitlist = !!adventure && adventure.spotsFilled >= adventure.spotsTotal && !adventure.participantIds.includes(myId);
  useEffect(() => {
    if (!needsWaitlist || !adventureId) {
      setWaitlistPosition(null);
      return;
    }
    let cancelled = false;
    fetchWaitlist(adventureId).then((list) => {
      if (cancelled) return;
      const idx = list.findIndex((w) => w.userId === myId);
      setWaitlistPosition(idx === -1 ? null : idx + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [needsWaitlist, adventureId, myId, fetchWaitlist]);

  if (!adventure) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFoundHeader}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
        <Text style={styles.notFound}>This adventure is no longer available.</Text>
      </SafeAreaView>
    );
  }

  const isJoined = adventure.participantIds.includes(myId);
  const isFull = adventure.spotsFilled >= adventure.spotsTotal;
  const organizer = users[adventure.organizerId];

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return;
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      await submitReview({ adventureId: adventure.id, organizerId: adventure.organizerId, rating: reviewRating as Review['rating'], text: reviewText });
      setReviewSubmitted(true);
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setReviewSubmitting(false);
    }
  };

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

  const handleJoinWaitlist = async () => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    setWaitlistBusy(true);
    setWaitlistError(null);
    try {
      await joinWaitlist(adventure.id);
      const list = await fetchWaitlist(adventure.id);
      setWaitlistPosition(list.findIndex((w) => w.userId === myId) + 1 || null);
    } catch (e) {
      setWaitlistError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setWaitlistBusy(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    setWaitlistBusy(true);
    setWaitlistError(null);
    try {
      await leaveWaitlist(adventure.id);
      setWaitlistPosition(null);
    } catch (e) {
      setWaitlistError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setWaitlistBusy(false);
    }
  };

  const vibeChips = [adventure.socialLevel, `${adventure.pace} pace`, adventure.category];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroWrap}>
          <MountainScene height={220} rounded={false} />
          <Pressable onPress={() => router.back()} style={styles.heroBtn} hitSlop={8} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={iconSize.standard} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.heroActions}>
            <Pressable style={styles.heroBtn} hitSlop={8} accessibilityLabel="Save">
              <Ionicons name="heart-outline" size={iconSize.standard} color={colors.textPrimary} />
            </Pressable>
            <Pressable style={styles.heroBtn} hitSlop={8} accessibilityLabel="Share">
              <Ionicons name="share-outline" size={iconSize.standard} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{adventure.title}</Text>

          <View style={styles.keyFacts}>
            <KeyFact icon="calendar-outline" label={adventure.dateLabel} />
            {!!adventure.meetingTime && <KeyFact icon="time-outline" label={adventure.meetingTime} />}
            <KeyFact icon="location-outline" label={adventure.location} />
            <KeyFact icon="trending-up-outline" label={adventure.difficulty} />
            <KeyFact icon="pricetag-outline" label={adventure.priceKsh > 0 ? `~KSh ${adventure.priceKsh.toLocaleString()}` : 'Free'} />
            <KeyFact icon="people-outline" label={`${adventure.spotsFilled}/${adventure.spotsTotal} spots${isFull ? ' · Full' : ''}`} />
          </View>

          {!!adventure.description && (
            <Section title="About">
              <Text style={styles.body}>{adventure.description}</Text>
            </Section>
          )}

          <Section title="Adventure vibe">
            <View style={styles.chipRow}>
              {vibeChips.map((c) => (
                <View key={c} style={styles.vibeChip}>
                  <Text style={styles.vibeChipText}>{c}</Text>
                </View>
              ))}
            </View>
          </Section>

          {adventure.audience.length > 0 && (
            <Section title="Who is this for?">
              <View style={styles.chipRow}>
                {adventure.audience.map((a) => (
                  <View key={a} style={styles.audienceChip}>
                    <Text style={styles.audienceChipText}>{a}</Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          <Section title="Transport">
            <Text style={styles.body}>{adventure.transport}</Text>
          </Section>

          <Section title="Meeting point">
            <Text style={styles.body}>{adventure.location}</Text>
          </Section>

          <View style={styles.guidelines}>
            <View style={styles.guidelinesHeader}>
              <Ionicons name="warning-outline" size={16} color={colors.hosting} />
              <Text style={styles.guidelinesTitle}>Guidelines</Text>
            </View>
            <Text style={styles.guidelinesText}>{adventure.guidelines.join(' · ')}</Text>
          </View>

          {canReview && !alreadyReviewed && !reviewSubmitted && (
            <Section title="Rate this adventure">
              <StarRating value={reviewRating} onChange={setReviewRating} size={26} />
              <TextInput
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="Share how it went (optional)"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                maxLength={600}
                style={styles.reviewInput}
              />
              {reviewError && <InlineError message={reviewError} onRetry={handleSubmitReview} />}
              <Button label="Submit review" onPress={handleSubmitReview} disabled={reviewRating === 0} loading={reviewSubmitting} />
            </Section>
          )}
          {canReview && (alreadyReviewed || reviewSubmitted) && <Text style={styles.reviewThanks}>✓ Thanks for your review.</Text>}

          {organizer && (
            <Section title="Organizer">
              <Pressable style={styles.organizerRow} onPress={() => router.push(`/profile/${organizer.id}`)}>
                <Avatar initials={organizer.initials} hue={organizer.avatarHue} size={44} />
                <View style={styles.organizerText}>
                  <Text style={styles.organizerName}>{organizer.name}</Text>
                  <Text style={styles.organizerMeta}>{organizer.completedAdventuresCount ?? 0} adventures hosted</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            </Section>
          )}

          <View style={styles.peopleSection}>
            <Text style={styles.sectionTitle}>Who's going</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.peopleScroll}
              contentContainerStyle={styles.peopleRow}>
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
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {isFull && !isJoined ? (
          <>
            {waitlistError && <InlineError message={waitlistError} onRetry={waitlistPosition ? handleLeaveWaitlist : handleJoinWaitlist} />}
            {waitlistPosition ? (
              <>
                <Badge label={`You're #${waitlistPosition} on the waitlist`} tone="accent" style={{ alignSelf: 'center' }} />
                <Button label="Leave waitlist" variant="secondary" onPress={handleLeaveWaitlist} loading={waitlistBusy} />
              </>
            ) : (
              <Button label="Join waitlist" onPress={handleJoinWaitlist} loading={waitlistBusy} />
            )}
            <Text style={styles.disclaimer}>We'll let you know here if a spot opens up.</Text>
          </>
        ) : !isJoined ? (
          <>
            {joinError && <InlineError message={joinError} onRetry={handleJoin} />}
            <Pressable style={styles.agreeRow} onPress={() => setAgreed((v) => !v)}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.agreeLabel}>I agree to the adventure guidelines</Text>
            </Pressable>
            <Button label="Join Adventure" onPress={handleJoin} disabled={!agreed} loading={joining} />
            <Text style={styles.disclaimer}>Joining does not charge you. Pay the organizer directly.</Text>
          </>
        ) : confirmingLeave ? (
          <>
            {leaveError && <InlineError message={leaveError} onRetry={handleLeave} />}
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
          </>
        ) : (
          <>
            <View style={styles.goingRow}>
              <Badge label="✓ You're going" tone="success" />
              <Pressable onPress={() => setConfirmingLeave(true)} hitSlop={8}>
                <Text style={styles.leaveLink}>Leave Adventure</Text>
              </Pressable>
            </View>
            <Text style={styles.disclaimer}>Joining does not charge you. Pay the organizer directly.</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function KeyFact({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.keyFact}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.keyFactText}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  notFoundHeader: { padding: spacing.lg },
  notFound: { ...type.body, padding: spacing.lg },
  heroWrap: { position: 'relative' },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
  },
  heroActions: { position: 'absolute', top: spacing.lg, right: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  content: { padding: spacing.lg, gap: spacing.xl },
  title: { ...type.screenHeading, marginTop: -spacing.sm },
  keyFacts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: -spacing.md },
  keyFact: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minWidth: '45%' },
  keyFactText: { ...type.secondary, color: colors.textSecondary, flexShrink: 1 },
  section: { gap: spacing.sm },
  sectionTitle: { ...type.cardTitle },
  body: { ...type.body, color: colors.textSecondary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  vibeChip: { backgroundColor: colors.primarySurface, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  vibeChipText: { ...type.chip, color: colors.primary },
  audienceChip: { backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  audienceChipText: { ...type.chip, color: colors.textSecondary },
  guidelines: {
    backgroundColor: colors.accentMuted,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  guidelinesHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  guidelinesTitle: { fontWeight: '700', color: colors.hosting, fontSize: 14 },
  guidelinesText: { color: colors.hosting, fontSize: 13 },
  reviewInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 70,
    textAlignVertical: 'top',
    ...type.body,
  },
  reviewThanks: { ...type.bodyEmphasis, color: colors.success },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  organizerText: { flex: 1 },
  organizerName: { ...type.bodyEmphasis },
  organizerMeta: { ...type.secondary, color: colors.textMuted, marginTop: 2 },
  peopleSection: { gap: spacing.sm },
  // Explicit height on the ScrollView itself, not just contentContainerStyle
  // — see the matching comment in app/(tabs)/discover.tsx for why a
  // horizontal ScrollView needs this on web.
  peopleScroll: { height: 68, flexGrow: 0, flexShrink: 0 },
  peopleRow: { flexDirection: 'row', gap: spacing.md },
  personChip: { alignItems: 'center', width: 56 },
  personName: { ...type.caption, marginTop: spacing.xs },
  bottomBar: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  agreeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
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
  agreeLabel: { ...type.secondary, flex: 1 },
  disclaimer: { ...type.caption, textAlign: 'center', color: colors.textMuted },
  goingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leaveLink: { color: colors.danger, fontWeight: '600', fontSize: 14 },
});
