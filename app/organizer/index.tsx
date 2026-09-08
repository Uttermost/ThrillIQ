import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EmptyState } from '@/components/ui/StateViews';
import { Skeleton } from '@/components/ui/Skeleton';
import { StarRating } from '@/components/ui/StarRating';
import { formatRelativeTime } from '@/lib/relativeTime';
import { useApp } from '@/lib/store';
import { CONTENT_MAX_WIDTH, colors, radius, spacing, type, typography } from '@/lib/theme';
import { Adventure, Review } from '@/lib/types';

const RECENT_REVIEWS = 5;

// Every stat here comes straight from data the app already stores for real
// — adventures organized, who joined, and real submitted reviews. No
// views/saves/shares, join-request queue, attendance, or cancellation-rate
// metrics: none of those are tracked anywhere in the data model (cancelling
// an adventure deletes the doc outright — see cancelAdventureReal — so
// there's no history to compute a rate from), and this dashboard doesn't
// invent numbers to fill the design brief's larger analytics wishlist.
export default function OrganizerDashboard() {
  const { myId, adventures, fetchReviewsForOrganizer } = useApp();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchReviewsForOrganizer(myId).then((list) => {
      if (!cancelled) setReviews(list);
    });
    return () => {
      cancelled = true;
    };
  }, [myId, fetchReviewsForOrganizer]);

  const myAdventures = useMemo(() => adventures.filter((a) => a.organizerId === myId), [adventures, myId]);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: myAdventures.filter((a) => a.dateTimestamp > now).sort((a, b) => a.dateTimestamp - b.dateTimestamp),
      past: myAdventures.filter((a) => a.dateTimestamp <= now).sort((a, b) => b.dateTimestamp - a.dateTimestamp),
    };
  }, [myAdventures]);

  const totalParticipants = useMemo(() => myAdventures.reduce((sum, a) => sum + a.participantIds.length, 0), [myAdventures]);

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const openManage = (a: Adventure) => router.push(`/organizer/${a.id}`);

  const stats = (
    <View style={styles.statsRow}>
      <Stat value={myAdventures.length} label="Hosted" />
      <Stat value={upcoming.length} label="Upcoming" />
      <Stat value={totalParticipants} label="Participants" />
      <Stat value={averageRating != null ? averageRating.toFixed(1) : '—'} label={averageRating != null ? `${reviews?.length} reviews` : 'No reviews yet'} />
    </View>
  );

  const adventureLists = (
    <View style={{ gap: spacing.xl }}>
      {myAdventures.length === 0 ? (
        <EmptyState icon="megaphone-outline" title="Not hosting anything yet" message="Create an adventure to start building your organizer dashboard." />
      ) : (
        <>
          {upcoming.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              {upcoming.map((a) => (
                <AdventureRow key={a.id} adventure={a} onPress={() => openManage(a)} />
              ))}
            </View>
          )}
          {past.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Past</Text>
              {past.map((a) => (
                <AdventureRow key={a.id} adventure={a} onPress={() => openManage(a)} />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );

  const reviewsPanel = (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent reviews</Text>
      {reviews === null ? (
        <Skeleton style={{ height: 80 }} />
      ) : reviews.length === 0 ? (
        <Text style={styles.emptyText}>No reviews yet — they'll show up here once your adventures happen.</Text>
      ) : (
        reviews.slice(0, RECENT_REVIEWS).map((r) => (
          <View key={r.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <StarRating value={r.rating} size={14} />
              <Text style={styles.reviewDate}>{formatRelativeTime(r.createdAt)}</Text>
            </View>
            {!!r.text && (
              <Text style={styles.reviewText} numberOfLines={3}>
                {r.text}
              </Text>
            )}
          </View>
        ))
      )}
    </View>
  );

  if (isWide) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.wideContent}>
          <Text style={styles.wideHeading}>Organizer Dashboard</Text>
          {stats}
          <View style={styles.wideRow}>
            <View style={styles.wideLeft}>{adventureLists}</View>
            <View style={styles.wideRight}>{reviewsPanel}</View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Organizer Dashboard" />
      <ScrollView contentContainerStyle={styles.content}>
        {stats}
        {adventureLists}
        {reviewsPanel}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AdventureRow({ adventure, onPress }: { adventure: Adventure; onPress: () => void }) {
  const isFull = adventure.spotsFilled >= adventure.spotsTotal;
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {adventure.title}
        </Text>
        <Text style={styles.rowMeta}>{adventure.dateLabel}</Text>
      </View>
      <View style={styles.rowStats}>
        <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.rowStatsText}>
          {adventure.spotsFilled}/{adventure.spotsTotal}
          {isFull ? ' · Full' : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  wideContent: { padding: spacing.xl, gap: spacing.xl },
  wideHeading: { ...type.screenHeading },
  wideRow: { flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-start' },
  wideLeft: { flex: 1, minWidth: 0 },
  wideRight: { width: 340, flexShrink: 0, position: 'sticky' as 'relative', top: spacing.lg },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  statLabel: { ...typography.small, marginTop: 2 },
  section: { gap: spacing.sm },
  sectionTitle: { ...type.sectionHeading },
  emptyText: { ...type.secondary, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowInfo: { flex: 1, gap: 2 },
  rowTitle: { ...type.bodyEmphasis },
  rowMeta: { ...type.secondary, color: colors.textSecondary },
  rowStats: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rowStatsText: { ...type.secondary, color: colors.textSecondary },
  reviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewDate: { ...type.caption, color: colors.textMuted },
  reviewText: { ...type.secondary, color: colors.textSecondary },
});
