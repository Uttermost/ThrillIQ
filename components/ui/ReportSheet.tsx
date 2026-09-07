import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { InlineError } from '@/components/ui/StateViews';
import { useApp } from '@/lib/store';
import { colors, CONTENT_MAX_WIDTH, radius, spacing, type } from '@/lib/theme';
import { Report, ReportTargetType } from '@/lib/types';

const REASONS: Report['reason'][] = ['Spam', 'Inappropriate content', 'Safety concern', 'Other'];

interface ReportSheetProps {
  visible: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  // Only meaningful for targetType 'comment' — the post it belongs to, so
  // admin can navigate there (comments have no page of their own).
  contextId?: string;
}

export function ReportSheet({ visible, onClose, targetType, targetId, contextId }: ReportSheetProps) {
  const { submitReport } = useApp();
  const { width } = useWindowDimensions();
  const isWide = width > CONTENT_MAX_WIDTH;
  const [reason, setReason] = useState<Report['reason'][]>([]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    setReason([]);
    setDetails('');
    setError(null);
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (reason.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReport({ targetType, targetId, contextId, reason: reason[0], details });
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={[styles.sheet, isWide && styles.sheetCentered]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Report {targetType === 'user' ? 'this person' : `this ${targetType}`}</Text>
        {submitted ? (
          <>
            <Text style={styles.thanks}>✓ Thanks — we've recorded your report.</Text>
            <Button label="Done" onPress={handleClose} />
          </>
        ) : (
          <>
            <ChipGroup label="Reason" options={REASONS} selected={reason} onChange={setReason} multi={false} />
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Any details that would help (optional)"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              maxLength={500}
              style={styles.input}
            />
            {error && <InlineError message={error} onRetry={handleSubmit} />}
            <Button label="Submit report" onPress={handleSubmit} disabled={reason.length === 0} loading={submitting} />
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sheetCentered: {
    left: undefined,
    right: undefined,
    alignSelf: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center' },
  title: { ...type.sectionHeading },
  thanks: { ...type.bodyEmphasis, color: colors.success, textAlign: 'center' },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 70,
    textAlignVertical: 'top',
    ...type.body,
  },
});
