import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PostCard } from '@/components/PostCard';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EmptyState } from '@/components/ui/StateViews';
import { useApp } from '@/lib/store';
import { colors, spacing } from '@/lib/theme';
import { Post } from '@/lib/types';

export default function Saved() {
  const { myId, posts, postSaves, toggleLikePost, recordShare } = useApp();

  // Sorted by when it was saved, not when it was posted — this is a
  // reading list, not another feed. A save whose post has since been
  // deleted just has no match here and silently drops off the list.
  const savedPosts = useMemo(() => {
    const bySavedAt = new Map(postSaves.filter((s) => s.userId === myId).map((s) => [s.postId, s.createdAt]));
    return posts
      .filter((p) => bySavedAt.has(p.id))
      .sort((a, b) => (bySavedAt.get(b.id) ?? 0) - (bySavedAt.get(a.id) ?? 0));
  }, [posts, postSaves, myId]);

  const handleToggleLike = (post: Post) => toggleLikePost(post.id);
  const handleShared = (post: Post) => recordShare(post.id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Saved posts" />
      <FlatList
        data={savedPosts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.postWrap}>
            <PostCard post={item} onToggleLike={() => handleToggleLike(item)} onShared={() => handleShared(item)} />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState icon="bookmark-outline" title="Nothing saved yet" message="Tap the bookmark icon on any post to save it here." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.md },
  postWrap: { marginBottom: spacing.md },
});
