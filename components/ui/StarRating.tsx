import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/lib/theme';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

// Read-only when onChange is omitted (review display); tappable 1-5 picker
// when it's provided (the leave-a-review form).
export function StarRating({ value, onChange, size = 18 }: StarRatingProps) {
  return (
    <View style={styles.row}>
      {([1, 2, 3, 4, 5] as const).map((n) => {
        const filled = n <= Math.round(value);
        const icon = <Ionicons name={filled ? 'star' : 'star-outline'} size={size} color={filled ? colors.accent : colors.textMuted} />;
        if (!onChange) return <View key={n}>{icon}</View>;
        return (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={4} accessibilityLabel={`Rate ${n} star${n === 1 ? '' : 's'}`}>
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
});
