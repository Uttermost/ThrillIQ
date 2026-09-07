import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { formatRelativeTime } from '@/lib/relativeTime';
import { sharePost } from '@/lib/share';
import { useApp } from '@/lib/store';
import { colors, iconSize, radius, spacing, type } from '@/lib/theme';
import { Post } from '@/lib/types';

interface PostCardProps {
  post: Post;
  onToggleLike: () => void;
  // Called only once a share actually completes (sheet resolved, or the
  // web clipboard fallback succeeded) — never for a dismissed sheet.
  onShared: () => void;
  // The post-detail screen embeds this same card at the top of its own
  // comment thread — tapping "comments" there would just navigate to
  // itself, so it renders as a plain count instead of a link.
  hideCommentLink?: boolean;
  // Same idea, for the crew detail screen embedding a crew's own posts —
  // "View crew" would just navigate to the page already showing.
  hideCrewLink?: boolean;
}

export function PostCard({ post, onToggleLike, onShared, hideCommentLink, hideCrewLink }: PostCardProps) {
  const { myId, authenticated, users, adventures, crews, fetchOtherProfile, myFollowingIds, followUser } = useApp();
  const author = users[post.authorId];
  const adventure = post.adventureId ? adventures.find((a) => a.id === post.adventureId) : undefined;
  const crew = post.crewId ? crews.find((c) => c.id === post.crewId) : undefined;
  const [sharing, setSharing] = useState(false);
  const [justShared, setJustShared] = useState(false);
  const [following, setFollowing] = useState(false);
  const isFollowing = myFollowingIds.has(post.authorId);

  useEffect(() => {
    if (!users[post.authorId]) fetchOtherProfile(post.authorId);
    // `users` is deliberately excluded — it's the whole app-wide profile
    // dictionary, so including it would re-run this effect on every unrelated
    // profile fetch anywhere in the app. Same pattern as AdventureCard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.authorId]);

  const openAdventure = () => {
    if (!adventure) return;
    router.push(adventure.organizerId === myId ? `/organizer/${adventure.id}` : `/adventure/${adventure.id}`);
  };

  const handleFollow = async () => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    setFollowing(true);
    try {
      await followUser(post.authorId);
    } catch {
      // Best-effort: the pill just stays visible on failure (myFollowingIds
      // only changes once the write actually succeeded).
    } finally {
      setFollowing(false);
    }
  };

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const completed = await sharePost(post);
      if (completed) {
        onShared();
        setJustShared(true);
        setTimeout(() => setJustShared(false), 1500);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Pressable style={styles.authorRow} onPress={() => router.push(`/profile/${post.authorId}`)}>
          <Avatar initials={author?.initials ?? '?'} hue={author?.avatarHue ?? 200} size={40} />
          <View style={styles.authorText}>
            <Text style={styles.authorName}>{author?.name ?? 'Someone'}</Text>
            <Text style={styles.timestamp}>{formatRelativeTime(post.createdAt)}</Text>
          </View>
        </Pressable>
        {post.authorId !== myId && !isFollowing && (
          <Pressable style={styles.followPill} onPress={handleFollow} disabled={following} hitSlop={8} accessibilityLabel="Follow author">
            <Text style={styles.followPillLabel}>Follow</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.text}>{post.text}</Text>

      {!!post.photos?.length && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
          {post.photos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.photo} />
          ))}
        </ScrollView>
      )}

      {(adventure || (crew && !hideCrewLink)) && (
        <View style={styles.tagChipRow}>
          {adventure && (
            <Pressable style={styles.adventureChip} onPress={openAdventure}>
              <Ionicons name="compass-outline" size={14} color={colors.primary} />
              <Text style={styles.adventureChipLabel} numberOfLines={1}>
                {adventure.title}
              </Text>
              <Text style={styles.adventureChipLink}>View adventure</Text>
            </Pressable>
          )}
          {crew && !hideCrewLink && (
            <Pressable style={styles.crewChip} onPress={() => router.push(`/crew/${crew.id}`)}>
              <Ionicons name="people-outline" size={14} color={colors.hosting} />
              <Text style={styles.crewChipLabel} numberOfLines={1}>
                {crew.name}
              </Text>
              <Text style={styles.crewChipLink}>View crew</Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Pressable
          style={styles.actionBtn}
          onPress={onToggleLike}
          hitSlop={8}
          accessibilityLabel={post.likedByMe ? 'Unlike post' : 'Like post'}>
          <Ionicons name={post.likedByMe ? 'heart' : 'heart-outline'} size={iconSize.inline} color={post.likedByMe ? colors.accent : colors.textSecondary} />
          <Text style={styles.actionCount}>{post.likeCount}</Text>
        </Pressable>

        <Pressable
          style={styles.actionBtn}
          onPress={() => !hideCommentLink && router.push(`/post/${post.id}`)}
          hitSlop={8}
          disabled={hideCommentLink}
          accessibilityLabel="View comments">
          <Ionicons name="chatbubble-outline" size={iconSize.inline} color={colors.textSecondary} />
          <Text style={styles.actionCount}>{post.commentCount}</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={handleShare} hitSlop={8} disabled={sharing} accessibilityLabel="Share post">
          <Ionicons name="share-outline" size={iconSize.inline} color={colors.textSecondary} />
          <Text style={styles.actionCount}>{justShared ? 'Shared' : post.shareCount}</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  authorRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  authorText: { flex: 1 },
  followPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followPillLabel: { ...type.chip, color: colors.primary },
  authorName: { ...type.bodyEmphasis },
  timestamp: { ...type.secondary, color: colors.textMuted },
  text: { ...type.body, color: colors.textPrimary },
  photoRow: { flexDirection: 'row', gap: spacing.sm },
  photo: { width: 140, height: 140, borderRadius: radius.md },
  adventureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySurface,
  },
  adventureChipLabel: { ...type.chip, color: colors.primary, flexShrink: 1 },
  adventureChipLink: { ...type.chip, color: colors.primary, fontWeight: '700', textDecorationLine: 'underline' },
  tagChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  crewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.accentMuted,
  },
  crewChipLabel: { ...type.chip, color: colors.hosting, flexShrink: 1 },
  crewChipLink: { ...type.chip, color: colors.hosting, fontWeight: '700', textDecorationLine: 'underline' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionCount: { ...type.secondary, color: colors.textSecondary },
});
