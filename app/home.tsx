import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdventureCard } from '@/components/AdventureCard';
import { Button } from '@/components/ui/Button';
import { MountainScene } from '@/components/ui/MountainScene';
import { useApp } from '@/lib/store';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, radius, spacing, type } from '@/lib/theme';
import { Adventure, Category } from '@/lib/types';

// Public, logged-out marketing homepage — the front door for web visitors
// who aren't signed in yet (see app/index.tsx). Discover is a separate,
// unchanged screen: the in-app browsing experience once someone's past this
// page. Every adventure card here comes from real Firestore data — no
// fabricated stats, ratings, testimonials, or stock photography (see
// MountainScene; the hero below reuses it rather than faking a photo).

const FEATURED_LIMIT = 6;
const MIN_GRID_CARD_WIDTH = 300;

const VALUE_PROPS: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[] = [
  { icon: 'people-outline', title: 'Meet Great People', body: 'Connect with adventurers who share your interests.' },
  { icon: 'compass-outline', title: 'Discover Amazing Places', body: 'From hiking trails to hidden gems around Nairobi.' },
  { icon: 'shield-checkmark-outline', title: 'Safe & Trusted', body: 'Real people and transparent reviews, every time.' },
  { icon: 'flag-outline', title: 'Build Your Crew', body: 'Form your own group and plan adventures together.' },
  { icon: 'sparkles-outline', title: 'Real Experiences', body: 'Every adventure here is hosted by someone real.' },
];

const CATEGORY_TILES: { category: Category; icon: keyof typeof Ionicons.glyphMap }[] = [
  { category: 'Hiking', icon: 'walk-outline' },
  { category: 'Road trip', icon: 'car-outline' },
  { category: 'Camping', icon: 'bonfire-outline' },
  { category: 'Cycling', icon: 'bicycle-outline' },
  { category: 'Wellness', icon: 'leaf-outline' },
  { category: 'Water', icon: 'water-outline' },
  { category: 'Photography', icon: 'camera-outline' },
  { category: 'Social', icon: 'happy-outline' },
];

const HERO_PILL_CATEGORIES: Category[] = ['Hiking', 'Road trip', 'Camping', 'Cycling', 'Wellness', 'Networking'];

const NAV_LINKS = [
  { label: 'Discover', href: '/discover' },
  { label: 'Feed', href: '/feed' },
  { label: 'People', href: '/connections' },
  { label: 'Crews', href: '/crews' },
];

