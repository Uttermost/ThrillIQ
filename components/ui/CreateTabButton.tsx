import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { colors } from '@/lib/theme';

// A raised circular button instead of a plain tab icon+label — organizers
// are core to the ecosystem, so Create should read as a distinct action,
// not just the third item in a row of four.
export function CreateTabButton({ onPress, accessibilityState }: BottomTabBarButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.wrap} accessibilityRole="button" accessibilityLabel="Create" accessibilityState={accessibilityState}>
      <Ionicons name="add" size={28} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    top: -18,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: `0 4px 12px ${colors.primary}66` },
      default: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
});
