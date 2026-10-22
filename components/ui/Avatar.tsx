import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function Avatar({ initials, hue, size = 40 }: { initials: string; hue: number; size?: number }) {
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `hsl(${hue}, 55%, 88%)`,
        },
      ]}>
      <Text style={[styles.text, { color: `hsl(${hue}, 45%, 32%)`, fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
  },
});