export default function Home() {
  const { width } = useWindowDimensions();
  const { adventures, authenticated } = useApp();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  const goCreate = () => router.push(authenticated ? '/create' : '/auth');

  const featured = useMemo(() => {
    const now = Date.now();
    return adventures
      .filter((a) => a.dateTimestamp > now && a.spotsFilled < a.spotsTotal)
      .sort((a, b) => a.dateTimestamp - b.dateTimestamp)
      .slice(0, FEATURED_LIMIT);
  }, [adventures]);

  const gridWidth = Math.min(width, DESKTOP_CONTENT_MAX_WIDTH) - spacing.xl * 2;
  const numColumns = isWide ? Math.max(2, Math.min(3, Math.floor(gridWidth / MIN_GRID_CARD_WIDTH))) : 1;

  const openAdventure = (a: Adventure) => router.push(`/adventure/${a.id}`);

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerBar}>
            <View style={styles.headerInner}>
              <Text style={styles.logo}>ThrillIQ</Text>
              {isWide && (
                <View style={styles.headerLinks}>
                  <View style={styles.headerLinkActive}>
                    <Text style={[styles.headerLinkText, styles.headerLinkTextActive]}>Home</Text>
                    <View style={styles.headerLinkUnderline} />
                  </View>
                  {NAV_LINKS.map((link) => (
                    <Pressable key={link.href} onPress={() => router.push(link.href as never)} hitSlop={8}>
                      <Text style={styles.headerLinkText}>{link.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              <View style={styles.headerActions}>
                {isWide && (
                  <Pressable onPress={() => router.push('/discover')} hitSlop={8} style={styles.headerIconBtn} accessibilityLabel="Search">
                    <Ionicons name="search" size={18} color={colors.textPrimary} />
                  </Pressable>
                )}
                <Button label="Join" onPress={() => router.push('/auth')} style={styles.joinBtn} />
                <Pressable onPress={() => router.push('/auth')} hitSlop={8} style={styles.loginBtn}>
                  <Text style={styles.loginBtnText}>Login</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </SafeAreaView>

        {/* Hero — illustrated (not photographic) background, per MountainScene's
            "no fake stock photos" rule: no adventure photography exists yet. */}
        <View style={[styles.heroSection, isWide ? styles.heroSectionWide : styles.heroSectionNarrow]}>
          <View style={styles.heroBg}>
            <MountainScene height={isWide ? 560 : 420} rounded={false} />
          </View>
          <View style={styles.heroScrim} />
          <View style={styles.heroContentWrap}>
            <View style={[styles.sectionInner, styles.heroInner]}>
              <Text style={styles.heroEyebrow}>EXPLORE · CONNECT · EXPERIENCE</Text>
              <Text style={styles.heroTitle}>
                Find your next{'\n'}
                <Text style={styles.heroTitleAccent}>adventure</Text>
              </Text>
              <Text style={styles.heroSubtitle}>Discover experiences. Meet people. Find your crew.</Text>

              <Pressable style={styles.searchBar} onPress={() => router.push('/discover')}>
                <Ionicons name="search" size={18} color={colors.textMuted} />
                <Text style={styles.searchPlaceholder}>Search adventures, places, or categories…</Text>
                <View style={styles.searchGo}>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </View>
              </Pressable>

              <View style={styles.heroPillRow}>
                <View style={styles.heroLocation}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.heroLocationText}>Nairobi, Kenya</Text>
                </View>
                {HERO_PILL_CATEGORIES.map((c) => (
                  <Pressable key={c} style={styles.heroPill} onPress={() => router.push('/discover')}>
                    <Text style={styles.heroPillText}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
          {isWide && (
            <Text style={styles.heroTagline}>
              Real people.{'\n'}Amazing places.{'\n'}Unforgettable moments.
            </Text>
          )}
        </View>

        {/* Value props */}
        <View style={styles.section}>
          <View style={styles.sectionInner}>
            <View style={styles.valueRow}>
              {VALUE_PROPS.map((v) => (
                <View key={v.title} style={[styles.valueCard, isWide && styles.valueCardWide]}>
                  <View style={styles.valueIconWrap}>
                    <Ionicons name={v.icon} size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.valueTitle}>{v.title}</Text>
                  <Text style={styles.valueBody}>{v.body}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Explore by category */}
        <View style={[styles.section, styles.mutedSection]}>
          <View style={styles.sectionInner}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionHeading}>Explore by Category</Text>
              <Pressable onPress={() => router.push('/discover')} hitSlop={8}>
                <Text style={styles.viewAllLink}>View all</Text>
              </Pressable>
            </View>
            <View style={styles.categoryRow}>
              {CATEGORY_TILES.map((c) => (
                <Pressable key={c.category} style={styles.categoryTile} onPress={() => router.push('/discover')}>
                  <View style={styles.categoryTileArt}>
                    <MountainScene height={108} rounded={false} category={c.category} />
                    <View style={styles.categoryTileIconWrap}>
                      <Ionicons name={c.icon} size={20} color={colors.textPrimary} />
                    </View>
                  </View>
                  <View style={styles.categoryTileFooter}>
                    <Text style={styles.categoryLabel}>{c.category}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Featured adventures */}
        <View style={styles.section}>
          <View style={styles.sectionInner}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionHeading}>Featured Adventures</Text>
              <Pressable onPress={() => router.push('/discover')} hitSlop={8}>
                <Text style={styles.viewAllLink}>View all</Text>
              </Pressable>
            </View>
            {featured.length === 0 ? (
              <View style={styles.emptyFeatured}>
                <Text style={styles.emptyFeaturedText}>New adventures are posted all the time — check back soon.</Text>
              </View>
            ) : (
              <View style={styles.featuredGrid} key={numColumns}>
                {featured.map((a) => (
                  <View key={a.id} style={[styles.featuredItem, { width: numColumns > 1 ? `${100 / numColumns}%` : '100%' }]}>
                    <AdventureCard adventure={a} onPress={() => openAdventure(a)} />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Community CTA */}
        <View style={[styles.section, styles.crewSection]}>
          <View style={styles.sectionInner}>
            <View style={[styles.crewRow, isWide && styles.crewRowWide]}>
              <View style={[styles.crewPanel, isWide && styles.crewPanelWide]}>
                <MountainScene height={140} category="Social" />
                <Text style={styles.crewEyebrow}>JOIN THE COMMUNITY</Text>
                <Text style={styles.crewTitle}>More than adventures. It's a community.</Text>
                <Text style={styles.crewBody}>Meet people who share your interests, explore together, and build a crew you keep coming back to.</Text>
                <Button label="See Crews" variant="secondary" onPress={() => router.push('/crews')} style={styles.crewBtn} />
              </View>
              <View style={[styles.crewPanel, isWide && styles.crewPanelWide]}>
                <MountainScene height={140} category="Road trip" />
                <Text style={styles.crewEyebrow}>FOR ORGANIZERS</Text>
                <Text style={styles.crewTitle}>Have an adventure to share?</Text>
                <Text style={styles.crewBody}>Host your own hike, ride, or meetup — set the spots, the price, and the details, and manage everyone who joins.</Text>
                <Button label="Create an adventure" variant="secondary" onPress={goCreate} style={styles.crewBtn} />
              </View>
            </View>
          </View>
        </View>

        {/* Closing CTA */}
        <View style={[styles.section, styles.closingSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.closingTitle}>Ready for your next adventure?</Text>
            <Button label="Join ThrillIQ" onPress={() => router.push('/auth')} style={styles.closingBtn} />
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.section, styles.footerSection]}>
          <View style={styles.sectionInner}>
            <Text style={styles.footerLogo}>ThrillIQ</Text>
            <Text style={styles.footerTagline}>Think. Explore. Connect.</Text>
            <View style={styles.footerLinks}>
              {NAV_LINKS.map((link) => (
                <Pressable key={link.href} onPress={() => router.push(link.href as never)} hitSlop={8}>
                  <Text style={styles.footerLinkText}>{link.label}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => router.push('/auth')} hitSlop={8}>
                <Text style={styles.footerLinkText}>Sign in</Text>
              </Pressable>
            </View>
            <Text style={styles.footerCopyright}>© {new Date().getFullYear()} ThrillIQ. Adventures are run independently by their organizers.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  headerSafe: { backgroundColor: colors.surface },
  headerBar: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  headerInner: {
    width: '100%',
    maxWidth: DESKTOP_CONTENT_MAX_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    height: 64,
    gap: spacing.xl,
  },
  logo: { ...type.sectionHeading, color: colors.primary, fontWeight: '800' },
  headerLinks: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, flex: 1 },
  headerLinkActive: { alignItems: 'center' },
  headerLinkText: { ...type.bodyEmphasis, color: colors.textSecondary },
  headerLinkTextActive: { color: colors.textPrimary },
  headerLinkUnderline: { height: 2, width: 20, borderRadius: 1, backgroundColor: colors.primary, marginTop: spacing.xs },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginLeft: 'auto' },
  headerIconBtn: { padding: spacing.xs },
  loginBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  loginBtnText: { ...type.bodyEmphasis, color: colors.textPrimary },
  joinBtn: { paddingHorizontal: spacing.lg, minHeight: 40 },

  section: { alignItems: 'center' },
  sectionInner: { width: '100%', maxWidth: DESKTOP_CONTENT_MAX_WIDTH, paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl },
  mutedSection: { backgroundColor: colors.surfaceMuted },

  heroSection: { position: 'relative', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  heroSectionWide: { height: 560 },
  heroSectionNarrow: { height: 420 },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.55)' },
  heroContentWrap: { width: '100%', alignItems: 'center' },
  heroInner: { paddingTop: 0, paddingBottom: spacing.xxxl },
  heroTagline: {
    position: 'absolute',
    right: spacing.xxxl,
    bottom: spacing.huge * 2,
    ...type.body,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'right',
  },
  heroLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: spacing.sm },
  heroLocationText: { ...type.bodyEmphasis, color: 'rgba(255,255,255,0.9)' },
  heroEyebrow: { ...type.caption, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5, fontWeight: '700', marginBottom: spacing.sm },
  heroTitle: { ...type.display, fontSize: 40, lineHeight: 46, color: '#fff' },
  heroTitleAccent: { color: '#4ADE80' },
  heroSubtitle: { ...type.largeBody, color: 'rgba(255,255,255,0.92)', marginTop: spacing.sm, marginBottom: spacing.lg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
    maxWidth: 560,
  },
  searchPlaceholder: { ...type.body, color: colors.textMuted, flex: 1 },
  searchGo: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  heroPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  heroPill: { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  heroPillText: { ...type.bodyEmphasis, color: '#fff' },

  valueRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl },
  valueCard: { width: '100%', gap: spacing.sm, alignItems: 'flex-start' },
  valueCardWide: { width: '18%', minWidth: 180, alignItems: 'center' },
  valueIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueTitle: { ...type.bodyEmphasis, textAlign: 'center' },
  valueBody: { ...type.secondary, color: colors.textSecondary, textAlign: 'center' },

  sectionHeading: { ...type.sectionHeading, marginBottom: spacing.lg },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  viewAllLink: { ...type.bodyEmphasis, color: colors.primary },

  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  categoryTile: {
    width: 132,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryTileArt: { height: 108, position: 'relative' },
  categoryTileIconWrap: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTileFooter: { paddingVertical: spacing.sm, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
  categoryLabel: { ...type.bodyEmphasis },

  featuredGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.sm },
  featuredItem: { paddingHorizontal: spacing.sm, marginBottom: spacing.lg },
  emptyFeatured: { paddingVertical: spacing.xl, alignItems: 'center' },
  emptyFeaturedText: { ...type.body, color: colors.textSecondary, textAlign: 'center' },

  crewSection: { backgroundColor: colors.surfaceMuted },
  crewRow: { gap: spacing.xxl },
  crewRowWide: { flexDirection: 'row' },
  crewPanel: { gap: spacing.sm },
  crewPanelWide: { flex: 1 },
  crewEyebrow: { ...type.caption, color: colors.primary, fontWeight: '700', letterSpacing: 1 },
  crewTitle: { ...type.screenHeading },
  crewBody: { ...type.body, color: colors.textSecondary, marginBottom: spacing.sm },
  crewBtn: { alignSelf: 'flex-start', paddingHorizontal: spacing.xl },

  closingSection: { backgroundColor: colors.textPrimary, alignItems: 'center' },
  closingTitle: { ...type.screenHeading, color: '#fff', textAlign: 'center', marginBottom: spacing.lg },
  closingBtn: { alignSelf: 'center', paddingHorizontal: spacing.xxl },

  footerSection: { backgroundColor: colors.surfaceMuted, paddingBottom: spacing.xxxl },
  footerLogo: { ...type.sectionHeading, color: colors.primary, fontWeight: '800' },
  footerTagline: { ...type.secondary, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.lg },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, marginBottom: spacing.lg },
  footerLinkText: { ...type.bodyEmphasis, color: colors.textSecondary },
  footerCopyright: { ...type.secondary, color: colors.textMuted },
});
