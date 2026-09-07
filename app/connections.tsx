import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EmptyState, InlineError } from '@/components/ui/StateViews';
import { Skeleton } from '@/components/ui/Skeleton';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, type } from '@/lib/theme';
import { Connection } from '@/lib/types';

type Status = 'loading' | 'ready' | 'error';

export default function Connections() {
  const { myId, users, fetchOtherProfile, fetchConnectionsFor, respondToConnectionRequest } = useApp();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await fetchConnectionsFor(myId);
      setConnections(list);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [fetchConnectionsFor, myId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    connections.forEach((c) => {
      const otherId = c.requesterId === myId ? c.recipientId : c.requesterId;
      if (!users[otherId]) fetchOtherProfile(otherId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections]);

  const handleRespond = async (connectionId: string, accept: boolean) => {
    setBusyId(connectionId);
    try {
      await respondToConnectionRequest(connectionId, accept);
      setConnections((prev) =>
        prev.map((c) => (c.id === connectionId ? (accept ? { ...c, status: 'accepted' as const } : null) : c)).filter((c): c is Connection => c !== null)
      );
    } catch {
      // Best-effort: the request just stays pending on failure.
    } finally {
      setBusyId(null);
    }
  };

  const received = connections.filter((c) => c.status === 'pending' && c.recipientId === myId);
  const sent = connections.filter((c) => c.status === 'pending' && c.requesterId === myId);
  const accepted = connections.filter((c) => c.status === 'accepted');

  const otherIdFor = (c: Connection) => (c.requesterId === myId ? c.recipientId : c.requesterId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Connections" />
      <ScrollView contentContainerStyle={styles.content}>
        {status === 'loading' && (
          <View style={{ gap: spacing.md }}>
            <Skeleton style={{ height: 64 }} />
            <Skeleton style={{ height: 64 }} />
          </View>
        )}

        {status === 'error' && <InlineError message="Couldn't load connections." retryLabel="Retry" onRetry={load} />}

        {status === 'ready' && (
          <>
            {received.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Requests</Text>
                {received.map((c) => {
                  const other = users[otherIdFor(c)];
                  return (
                    <View key={c.id} style={styles.row}>
                      <Pressable style={styles.rowIdentity} onPress={() => router.push(`/profile/${otherIdFor(c)}`)}>
                        <Avatar initials={other?.initials ?? '?'} hue={other?.avatarHue ?? 0} size={44} />
                        <Text style={styles.rowName}>{other?.name ?? 'Someone'}</Text>
                      </Pressable>
                      <View style={styles.respondRow}>
                        <Button label="Accept" onPress={() => handleRespond(c.id, true)} loading={busyId === c.id} style={styles.respondBtn} />
                        <Button
                          label="Decline"
                          variant="secondary"
                          onPress={() => handleRespond(c.id, false)}
                          loading={busyId === c.id}
                          style={styles.respondBtn}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My connections</Text>
              {accepted.length === 0 ? (
                <EmptyState icon="people-outline" title="No connections yet" message="Connect with people you meet on adventures." />
              ) : (
                accepted.map((c) => {
                  const other = users[otherIdFor(c)];
                  return (
                    <Pressable key={c.id} style={styles.row} onPress={() => router.push(`/profile/${otherIdFor(c)}`)}>
                      <View style={styles.rowIdentity}>
                        <Avatar initials={other?.initials ?? '?'} hue={other?.avatarHue ?? 0} size={44} />
                        <Text style={styles.rowName}>{other?.name ?? 'Someone'}</Text>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>

            {sent.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sent</Text>
                {sent.map((c) => {
                  const other = users[otherIdFor(c)];
                  return (
                    <Pressable key={c.id} style={styles.row} onPress={() => router.push(`/profile/${otherIdFor(c)}`)}>
                      <View style={styles.rowIdentity}>
                        <Avatar initials={other?.initials ?? '?'} hue={other?.avatarHue ?? 0} size={44} />
                        <Text style={styles.rowName}>{other?.name ?? 'Someone'}</Text>
                      </View>
                      <Text style={styles.pendingLabel}>Requested</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  section: { gap: spacing.sm },
  sectionTitle: { ...type.sectionHeading },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  rowName: { ...type.bodyEmphasis },
  respondRow: { flexDirection: 'row', gap: spacing.sm },
  respondBtn: { minWidth: 80 },
  pendingLabel: { ...type.secondary, color: colors.textMuted },
});
