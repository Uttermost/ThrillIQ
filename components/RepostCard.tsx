import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { formatRelativeTime } from '@/lib/relativeTime';
import { useApp } from '@/lib/store';
import { colors, iconSize, radius, spacing, type } from '@/lib/theme';
import { Post, Repost } from '@/lib/types';

interface RepostCardProps {
  repost: Repost;
  post: Post | undefined;
  onToggleLike: () => void;
}

// Deliberately not a full PostCard: this only shows a condensed, tappable
// preview of the original post plus its own like button. Comment/share
// actions stay on the original post's own detail screen — duplicating them
// here would just create two competing engagement surfaces for one post.
export function RepostCard({ repost, post, onToggleLike }: RepostCardProps) {
  const { users, fetchOtherProfile } = useApp();
  const reposter = users[repost.userId];
  const originalAuthor = post ? users[post.authorId] : undefined;

  useEffect(() => {
    if (!users[repost.userId]) fetchOtherProfile(repost.userId);
    if (post && !users[post.authorId]) fetchOtherProfile(post.authorId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repost.userId, post?.authorId]);

  if (!post) return null;

  return (
    <Card style={styles.card}>
      <Pressable style={styles.repostedByRow} onPress={() => router.push(`/profile/${repost.userId}`)}>
        <Ionicons name="repeat-outline" size={14} color={colors.textMuted} />
        <Text style={styles.repostedByLabel}>{reposter?.name ?? 'Someone'} reposted</Text>
        <Text style={styles.timestamp}>{formatRelativeTime(repost.createdAt)}</Text>
      </Pressable>

      {!!repost.comment && <Text style={styles.comment}>{repost.comment}</Text>}

      <Pressable style={styles.originalPreview} onPress={() => router.push(`/post/${post.id}`)}>
        <View style={styles.originalHeaderRow}>
          <Avatar initials={originalAuthor?.initials ?? '?'} hue={originalAuthor?.avatarHue ?? 200} size={28} />
          <Text style={styles.originalAuthorName}>{originalAuthor?.name ?? 'Someone'}</Text>
        </View>
        <Text style={styles.originalText} numberOfLines={3}>
          {post.text}
        </Text>
        {!!post.photos?.length && <Image source={{ uri: post.photos[0] }} style={styles.originalPhoto} />}
      </Pressable>

      <View style={styles.footer}>
        <Pressable
          style={styles.actionBtn}
          onPress={onToggleLike}
          hitSlop={8}
          accessibilityLabel={repost.likedByMe ? 'Unlike repost' : 'Like repost'}>
          <Ionicons name={repost.likedByMe ? 'heart' : 'heart-outline'} size={iconSize.inline} color={repost.likedByMe ? colors.accent : colors.textSecondary} />
          <Text style={styles.actionCount}>{repost.likeCount}</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  repostedByRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  repostedByLabel: { ...type.secondary, color: colors.textMuted, fontWeight: '700', flex: 1 },
  timestamp: { ...type.secondary, color: colors.textMuted },
  comment: { ...type.body, color: colors.textPrimary },
  originalPreview: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  originalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  originalAuthorName: { ...type.bodyEmphasis },
  originalText: { ...type.body, color: colors.textPrimary },
  originalPhoto: { width: '100%', height: 160, borderRadius: radius.sm, marginTop: spacing.xs },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionCount: { ...type.secondary, color: colors.textSecondary },
});
