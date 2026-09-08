import { useLocalSearchParams, router } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdventureCard } from '@/components/AdventureCard';
import { PostCard } from '@/components/PostCard';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EmptyState } from '@/components/ui/StateViews';
import { useApp } from '@/lib/store';
import { findPlace } from '@/lib/places';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, spacing, type, typography } from '@/lib/theme';
import { Adventure, Post } from '@/lib/types';

const MIN_GRID_CARD_WIDTH = 300;

export default function PlaceDetail() {
  const { place: slug } = useLocalSearchParams<{ place: string }>();
  const { myId, authenticated, adventures, posts, toggleLike, toggleLikePost, recordShare } = useApp();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  const place = useMemo(() => findPlace(adventures, slug), [adventures, slug]);

  const placePosts = useMemo(() => {
    if (!place) return [];
    const adventureIds = new Set(place.adventures.map((a) => a.id));
    return posts.filter((p) => p.adventureId && adventureIds.has(p.adventureId)).sort((a, b) => b.createdAt - a.createdAt);
  }, [posts, place]);

  const gridWidth = Math.min(width, DESKTOP_CONTENT_MAX_WIDTH) - spacing.lg * 2;
  const numColumns = isWide ? Math.max(2, Math.min(3, Math.floor(gridWidth / MIN_GRID_CARD_WIDTH))) : 1;

  if (!place) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Place" />
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFound}>We couldn't find this place — it may not have any adventures right now.</Text>
          <Text style={styles.backLink} onPress={() => router.push('/places')}>
            ← All places
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const upcoming = place.adventures.filter((a) => a.dateTimestamp > Date.now()).sort((a, b) => a.dateTimestamp - b.dateTimestamp);
  const past = place.adventures.filter((a) => a.dateTimestamp <= Date.now()).sort((a, b) => b.dateTimestamp - a.dateTimestamp);

  const openAdventure = (a: Adventure) => {
    if (a.organizerId === myId) router.push(`/organizer/${a.id}`);
    else router.push(`/adventure/${a.id}`);
  };

  const handleToggleLikeAdventure = (id: string) => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    toggleLike(id);
  };

  const handleToggleLikePost = (post: Post) => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    toggleLikePost(post.id);
  };

  const handleShared = (post: Post) => {
    if (!authenticated) return;
    recordShare(post.id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {isWide ? (
        <View style={styles.wideHeader}>
          <Text style={styles.wideHeading}>{place.location}</Text>
          <Text style={styles.wideSubheading}>
            {place.adventures.length} adventure{place.adventures.length === 1 ? '' : 's'} here
          </Text>
        </View>
      ) : (
        <ScreenHeader title={place.location} />
      )}
      <ScrollView contentContainerStyle={styles.content}>
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <View style={styles.grid} key={`up-${numColumns}`}>
              {upcoming.map((a) => (
                <View key={a.id} style={[styles.gridItem, { width: numColumns > 1 ? `${100 / numColumns}%` : '100%' }]}>
                  <AdventureCard adventure={a} onPress={() => openAdventure(a)} onToggleLike={() => handleToggleLikeAdventure(a.id)} />
                </View>
              ))}
            </View>
          </View>
        )}

        {past.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past</Text>
            <View style={styles.grid} key={`past-${numColumns}`}>
              {past.map((a) => (
                <View key={a.id} style={[styles.gridItem, { width: numColumns > 1 ? `${100 / numColumns}%` : '100%' }]}>
                  <AdventureCard adventure={a} onPress={() => openAdventure(a)} onToggleLike={() => handleToggleLikeAdventure(a.id)} />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posts from {place.location}</Text>
          {placePosts.length === 0 ? (
            <EmptyState icon="images-outline" title="No posts yet" message="Posts tagged with an adventure here will show up." />
          ) : (
            <View style={{ gap: spacing.md }}>
              {placePosts.map((post) => (
                <PostCard key={post.id} post={post} onToggleLike={() => handleToggleLikePost(post)} onShared={() => handleShared(post)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  wideHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  wideHeading: { ...type.screenHeading },
  wideSubheading: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  section: { gap: spacing.sm },
  sectionTitle: { ...type.sectionHeading },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.sm },
  gridItem: { paddingHorizontal: spacing.sm, marginBottom: spacing.lg },
  notFoundWrap: { padding: spacing.xl, gap: spacing.md },
  notFound: { ...type.body, color: colors.textSecondary },
  backLink: { ...type.bodyEmphasis, color: colors.primary },
});
