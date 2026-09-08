import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { MountainScene } from '@/components/ui/MountainScene';
import { PublicFooter } from '@/components/ui/PublicFooter';
import { PublicHeader } from '@/components/ui/PublicHeader';
import { formatLongDate } from '@/lib/dateFormat';
import { BLOG_POSTS, getBlogPost, getReadTimeMinutes } from '@/lib/blogPosts';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, radius, spacing, type } from '@/lib/theme';

export default function BlogPost() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  const post = getBlogPost(slug);

  if (!post) {
    return (
      <View style={styles.page}>
        <PublicHeader />
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>Post not found</Text>
          <Button label="Back to the blog" variant="secondary" onPress={() => router.push('/blog')} />
        </View>
        <PublicFooter />
      </View>
    );
  }

  const more = BLOG_POSTS.filter((p) => p.slug !== post.slug)
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, 3);

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PublicHeader />

        <View style={[styles.heroSection, isWide ? styles.heroSectionWide : styles.heroSectionNarrow]}>
          <View style={styles.heroBg}>
            <MountainScene height={isWide ? 320 : 220} rounded={false} category={post.category} />
          </View>
          <View style={styles.heroScrim} />
          <View style={styles.heroContentWrap}>
            <View style={[styles.sectionInner, styles.heroInner]}>
              <Pressable onPress={() => router.push('/blog')} hitSlop={8}>
                <Text style={styles.backLink}>← Blog</Text>
              </Pressable>
              <Text style={styles.heroTitle}>{post.title}</Text>
              <Text style={styles.heroMeta}>
                The ThrillIQ Team · {formatLongDate(post.publishedAt)} · {getReadTimeMinutes(post)} min read
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.sectionInner, isWide && styles.contentWide]}>
            {post.body.map((p, i) => (
              <Text key={i} style={styles.paragraph}>
                {p}
              </Text>
            ))}

            <View style={styles.closingCard}>
              <Text style={styles.closingTitle}>Ready to find your next adventure?</Text>
              <Button label="Browse Discover" onPress={() => router.push('/discover')} style={styles.closingBtn} />
            </View>

            {more.length > 0 && (
              <View style={styles.moreSection}>
                <Text style={styles.moreHeading}>More from the blog</Text>
                {more.map((p) => (
                  <Pressable key={p.slug} style={styles.moreRow} onPress={() => router.push(`/blog/${p.slug}`)}>
                    <Text style={styles.moreTitle}>{p.title}</Text>
                    <Text style={styles.moreMeta}>
                      {formatLongDate(p.publishedAt)} · {getReadTimeMinutes(p)} min read
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
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
  contentWide: { maxWidth: 720 },

  heroSection: { position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  heroSectionWide: { height: 320 },
  heroSectionNarrow: { height: 260 },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.6)' },
  heroContentWrap: { width: '100%', alignItems: 'center' },
  heroInner: { paddingTop: 0, paddingBottom: spacing.xl },
  backLink: { ...type.bodyEmphasis, color: 'rgba(255,255,255,0.85)', marginBottom: spacing.md },
  heroTitle: { ...type.display, fontSize: 32, color: '#fff' },
  heroMeta: { ...type.secondary, color: 'rgba(255,255,255,0.85)', marginTop: spacing.sm },

  paragraph: { ...type.largeBody, color: colors.textPrimary, marginBottom: spacing.lg },

  notFoundWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl },
  notFoundTitle: { ...type.screenHeading },

  closingCard: {
    backgroundColor: colors.primarySurface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  closingTitle: { ...type.cardTitle, textAlign: 'center' },
  closingBtn: { paddingHorizontal: spacing.xl },

  moreSection: { gap: spacing.sm },
  moreHeading: { ...type.sectionHeading, marginBottom: spacing.sm },
  moreRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  moreTitle: { ...type.bodyEmphasis, marginBottom: spacing.xs },
  moreMeta: { ...type.caption, color: colors.textMuted },
});
