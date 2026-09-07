import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { colors, radius } from '@/lib/theme';
import { Category } from '@/lib/types';

// A placeholder illustration, not real photography — there are no adventure
// photo assets in this project yet. Kept intentionally abstract (a mountain
// silhouette, not a literal scene) rather than dressed up to look like a
// stand-in for a real photo. Swapping this for actual adventure photography
// is real, separate work: an image field on Adventure, an upload/CDN path,
// and real assets — not something to fake with hotlinked stock photos.
const CATEGORY_TONE: Partial<Record<Category, { sky: string; near: string }>> = {
  Water: { sky: '#DBEAFE', near: colors.info },
  'Road trip': { sky: '#FEF3C7', near: colors.warning },
};

export function MountainScene({ height = 160, rounded = true, category }: { height?: number; rounded?: boolean; category?: Category }) {
  const tone = (category && CATEGORY_TONE[category]) || { sky: '#DCFCE7', near: colors.mountainNear };
  return (
    <View style={[styles.wrap, { height }, rounded && styles.rounded]}>
      <Svg width="100%" height="100%" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={tone.sky} />
            <Stop offset="1" stopColor={colors.background} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="300" height="160" fill="url(#sky)" />
        <Circle cx="262" cy="30" r="10" fill={colors.sunrise} opacity={0.7} />
        <Path d="M0 120 L60 70 L110 110 L160 55 L210 110 L260 80 L300 120 L300 160 L0 160 Z" fill={colors.mountainFar} opacity={0.55} />
        <Path d="M0 140 L70 95 L130 135 L190 85 L240 130 L300 105 L300 160 L0 160 Z" fill={tone.near} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
  },
  rounded: {
    borderRadius: radius.lg,
  },
});
