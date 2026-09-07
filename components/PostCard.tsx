import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { formatRelativeTime } from '@/lib/relativeTime';
import { useApp } from '@/lib/store';
import { colors, iconSize, radius, spacing, type } from '@/lib/theme';
import { Post } from '@/lib/types';

interface PostCardProps {
  post: Post;
  onToggleLike: () => void;
}

export function PostCard({ post, onToggleLike }: PostCardProps) {
  const { myId, users, adventures, fetchOtherProfile } = useApp();
  const author = users[post.authorId];
  const adventure = post.adventureId ? adventures.find((a) => a.id === post.adventureId) : undefined;

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

  return (
    <Card style={styles.card}>
      <Pressable style={styles.authorRow} onPress={() => router.push(`/profile/${post.authorId}`)}>
        <Avatar initials={author?.initials ?? '?'} hue={author?.avatarHue ?? 200} size={40} />
        <View style={styles.authorText}>
          <Text style={styles.authorName}>{author?.name ?? 'Someone'}</Text>
          <Text style={styles.timestamp}>{formatRelativeTime(post.createdAt)}</Text>
        </View>
      </Pressable>

      <Text style={styles.text}>{post.text}</Text>

      {!!post.photos?.length && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
          {post.photos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.photo} />
          ))}
        </ScrollView>
      )}

      {adventure && (
        <Pressable style={styles.adventureChip} onPress={openAdventure}>
          <Ionicons name="compass-outline" size={14} color={colors.primary} />
          <Text style={styles.adventureChipLabel} numberOfLines={1}>
            {adventure.title}
          </Text>
          <Text style={styles.adventureChipLink}>View adventure</Text>
        </Pressable>
      )}

      <View style={styles.footer}>
        <Pressable style={styles.likeBtn} onPress={onToggleLike} hitSlop={8}>
          <Ionicons name={post.likedByMe ? 'heart' : 'heart-outline'} size={iconSize.inline} color={post.likedByMe ? colors.accent : colors.textSecondary} />
          <Text style={styles.likeCount}>{post.likeCount}</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  authorText: { flex: 1 },
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  likeCount: { ...type.secondary, color: colors.textSecondary },
});
