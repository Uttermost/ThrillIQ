import { usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { CONTENT_MAX_WIDTH, DESKTOP_CONTENT_MAX_WIDTH, colors } from '@/lib/theme';

// Screens redesigned to use real desktop width (top nav, multi-column
// grids) instead of the narrow centered column below — see DesktopNav and
// Discover. Everything not listed here still gets the phone-width
// treatment on wide viewports until it's redesigned too.
const WIDE_LAYOUT_PREFIXES = ['/discover', '/connections', '/crews', '/adventure'];

// Phones render full-bleed; anything wider (tablets, desktop web) gets the
// app centered in a fixed-width column with a neutral gutter on each side,
// per the responsive-design spec (§60) — cards, forms and text shouldn't
// stretch across a tablet-width screen just because the space is there.
// The exception is WIDE_LAYOUT_PREFIXES above, which get a wider column
// instead of the phone-width one.
export function ResponsiveViewport({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const pathname = usePathname();

  if (width <= CONTENT_MAX_WIDTH) {
    return <View style={styles.fullBleed}>{children}</View>;
  }

  const isWide = WIDE_LAYOUT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <View style={styles.gutter}>
      <View style={[styles.centered, isWide && styles.centeredWide]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullBleed: { flex: 1, backgroundColor: colors.background },
  gutter: { flex: 1, alignItems: 'center', backgroundColor: colors.surfaceMuted },
  centered: { flex: 1, width: '100%', maxWidth: CONTENT_MAX_WIDTH, backgroundColor: colors.background },
  centeredWide: { maxWidth: DESKTOP_CONTENT_MAX_WIDTH },
});
