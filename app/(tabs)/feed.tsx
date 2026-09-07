import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/PostCard';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { PhotoPicker } from '@/components/ui/PhotoPicker';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { Skeleton } from '@/components/ui/Skeleton';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, type } from '@/lib/theme';
import { Post } from '@/lib/types';

const POST_MAX = 500;
type Status = 'loading' | 'ready' | 'error';

type FeedTab = 'forYou' | 'following';

export default function Feed() {
  const { myId, me, authenticated, adventures, crews, posts, fetchPosts, createPost, toggleLikePost, recordShare, myFollowingIds } = useApp();
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

  const sorted = useMemo(() => [...posts].sort((a, b) => b.createdAt - a.createdAt), [posts]);
  const visible = useMemo(
    () => (tab === 'following' ? sorted.filter((p) => myFollowingIds.has(p.authorId)) : sorted),
    [sorted, tab, myFollowingIds]
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

  // The share sheet itself (or the clipboard fallback) fires regardless of
  // sign-in state — sharing isn't an account action — but only a signed-in
  // user's share gets counted, since the count is a Firestore write.
  const handleShared = (post: Post) => {
    if (!authenticated) return;
    recordShare(post.id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.heading}>Feed</Text>

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
          renderItem={({ item }) => (
            <View style={styles.postWrap}>
              <PostCard post={item} onToggleLike={() => handleToggleLike(item)} onShared={() => handleShared(item)} />
            </View>
          )}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  heading: { ...type.screenHeading, paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
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
