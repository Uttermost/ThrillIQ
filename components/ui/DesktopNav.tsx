import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { useApp } from '@/lib/store';
import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors, spacing, type } from '@/lib/theme';

interface NavLink {
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  // Which pathnames count as "on this link" for the active-state highlight —
  // e.g. viewing a single crew should still highlight the Crews link.
  activePrefixes: string[];
}

const NAV_LINKS: NavLink[] = [
  // '/organizer/' (trailing slash, not bare '/organizer') — managing one
  // hosted adventure is still part of the Discover flow; the Organizer
  // Dashboard index itself (reached from Profile) isn't any of these four.
  { label: 'Discover', href: '/discover', icon: 'compass-outline', activePrefixes: ['/discover', '/adventure', '/organizer/'] },
  { label: 'Feed', href: '/feed', icon: 'chatbubbles-outline', activePrefixes: ['/feed', '/post'] },
  { label: 'People', href: '/connections', icon: 'people-outline', activePrefixes: ['/connections', '/profile/'] },
  { label: 'Crews', href: '/crews', icon: 'flag-outline', activePrefixes: ['/crews', '/crew/'] },
];

// Public marketing pages (their own PublicHeader, not this nav) — checked
// once here rather than allocated fresh on every render. Prefix-matched so
// /blog/[slug] doesn't need every post slug listed here.
const PUBLIC_SITE_PATHS = ['/home', '/about', '/faqs', '/safety', '/terms', '/privacy', '/contact', '/blog', '/for-organizers'];
function isPublicSitePath(pathname: string): boolean {
  return PUBLIC_SITE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Desktop web only (see ResponsiveViewport for the same breakpoint gating
// the wide content layout it replaces the bottom tab bar for) — a
// persistent top nav across every screen, per the product's desktop IA:
// mobile keeps the bottom tab bar, wide web gets Discover/Feed/People/Crews
// up top plus search/create/notifications/messages/profile as utilities.
export function DesktopNav() {
  const { width } = useWindowDimensions();
  const { onboarded, authenticated, me, notifications } = useApp();
  const pathname = usePathname();

  // Onboarding and sign-in are single-purpose, centered forms — showing the
  // full app shell (Feed/People/Crews) before someone has even opened the
  // app would be premature, not just visually cramped. The public site
  // pages (Home, About, FAQs, Safety) have their own marketing-oriented
  // header (PublicHeader) with Login/Join, not this authenticated-app nav.
  if (
    Platform.OS !== 'web' ||
    width <= CONTENT_MAX_WIDTH ||
    !onboarded ||
    pathname.startsWith('/auth') ||
    pathname === '/onboarding' ||
    isPublicSitePath(pathname)
  ) {
    return null;
  }

  const hasUnread = notifications.some((n) => !n.read);

  const go = (href: string, requiresAuth = false) => {
    if (requiresAuth && !authenticated) {
      router.push('/auth');
      return;
    }
    router.push(href as never);
  };

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Pressable onPress={() => go('/discover')} hitSlop={8}>
          <Text style={styles.logo}>ThrillIQ</Text>
        </Pressable>

        <View style={styles.links}>
          {NAV_LINKS.map((link) => {
            const active = link.activePrefixes.some((p) => pathname === p || pathname.startsWith(p));
            return (
              <Pressable key={link.href} onPress={() => go(link.href)} style={styles.link}>
                <Text style={[styles.linkLabel, active && styles.linkLabelActive]}>{link.label}</Text>
                {active && <View style={styles.linkUnderline} />}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.utilities}>
          <Pressable onPress={() => go('/search')} hitSlop={8} accessibilityLabel="Search" style={styles.iconButton}>
            <Ionicons name="search" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => go('/create', true)} accessibilityLabel="Create" style={styles.createButton}>
            <Ionicons name="add" size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={() => go('/notifications', true)} hitSlop={8} accessibilityLabel="Notifications" style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
            {hasUnread && <View style={styles.dot} />}
          </Pressable>
          <Pressable onPress={() => go('/messages', true)} hitSlop={8} accessibilityLabel="Messages" style={styles.iconButton}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => go('/profile', true)} hitSlop={4} accessibilityLabel="Profile">
            {authenticated ? <Avatar initials={me.initials} hue={me.avatarHue} size={32} /> : <Ionicons name="person-circle-outline" size={32} color={colors.textSecondary} />}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: DESKTOP_CONTENT_MAX_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    height: 64,
    gap: spacing.xxl,
  },
  logo: { ...type.sectionHeading, color: colors.primary, fontWeight: '800' },
  links: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, flex: 1 },
  link: { paddingVertical: spacing.sm },
  linkLabel: { ...type.bodyEmphasis, color: colors.textSecondary },
  linkLabelActive: { color: colors.textPrimary },
  linkUnderline: { height: 2, borderRadius: 1, backgroundColor: colors.primary, marginTop: spacing.xs },
  utilities: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  iconButton: { position: 'relative' },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  createButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
