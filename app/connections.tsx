import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { EmptyState, InlineError } from '@/components/ui/StateViews';
import { Skeleton } from '@/components/ui/Skeleton';
import { useApp } from '@/lib/store';
import { CONTENT_MAX_WIDTH, colors, radius, spacing, type, typography } from '@/lib/theme';
import { Connection, User } from '@/lib/types';

type Status = 'loading' | 'ready' | 'error';

export default function Connections() {
  const { myId, users, fetchOtherProfile, fetchConnectionsFor, respondToConnectionRequest } = useApp();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width > CONTENT_MAX_WIDTH;
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
      {isWide ? (
        <View style={styles.wideHeader}>
          <Text style={styles.wideHeading}>People</Text>
          <Text style={styles.wideSubheading}>Requests, connections, and people you've reached out to.</Text>
        </View>
      ) : (
        <ScreenHeader title="Connections" />
      )}
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
                {isWide ? (
                  <View style={styles.grid}>
                    {received.map((c) => (
                      <PersonCard key={c.id} person={users[otherIdFor(c)]} uid={otherIdFor(c)}>
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
                      </PersonCard>
                    ))}
                  </View>
                ) : (
                  received.map((c) => {
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
                  })
                )}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My connections</Text>
              {accepted.length === 0 ? (
                <EmptyState icon="people-outline" title="No connections yet" message="Connect with people you meet on adventures." />
              ) : isWide ? (
                <View style={styles.grid}>
                  {accepted.map((c) => (
                    <PersonCard key={c.id} person={users[otherIdFor(c)]} uid={otherIdFor(c)} />
                  ))}
                </View>
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
                {isWide ? (
                  <View style={styles.grid}>
                    {sent.map((c) => (
                      <PersonCard key={c.id} person={users[otherIdFor(c)]} uid={otherIdFor(c)}>
                        <Text style={styles.pendingLabel}>Requested</Text>
                      </PersonCard>
                    ))}
                  </View>
                ) : (
                  sent.map((c) => {
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
                  })
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  // Desktop-only card, reused across Requests/My connections/Sent — children
  // is whatever footer that section needs (respond buttons, a "Requested"
  // label, or nothing for an already-accepted connection).
  function PersonCard({ person, uid, children }: { person: User | undefined; uid: string; children?: React.ReactNode }) {
    return (
      <Pressable style={styles.personCard} onPress={() => router.push(`/profile/${uid}`)}>
        <Avatar initials={person?.initials ?? '?'} hue={person?.avatarHue ?? 0} size={56} />
        <Text style={styles.personCardName} numberOfLines={1}>
          {person?.name ?? 'Someone'}
        </Text>
        {children}
      </Pressable>
    );
  }
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
  wideHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  wideHeading: { ...type.screenHeading },
  wideSubheading: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  personCard: {
    width: 200,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  personCardName: { ...type.bodyEmphasis, textAlign: 'center' },
});
