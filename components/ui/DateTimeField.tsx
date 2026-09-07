import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '@/lib/theme';

interface DateTimeFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
}

// Web has no native picker UI to borrow — real HTML date/time inputs give
// every browser's own picker for free instead of building a custom one.
// Cast to sidestep JSX.IntrinsicElements (React Native's types don't know
// about DOM host elements); this file only ever runs on the web bundler.
const Input = 'input' as unknown as React.FC<React.InputHTMLAttributes<HTMLInputElement> & { style?: unknown }>;

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toDateInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInputValue(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DateTimeField({ value, onChange, minimumDate }: DateTimeFieldProps) {
  const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [y, m, d] = e.target.value.split('-').map(Number);
    if (!y || !m || !d) return;
    const next = new Date(value);
    next.setFullYear(y, m - 1, d);
    onChange(next);
  };

  const handleTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, min] = e.target.value.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(min)) return;
    const next = new Date(value);
    next.setHours(h, min, 0, 0);
    onChange(next);
  };

  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <Text style={styles.label}>Date</Text>
        <Input
          type="date"
          value={toDateInputValue(value)}
          min={minimumDate ? toDateInputValue(minimumDate) : undefined}
          onChange={handleDate}
          style={inputStyle}
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Time</Text>
        <Input type="time" value={toTimeInputValue(value)} onChange={handleTime} style={inputStyle} />
      </View>
    </View>
  );
}

const inputStyle = {
  fontFamily: 'inherit',
  fontSize: 15,
  padding: spacing.md,
  borderRadius: radius.md,
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  width: '100%',
  boxSizing: 'border-box',
} as const;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  field: { flex: 1, gap: spacing.xs },
  label: { ...type.inputLabel, color: colors.textSecondary },
});
