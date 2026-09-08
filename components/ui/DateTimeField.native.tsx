import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { formatDateLabel, formatTimeLabel } from '@/lib/dateFormat';
import { colors, radius, spacing, type } from '@/lib/theme';

interface DateTimeFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  mode?: 'date' | 'datetime';
}

export function DateTimeField({ value, onChange, minimumDate, mode = 'datetime' }: DateTimeFieldProps) {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowDate(false);
    if (event.type === 'dismissed' || !selected) return;
    const next = new Date(value);
    next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    onChange(next);
  };

  const handleTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowTime(false);
    if (event.type === 'dismissed' || !selected) return;
    const next = new Date(value);
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable style={styles.field} onPress={() => setShowDate(true)}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDateLabel(value.getTime())}</Text>
        </Pressable>
        {mode === 'datetime' && (
          <Pressable style={styles.field} onPress={() => setShowTime(true)}>
            <Text style={styles.label}>Time</Text>
            <Text style={styles.value}>{formatTimeLabel(value.getTime())}</Text>
          </Pressable>
        )}
      </View>

      {showDate && (
        <>
          <DateTimePicker
            value={value}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={minimumDate}
            onChange={handleDateChange}
          />
          {Platform.OS === 'ios' && <Button label="Done" variant="secondary" onPress={() => setShowDate(false)} />}
        </>
      )}

      {showTime && (
        <>
          <DateTimePicker value={value} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={handleTimeChange} />
          {Platform.OS === 'ios' && <Button label="Done" variant="secondary" onPress={() => setShowTime(false)} />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  field: {
    flex: 1,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  label: { ...type.inputLabel, color: colors.textSecondary },
  value: { ...type.bodyEmphasis },
});
