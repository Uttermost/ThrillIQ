import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { colors, radius } from '@/lib/theme';

export function MountainScene({ height = 160, rounded = true }: { height?: number; rounded?: boolean }) {
  return (
    <View style={[styles.wrap, { height }, rounded && styles.rounded]}>
      <Svg width="100%" height="100%" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#DCFCE7" />
            <Stop offset="1" stopColor={colors.background} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="300" height="160" fill="url(#sky)" />
        <Circle cx="235" cy="55" r="22" fill={colors.sunrise} />
        <Path d="M0 120 L60 70 L110 110 L160 55 L210 110 L260 80 L300 120 L300 160 L0 160 Z" fill={colors.mountainFar} opacity={0.55} />
        <Path d="M0 140 L70 95 L130 135 L190 85 L240 130 L300 105 L300 160 L0 160 Z" fill={colors.mountainNear} />
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
