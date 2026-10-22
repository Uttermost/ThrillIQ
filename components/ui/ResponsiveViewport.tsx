import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { CONTENT_MAX_WIDTH, colors } from '@/lib/theme';

// Phones render full-bleed; anything wider (tablets, desktop web) gets the
// app centered in a fixed-width column with a neutral gutter on each side,
// per the responsive-design spec (§60) — cards, forms and text shouldn't
// stretch across a tablet-width screen just because the space is there.
export function ResponsiveViewport({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();

  if (width <= CONTENT_MAX_WIDTH) {
    return <View style={styles.fullBleed}>{children}</View>;
  }

  return (
    <View style={styles.gutter}>
      <View style={styles.centered}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullBleed: { flex: 1, backgroundColor: colors.background },
  gutter: { flex: 1, alignItems: 'center', backgroundColor: colors.surfaceMuted },
  centered: { flex: 1, width: '100%', maxWidth: CONTENT_MAX_WIDTH, backgroundColor: colors.background },
});
