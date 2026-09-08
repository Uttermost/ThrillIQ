import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/PostCard';
import { RepostCard } from '@/components/RepostCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PhotoPicker } from '@/components/ui/PhotoPicker';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { Skeleton } from '@/components/ui/Skeleton';
import { useApp } from '@/lib/store';
import { CONTENT_MAX_WIDTH, colors, radius, spacing, type, typography } from '@/lib/theme';
import { Adventure, Post, Repost } from '@/lib/types';

const POST_MAX = 500;
type Status = 'loading' | 'ready' | 'error';

type FeedTab = 'forYou' | 'following';

// A repost is its own Feed item alongside plain posts — merged into one
// timestamp-sorted list rather than two separate sections.
type FeedItem = { kind: 'post'; id: string; createdAt: number; post: Post } | { kind: 'repost'; id: string; createdAt: number; repost: Repost };

export default function Feed() {
  const {
    myId,
    me,
    authenticated,
    adventures,
    crews,
    posts,
    reposts,
    fetchPosts,
    createPost,
    toggleLikePost,
    toggleLikeRepost,
    recordShare,
    myFollowingIds,
  } = useApp();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;
  const [status, setStatus] = useState<Status>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [taggedAdventureId, setTaggedAdventureId] = useState<string | null>(null);
  const [taggedCrewId, setTaggedCrewId] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [tab, setTab] = useState<FeedTab>('forYou');

  const load = useCallback(() => {
    setStatus('loading');
    fetchPosts()
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'));
  }, [fetchPosts]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts()
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'))
      .finally(() => setRefreshing(false));
  };

  // Only adventures the signed-in user actually organizes or joined — a post
  // can't tag something they have no real connection to.
  const myAdventures = useMemo(
    () => adventures.filter((a) => a.organizerId === myId || a.participantIds.includes(myId)),
    [adventures, myId]
  );
  // Only crews the signed-in user is actually a member of — mirrors the
  // adventure-tagging restriction above, enforced server-side too.
  const myCrews = useMemo(() => crews.filter((c) => c.memberIds.includes(myId)), [crews, myId]);

  // Desktop right rail — a real, if simple, signal (most-liked among
  // upcoming, open adventures), same "real data or nothing" rule Discover's
  // Find My People section already follows. Not a "people you may vibe
  // with" panel: there's no query that could back that (firestore.rules
  // denies `list` on /users on purpose — see app/search.tsx).
  const trendingAdventures = useMemo<Adventure[]>(() => {
    const now = Date.now();
    return adventures
      .filter((a) => a.dateTimestamp > now && a.spotsFilled < a.spotsTotal)
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 5);
  }, [adventures]);

  const feedItems = useMemo<FeedItem[]>(() => {
    const postItems: FeedItem[] = posts.map((p) => ({ kind: 'post', id: `post-${p.id}`, createdAt: p.createdAt, post: p }));
    const repostItems: FeedItem[] = reposts.map((r) => ({ kind: 'repost', id: `repost-${r.id}`, createdAt: r.createdAt, repost: r }));
    return [...postItems, ...repostItems].sort((a, b) => b.createdAt - a.createdAt);
  }, [posts, reposts]);

  const visible = useMemo(
    () =>
      tab === 'following'
        ? feedItems.filter((item) => myFollowingIds.has(item.kind === 'post' ? item.post.authorId : item.repost.userId))
        : feedItems,
    [feedItems, tab, myFollowingIds]
  );

  const handleTabChange = (next: FeedTab) => {
    if (next === 'following' && !authenticated) {
      router.push('/auth');
      return;
    }
    setTab(next);
  };

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    setPostError(null);
    try {
      await createPost({ text, photos, adventureId: taggedAdventureId, crewId: taggedCrewId });
      setText('');
      setPhotos([]);
      setTaggedAdventureId(null);
      setTaggedCrewId(null);
    } catch (e) {
      setPostError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = (post: Post) => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    toggleLikePost(post.id);
  };

  const handleToggleLikeRepost = (repost: Repost) => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    toggleLikeRepost(repost.id);
  };

  // The share sheet itself (or the clipboard fallback) fires regardless of
  // sign-in state — sharing isn't an account action — but only a signed-in
  // user's share gets counted, since the count is a Firestore write.
  const handleShared = (post: Post) => {
    if (!authenticated) return;
    recordShare(post.id);
  };

  const header = (
    <View style={styles.headerRow}>
      <Text style={styles.heading}>Feed</Text>
      <Pressable onPress={() => router.push('/search')} hitSlop={8} accessibilityLabel="Search">
        <Ionicons name="search-outline" size={22} color={colors.textPrimary} />
      </Pressable>
    </View>
  );

  function FeedList() {
    return (
      <>
        <View style={styles.tabRow}>
          <Pressable onPress={() => handleTabChange('forYou')} style={[styles.tabBtn, tab === 'forYou' && styles.tabBtnActive]}>
            <Text style={[styles.tabLabel, tab === 'forYou' && styles.tabLabelActive]}>For You</Text>
          </Pressable>
          <Pressable onPress={() => handleTabChange('following')} style={[styles.tabBtn, tab === 'following' && styles.tabBtnActive]}>
            <Text style={[styles.tabLabel, tab === 'following' && styles.tabLabelActive]}>Following</Text>
          </Pressable>
        </View>

        {status === 'loading' && (
          <View style={styles.list}>
            <Skeleton style={{ height: 120, marginBottom: spacing.md }} />
            <Skeleton style={{ height: 120 }} />
          </View>
        )}

        {status === 'error' && <ErrorState title="Couldn't load the feed" message="Check your connection and try again." onRetry={load} />}

        {status === 'ready' && (
          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.textSecondary} />}
            ListHeaderComponent={
            authenticated ? (
              <View style={styles.composer}>
                <View style={styles.composerRow}>
                  <Avatar initials={me.initials} hue={me.avatarHue} size={40} />
                  <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Share something with the community…"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={POST_MAX}
                    style={styles.composerInput}
                  />
                </View>
                <PhotoPicker photos={photos} onChange={setPhotos} max={3} />
                {myAdventures.length > 0 && (
                  <View style={styles.tagSection}>
                    <Text style={styles.tagLabel}>Tag an adventure (optional)</Text>
                    <View style={styles.tagRow}>
                      {myAdventures.map((a) => {
                        const active = taggedAdventureId === a.id;
                        return (
                          <Pressable
                            key={a.id}
                            onPress={() => setTaggedAdventureId(active ? null : a.id)}
                            style={[styles.tagChip, active && styles.tagChipActive]}>
                            <Text style={[styles.tagChipLabel, active && styles.tagChipLabelActive]} numberOfLines={1}>
                              {a.title}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}
                {myCrews.length > 0 && (
                  <View style={styles.tagSection}>
                    <Text style={styles.tagLabel}>Tag a crew (optional)</Text>
                    <View style={styles.tagRow}>
                      {myCrews.map((c) => {
                        const active = taggedCrewId === c.id;
                        return (
                          <Pressable
                            key={c.id}
                            onPress={() => setTaggedCrewId(active ? null : c.id)}
                            style={[styles.tagChip, active && styles.tagChipActive]}>
                            <Text style={[styles.tagChipLabel, active && styles.tagChipLabelActive]} numberOfLines={1}>
                              {c.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}
                {postError && <Text style={styles.errorHint}>{postError}</Text>}
                <Button label="Post" onPress={handlePost} disabled={!text.trim()} loading={posting} />
              </View>
            ) : (
              <Pressable style={styles.signInPrompt} onPress={() => router.push('/auth')}>
                <Text style={styles.signInPromptText}>Sign in to share something →</Text>
              </Pressable>
            )
          }
          renderItem={({ item }) =>
            item.kind === 'post' ? (
              <View style={styles.postWrap}>
                <PostCard post={item.post} onToggleLike={() => handleToggleLike(item.post)} onShared={() => handleShared(item.post)} />
              </View>
            ) : (
              <View style={styles.postWrap}>
                <RepostCard
                  repost={item.repost}
                  post={posts.find((p) => p.id === item.repost.postId)}
                  onToggleLike={() => handleToggleLikeRepost(item.repost)}
                />
              </View>
            )
          }
            ListEmptyComponent={
              tab === 'following' ? (
                <EmptyState
                  icon="person-add-outline"
                  title="Not following anyone yet"
                  message="Follow people from their profile to see their posts here."
                />
              ) : (
                <EmptyState icon="chatbubbles-outline" title="No posts yet" message="Be the first to share something with the community." />
              )
            }
          />
        )}
      </>
    );
  }

  function TrendingSidebar() {
    if (trendingAdventures.length === 0) return null;
    return (
      <View style={styles.sidebarCard}>
        <Text style={styles.sidebarTitle}>Trending Adventures</Text>
        {trendingAdventures.map((a) => (
          <Pressable key={a.id} style={styles.trendingRow} onPress={() => router.push(`/adventure/${a.id}`)}>
            <Text style={styles.trendingTitle} numberOfLines={1}>
              {a.title}
            </Text>
            <Text style={styles.trendingMeta} numberOfLines={1}>
              {a.location} · {a.dateLabel}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  if (isWide) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        {header}
        <View style={styles.wideRow}>
          <View style={styles.wideLeft}>
            <FeedList />
          </View>
          <View style={styles.wideRight}>
            <TrendingSidebar />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {header}
      <FeedList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  // Desktop: feed column on the left (capped so post cards don't stretch
  // to an unreadable width), a sticky "Trending Adventures" rail on the
  // right — see the design brief's three-column Feed, minus the
  // people-matching panel (no real data to back it, see trendingAdventures'
  // comment above).
  wideRow: { flex: 1, flexDirection: 'row', gap: spacing.xl, paddingHorizontal: spacing.xl, alignItems: 'flex-start' },
  wideLeft: { flex: 1, maxWidth: 640 },
  wideRight: { width: 320, flexShrink: 0, position: 'sticky' as 'relative', top: spacing.lg },
  sidebarCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  sidebarTitle: { ...type.cardTitle, marginBottom: spacing.xs },
  trendingRow: { paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  trendingTitle: { ...type.bodyEmphasis },
  trendingMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  heading: { ...type.screenHeading },
  tabRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  tabBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  tabBtnActive: { backgroundColor: colors.primary },
  tabLabel: { ...type.chip, color: colors.textSecondary },
  tabLabelActive: { color: '#fff' },
  list: { padding: spacing.lg, paddingTop: 0, gap: spacing.md },
  composer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  composerRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  composerInput: { flex: 1, ...type.body, color: colors.textPrimary, minHeight: 40, paddingTop: 8 },
  tagSection: { gap: spacing.xs },
  tagLabel: { ...type.inputLabel, color: colors.textSecondary },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tagChip: {
    maxWidth: 200,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipActive: { backgroundColor: colors.primarySurface, borderColor: colors.primary },
  tagChipLabel: { ...type.chip, color: colors.textSecondary },
  tagChipLabelActive: { color: colors.primary },
  errorHint: { ...type.secondary, color: colors.danger },
  signInPrompt: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  signInPromptText: { ...type.bodyEmphasis, color: colors.primary },
  postWrap: { marginBottom: spacing.md },
});
