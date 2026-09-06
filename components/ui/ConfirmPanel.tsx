import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/lib/theme';

interface ConfirmPanelProps {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmPanel({ message, confirmLabel, cancelLabel, onConfirm, onCancel, loading }: ConfirmPanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.row}>
        <Button label={confirmLabel} onPress={onConfirm} variant="danger" loading={loading} style={styles.flex} />
        <Button label={cancelLabel} onPress={onCancel} variant="secondary" disabled={loading} style={styles.flex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  message: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
