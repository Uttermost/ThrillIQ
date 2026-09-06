import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmPanel } from '@/components/ui/ConfirmPanel';
import { InlineError } from '@/components/ui/StateViews';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';

export default function OrganizerDashboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { adventures, users, cancelAdventure } = useApp();
  const adventure = adventures.find((a) => a.id === id);

  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (!adventure) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Adventure" />
        <Text style={styles.notFound}>This adventure no longer exists.</Text>
      </SafeAreaView>
    );
  }

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelAdventure(adventure.id);
      router.replace('/(tabs)/profile');
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={`${adventure.title} · ${adventure.dateLabel}`} onEdit={() => router.push(`/edit/${adventure.id}`)} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.price}>~KSh {adventure.priceKsh.toLocaleString()}</Text>

        <View style={styles.spotsRow}>
          <Text style={styles.spotsLabel}>Spots filled</Text>
          <Text style={styles.spotsValue}>
            {adventure.spotsFilled} of {adventure.spotsTotal}
          </Text>
        </View>

        <View style={styles.participants}>
          {adventure.participantIds.length === 0 ? (
            <Text style={styles.noParticipants}>No one has joined yet.</Text>
          ) : (
            adventure.participantIds.map((pid) => (
              <View key={pid} style={styles.participantRow}>
                <Text style={styles.participantName}>{users[pid]?.name ?? pid}</Text>
                <Badge label="Joined" tone="success" />
              </View>
            ))
          )}
        </View>

        {!confirmingCancel ? (
          <Button label="Cancel adventure" variant="danger" onPress={() => setConfirmingCancel(true)} style={{ marginTop: spacing.xl }} />
        ) : (
          <ConfirmPanel
            message="This notifies joined participants and can't be undone."
            confirmLabel="Yes, cancel it"
            cancelLabel="Keep it"
            loading={cancelling}
            onConfirm={handleCancel}
            onCancel={() => {
              setConfirmingCancel(false);
              setCancelError(null);
            }}
          />
        )}
        {cancelError && <InlineError message={cancelError} onRetry={handleCancel} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  notFound: { ...typography.body, padding: spacing.lg },
  price: { ...typography.caption },
  spotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  spotsLabel: { ...typography.caption },
  spotsValue: { ...typography.subheading, fontSize: 15 },
  participants: { gap: spacing.sm },
  noParticipants: { ...typography.caption },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  participantName: { ...typography.body },
});
