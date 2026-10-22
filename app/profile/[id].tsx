import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ReportSheet } from '@/components/ui/ReportSheet';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { StarRating } from '@/components/ui/StarRating';
import { EmptyState } from '@/components/ui/StateViews';
import { formatRelativeTime } from '@/lib/relativeTime';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { Connection, DEFAULT_PRIVACY, Review, User } from '@/lib/types';

export default function ParticipantProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    myId,
    authenticated,
    adventures,
    crews,
    posts,
    users,
    fetchOtherProfile,
    fetchReviewsForOrganizer,
    fetchConnectionsFor,
    sendConnectionRequest,
    respondToConnectionRequest,
    ensureThreadForAdventure,
    myFollowingIds,
    fetchFollowersFor,
    fetchFollowingFor,
    followUser,
    unfollowUser,
  } = useApp();
  const [profile, setProfile] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [connectionBusy, setConnectionBusy] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [followBusy, setFollowBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'photos'>('about');

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

  useEffect(() => {
    let cancelled = false;
    setReviews(null);
    fetchReviewsForOrganizer(id).then((list) => {
      if (!cancelled) setReviews(list);
    });
    return () => {
      cancelled = true;
    };
  }, [id, fetchReviewsForOrganizer]);

  useEffect(() => {
    reviews?.forEach((r) => {
      if (!users[r.reviewerId]) fetchOtherProfile(r.reviewerId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews]);

  useEffect(() => {
    let cancelled = false;
    setConnections(null);
    fetchConnectionsFor(id).then((list) => {
      if (!cancelled) setConnections(list);
    });
    return () => {
      cancelled = true;
    };
  }, [id, fetchConnectionsFor]);

  useEffect(() => {
    let cancelled = false;
    setFollowerCount(null);
    setFollowingCount(null);
    fetchFollowersFor(id).then((list) => {
      if (!cancelled) setFollowerCount(list.length);
    });
    fetchFollowingFor(id).then((list) => {
      if (!cancelled) setFollowingCount(list.length);
    });
    return () => {
      cancelled = true;
    };
  }, [id, fetchFollowersFor, fetchFollowingFor]);

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const myConnection = connections?.find((c) => c.participantIds.includes(myId)) ?? null;
  const acceptedConnectionCount = connections?.filter((c) => c.status === 'accepted').length ?? 0;
  const memberCrews = crews.filter((c) => c.memberIds.includes(id));

  // Computable today without a Connections system: adventures where both
  // people appear, either as organizer or participant.
  const sharedAdventures = useMemo(() => {
    return adventures.filter((a) => {
      const ids = [a.organizerId, ...a.participantIds];
      return ids.includes(id) && ids.includes(myId);
    });
  }, [adventures, id, myId]);

  // Real photos this person has actually posted — `posts` is already loaded
  // client-side, no separate fetch needed. Deliberately just post photos,
  // not review photos they attached reviewing someone else — those are
  // about the organizer being reviewed, not this person's own gallery.
  const profilePhotos = useMemo(
    () =>
      posts
        .filter((p) => p.authorId === id)
        .sort((a, b) => b.createdAt - a.createdAt)
        .flatMap((p) => (p.photos ?? []).map((uri, i) => ({ uri, postId: p.id, key: `${p.id}-${i}` }))),
    [posts, id]
  );

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

  const handleConnect = async () => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    setConnectionBusy(true);
    try {
      await sendConnectionRequest(id);
      setConnections((prev) => [
        ...(prev ?? []),
        {
          id: '',
          participantIds: [myId, id].sort() as [string, string],
          requesterId: myId,
          recipientId: id,
          status: 'pending' as const,
          createdAt: Date.now(),
        },
      ]);
    } catch {
      // Best-effort: the button just stays as "Connect" on failure.
    } finally {
      setConnectionBusy(false);
    }
  };

  const handleRespond = async (accept: boolean) => {
    if (!myConnection) return;
    setConnectionBusy(true);
    try {
      await respondToConnectionRequest(myConnection.id, accept);
      setConnections((prev) =>
        (prev ?? [])
          .map((c) => (c.id === myConnection.id ? { ...c, status: 'accepted' as const } : c))
          .filter((c) => accept || c.id !== myConnection.id)
      );
    } catch {
      // Best-effort: the buttons just stay visible on failure.
    } finally {
      setConnectionBusy(false);
    }
  };

  const isFollowing = myFollowingIds.has(id);

  const handleFollowToggle = async () => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    setFollowBusy(true);
    try {
      if (isFollowing) {
        await unfollowUser(id);
        setFollowerCount((prev) => (prev != null ? Math.max(0, prev - 1) : prev));
      } else {
        await followUser(id);
        setFollowerCount((prev) => (prev != null ? prev + 1 : prev));
      }
    } catch {
      // Best-effort: the button just reflects myFollowingIds either way,
      // which only changes once the write actually succeeded.
    } finally {
      setFollowBusy(false);
    }
  };

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
          {!isSelf && (
            <Button
              label={isFollowing ? 'Following' : 'Follow'}
              accessibilityLabel={isFollowing ? 'Unfollow' : 'Follow'}
              variant={isFollowing ? 'secondary' : 'primary'}
              onPress={handleFollowToggle}
              loading={followBusy}
              style={styles.followBtn}
            />
          )}
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

        <View style={styles.statsRow}>
          {privacy.showCompletedAdventures && <Stat value={profile.completedAdventuresCount ?? 0} label="Completed" />}
          {privacy.showConnections && <Stat value={acceptedConnectionCount} label="Connections" />}
          <Stat value={followerCount ?? 0} label="Followers" />
          <Stat value={followingCount ?? 0} label="Following" />
        </View>

        <View style={styles.tabRow}>
          <Pressable onPress={() => setActiveTab('about')} style={[styles.tabBtn, activeTab === 'about' && styles.tabBtnActive]}>
            <Text style={[styles.tabLabel, activeTab === 'about' && styles.tabLabelActive]}>About</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab('photos')} style={[styles.tabBtn, activeTab === 'photos' && styles.tabBtnActive]}>
            <Text style={[styles.tabLabel, activeTab === 'photos' && styles.tabLabelActive]}>Photos & Videos</Text>
          </Pressable>
        </View>

        {activeTab === 'about' && (
          <>
            {privacy.showCrews && memberCrews.length > 0 && (
              <View style={styles.chipRow}>
                {memberCrews.map((c) => (
                  <Pressable key={c.id} onPress={() => router.push(`/crew/${c.id}`)}>
                    <Badge label={c.name} tone="neutral" />
                  </Pressable>
                ))}
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

            {reviews && reviews.length > 0 && (
              <View style={styles.reviewsSection}>
                <View style={styles.reviewsHeader}>
                  <Text style={styles.reviewsTitle}>Reviews</Text>
                  <View style={styles.reviewsSummary}>
                    <StarRating value={averageRating ?? 0} size={16} />
                    <Text style={styles.reviewsCount}>
                      {averageRating?.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
                {reviews.map((r) => {
                  const reviewer = users[r.reviewerId];
                  return (
                    <View key={r.id} style={styles.reviewCard}>
                      <View style={styles.reviewCardHeader}>
                        <Text style={styles.reviewerName}>{reviewer?.name ?? 'Someone'}</Text>
                        <Text style={styles.reviewDate}>{formatRelativeTime(r.createdAt)}</Text>
                      </View>
                      <StarRating value={r.rating} size={14} />
                      {!!r.text && <Text style={styles.reviewText}>{r.text}</Text>}
                      {!!r.photos?.length && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewPhotoRow}>
                          {r.photos.map((uri, i) => (
                            <Image key={i} source={{ uri }} style={styles.reviewPhoto} />
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {activeTab === 'photos' &&
          (profilePhotos.length === 0 ? (
            <EmptyState
              icon="images-outline"
              title="No photos yet"
              message={isSelf ? "Photos you add to a post will show up here." : `${profile.name.split(' ')[0]} hasn't posted any photos yet.`}
            />
          ) : (
            <View style={styles.photoGrid}>
              {profilePhotos.map((item) => (
                <Pressable key={item.key} style={styles.photoGridItem} onPress={() => router.push(`/post/${item.postId}`)}>
                  <Image source={{ uri: item.uri }} style={styles.photoGridImage} />
                </Pressable>
              ))}
            </View>
          ))}

        {!isSelf && privacy.whoCanConnect !== 'Nobody' && connections && (
          <View style={styles.connectionActions}>
            {!myConnection && <Button label="Connect" variant="secondary" onPress={handleConnect} loading={connectionBusy} />}
            {myConnection?.status === 'accepted' && <Badge label="✓ Connected" tone="success" />}
            {myConnection?.status === 'pending' && myConnection.requesterId === myId && (
              <Badge label="Request sent" tone="neutral" />
            )}
            {myConnection?.status === 'pending' && myConnection.requesterId === id && (
              <View style={styles.respondRow}>
                <Button label="Accept" onPress={() => handleRespond(true)} loading={connectionBusy} style={styles.respondBtn} />
                <Button label="Decline" variant="secondary" onPress={() => handleRespond(false)} loading={connectionBusy} style={styles.respondBtn} />
              </View>
            )}
          </View>
        )}

        {!isSelf && <Button label="Message" onPress={handleMessage} style={{ marginTop: spacing.md }} />}

        {!isSelf && (
          <Pressable onPress={() => setReportVisible(true)} style={{ alignSelf: 'center', marginTop: spacing.sm }}>
            <Text style={styles.reportLink}>Report this person</Text>
          </Pressable>
        )}
      </ScrollView>

      <ReportSheet visible={reportVisible} onClose={() => setReportVisible(false)} targetType="user" targetId={id} />
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
  followBtn: { marginTop: spacing.sm, minWidth: 140 },
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
  reviewsSection: { gap: spacing.sm, marginTop: spacing.sm },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewsTitle: { ...typography.subheading },
  reviewsSummary: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  reviewsCount: { ...typography.small },
  reviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  reviewCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewerName: { ...typography.caption, fontWeight: '600', color: colors.textPrimary },
  reviewDate: { ...typography.small },
  reviewText: { ...typography.caption },
  reviewPhotoRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  reviewPhoto: { width: 56, height: 56, borderRadius: radius.md },
  tabRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  tabBtnActive: { backgroundColor: colors.primary },
  tabLabel: { ...typography.caption, fontWeight: '700', color: colors.textSecondary },
  tabLabelActive: { color: '#fff' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  photoGridItem: { width: '32%', aspectRatio: 1 },
  photoGridImage: { width: '100%', height: '100%', borderRadius: radius.sm },
  connectionActions: { marginTop: spacing.sm, alignItems: 'center' },
  respondRow: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
  respondBtn: { flex: 1 },
  reportLink: { ...typography.small, color: colors.textMuted },
});
