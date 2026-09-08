import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, spacing, type } from '@/lib/theme';

// Shared top bar for every public/marketing page (Home, About, FAQs,
// Safety) — logged-out visitors only, Login/Join instead of the
// authenticated DesktopNav. Only links to pages that actually exist —
// no Adventures/Places/For Organizers placeholders (see the handoff doc's
// nav list; those routes aren't built yet, and a dead link is worse than
// a shorter nav).
export type PublicNavKey = 'Home' | 'Discover' | 'Feed' | 'People' | 'Crews' | 'About';

export const PUBLIC_NAV_LINKS: { key: PublicNavKey; label: string; href: string }[] = [
  { key: 'Home', label: 'Home', href: '/home' },
  { key: 'Discover', label: 'Discover', href: '/discover' },
  { key: 'Feed', label: 'Feed', href: '/feed' },
  { key: 'People', label: 'People', href: '/connections' },
  { key: 'Crews', label: 'Crews', href: '/crews' },
  { key: 'About', label: 'About', href: '/about' },
];

// active is omitted for pages that aren't in the primary nav (FAQs, Safety
// — reachable from the footer) rather than falsely highlighting Home.
export function PublicHeader({ active }: { active?: PublicNavKey }) {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;

  return (
    <SafeAreaView edges={['top']} style={styles.headerSafe}>
      <View style={styles.headerBar}>
        <View style={styles.headerInner}>
          <Pressable onPress={() => router.push('/home')} hitSlop={8}>
            <Text style={styles.logo}>ThrillIQ</Text>
          </Pressable>
          {isWide && (
            <View style={styles.headerLinks}>
              {PUBLIC_NAV_LINKS.map((link) => {
                const isActive = link.key === active;
                return (
                  <Pressable key={link.href} onPress={() => router.push(link.href as never)} hitSlop={8}>
                    <Text style={[styles.headerLinkText, isActive && styles.headerLinkTextActive]}>{link.label}</Text>
                    {isActive && <View style={styles.headerLinkUnderline} />}
                  </Pressable>
                );
              })}
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
  );
}

const styles = StyleSheet.create({
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
  headerLinkText: { ...type.bodyEmphasis, color: colors.textSecondary },
  headerLinkTextActive: { color: colors.textPrimary },
  headerLinkUnderline: { height: 2, borderRadius: 1, backgroundColor: colors.primary, marginTop: spacing.xs },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginLeft: 'auto' },
  headerIconBtn: { padding: spacing.xs },
  loginBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  loginBtnText: { ...type.bodyEmphasis, color: colors.textPrimary },
  joinBtn: { paddingHorizontal: spacing.lg, minHeight: 40 },
});
