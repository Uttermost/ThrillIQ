import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { MountainScene } from '@/components/ui/MountainScene';
import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { formatLongDate } from '@/lib/dateFormat';
import { BLOG_POSTS, getReadTimeMinutes } from '@/lib/blogPosts';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, radius, spacing, type } from '@/lib/theme';

export default function BlogIndex() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;
  const gridWidth = Math.min(width, DESKTOP_CONTENT_MAX_WIDTH) - spacing.xl * 2;
  const numColumns = isWide ? Math.max(2, Math.min(3, Math.floor(gridWidth / 320))) : 1;

  const posts = [...BLOG_POSTS].sort((a, b) => b.publishedAt - a.publishedAt);

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PublicHeader />

        <View style={[styles.section, styles.heroSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.heroEyebrow}>BLOG</Text>
            <Text style={styles.heroTitle}>Guides &amp; Stories</Text>
            <Text style={styles.heroSubtitle}>How ThrillIQ actually works, from the team building it.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionInner}>
            <View style={styles.grid} key={numColumns}>
              {posts.map((post) => (
                <Pressable
                  key={post.slug}
                  style={[styles.card, { width: numColumns > 1 ? `${100 / numColumns}%` : '100%' }]}
                  onPress={() => router.push(`/blog/${post.slug}`)}>
                  <View style={styles.cardInner}>
                    <MountainScene height={160} rounded={false} category={post.category} />
                    <View style={styles.cardBody}>
                      <Text style={styles.cardMeta}>
                        {formatLongDate(post.publishedAt)} · {getReadTimeMinutes(post)} min read
                      </Text>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {post.title}
                      </Text>
                      <Text style={styles.cardExcerpt} numberOfLines={3}>
                        {post.excerpt}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <PublicFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },

  section: { alignItems: 'center' },
  sectionInner: { width: '100%', maxWidth: DESKTOP_CONTENT_MAX_WIDTH, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },

  heroSection: { backgroundColor: colors.primarySurface },
  heroEyebrow: { ...type.caption, color: colors.primary, fontWeight: '700', letterSpacing: 1.5, marginBottom: spacing.sm },
  heroTitle: { ...type.display, fontSize: 32 },
  heroSubtitle: { ...type.largeBody, color: colors.textSecondary, marginTop: spacing.sm },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.sm },
  card: { paddingHorizontal: spacing.sm, marginBottom: spacing.lg },
  cardInner: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardBody: { padding: spacing.lg, gap: spacing.xs },
  cardMeta: { ...type.caption, color: colors.textMuted },
  cardTitle: { ...type.cardTitle },
  cardExcerpt: { ...type.secondary, color: colors.textSecondary },
});
