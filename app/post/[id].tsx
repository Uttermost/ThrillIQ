import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/PostCard';
import { Avatar } from '@/components/ui/Avatar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ErrorState } from '@/components/ui/StateViews';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatRelativeTime } from '@/lib/relativeTime';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, type } from '@/lib/theme';
import { PostComment } from '@/lib/types';

const COMMENT_MAX = 500;
type Status = 'loading' | 'ready' | 'error';

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { me, users, authenticated, posts, toggleLikePost, recordShare, fetchCommentsForPost, createComment, fetchOtherProfile } = useApp();
  const post = posts.find((p) => p.id === id);

  const [status, setStatus] = useState<Status>('loading');
  const [comments, setComments] = useState<PostComment[]>([]);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    setStatus('loading');
    fetchCommentsForPost(id)
      .then((list) => {
        setComments([...list].sort((a, b) => a.createdAt - b.createdAt));
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [id, fetchCommentsForPost]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    comments.forEach((c) => {
      if (!users[c.authorId]) fetchOtherProfile(c.authorId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  if (!post) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Post" />
        <Text style={styles.notFound}>This post is no longer available.</Text>
      </SafeAreaView>
    );
  }

  const handleToggleLike = () => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    toggleLikePost(post.id);
  };

  const handleShared = () => {
    if (!authenticated) return;
    recordShare(post.id);
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || posting) return;
    setPosting(true);
    setDraft('');
    try {
      const created = await createComment({ postId: post.id, text });
      setComments((prev) => [...prev, created]);
    } catch {
      // Restore the draft so the comment isn't just silently lost.
      setDraft(text);
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Post" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          data={comments}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.postWrap}>
              <PostCard post={post} onToggleLike={handleToggleLike} onShared={handleShared} hideCommentLink />
              <Text style={styles.commentsLabel}>Comments</Text>
              {status === 'loading' && <Skeleton style={{ height: 60 }} />}
              {status === 'error' && <ErrorState title="Couldn't load comments" message="Check your connection and try again." onRetry={load} />}
              {status === 'ready' && comments.length === 0 && <Text style={styles.emptyText}>No comments yet — be the first.</Text>}
            </View>
          }
          renderItem={({ item }) => {
            const author = users[item.authorId];
            return (
              <View style={styles.commentRow}>
                <Avatar initials={author?.initials ?? '?'} hue={author?.avatarHue ?? 200} size={32} />
                <View style={styles.commentBody}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{author?.name ?? 'Someone'}</Text>
                    <Text style={styles.commentTime}>{formatRelativeTime(item.createdAt)}</Text>
                  </View>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              </View>
            );
          }}
        />
        {authenticated ? (
          <View style={styles.inputRow}>
            <Avatar initials={me.initials} hue={me.avatarHue} size={32} />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a comment…"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              maxLength={COMMENT_MAX}
              multiline
            />
            <Pressable
              onPress={handleSend}
              accessibilityLabel="Post comment"
              style={[styles.sendButton, (!draft.trim() || posting) && styles.sendButtonDisabled]}
              disabled={!draft.trim() || posting}>
              <Text style={styles.sendButtonLabel}>Post</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.signInPrompt} onPress={() => router.push('/auth')}>
            <Text style={styles.signInPromptText}>Sign in to comment →</Text>
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  notFound: { ...type.body, color: colors.textSecondary, padding: spacing.lg },
  list: { padding: spacing.lg, paddingTop: 0, gap: spacing.md },
  postWrap: { gap: spacing.md, marginBottom: spacing.sm },
  commentsLabel: { ...type.inputLabel, color: colors.textSecondary, marginTop: spacing.sm },
  emptyText: { ...type.secondary, color: colors.textMuted },
  commentRow: { flexDirection: 'row', gap: spacing.sm },
  commentBody: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentAuthor: { ...type.bodyEmphasis, fontSize: 13 },
  commentTime: { ...type.secondary, color: colors.textMuted },
  commentText: { ...type.body, color: colors.textPrimary },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  signInPrompt: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  signInPromptText: { ...type.bodyEmphasis, color: colors.primary },
});
