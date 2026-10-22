import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { InlineError } from '@/components/ui/StateViews';
import { EmptyState } from '@/components/ui/StateViews';
import { Skeleton } from '@/components/ui/Skeleton';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, type } from '@/lib/theme';
import { Crew } from '@/lib/types';

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

type Status = 'loading' | 'ready' | 'error';

export default function Crews() {
  const { myId, authenticated, fetchCrews, createCrew, joinCrew, leaveCrew } = useApp();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const list = await fetchCrews();
      setCrews(list);
      setStatus('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setStatus('error');
    }
  }, [fetchCrews]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    if (name.trim().length < 3) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createCrew({ name, description });
      setCrews((prev) => [created, ...prev]);
      setName('');
      setDescription('');
      setShowCreateForm(false);
      router.push(`/crew/${created.id}`);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleMembership = async (crew: Crew) => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    const isMember = crew.memberIds.includes(myId);
    setPendingId(crew.id);
    try {
      if (isMember) await leaveCrew(crew.id);
      else await joinCrew(crew.id);
      setCrews((prev) =>
        prev.map((c) =>
          c.id === crew.id
            ? { ...c, memberIds: isMember ? c.memberIds.filter((m) => m !== myId) : [...c.memberIds, myId] }
            : c
        )
      );
    } catch {
      // Best-effort: membership toggle failing just leaves the button as-is.
    } finally {
      setPendingId(null);
    }
  };

  const myCrews = crews.filter((c) => c.memberIds.includes(myId));
  const otherCrews = crews.filter((c) => !c.memberIds.includes(myId));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Crews"
        onEdit={() => setShowCreateForm((v) => !v)}
        actionIcon={showCreateForm ? 'close' : 'add'}
        actionLabel={showCreateForm ? 'Cancel' : 'New crew'}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {showCreateForm && (
          <View style={styles.createForm}>
            <FormField label="Crew name" required value={name} onChangeText={setName} placeholder="e.g. Sunrise Hikers Nairobi" maxLength={60} />
            <FormField
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="What's this crew about?"
              maxLength={300}
              multiline
              numberOfLines={3}
            />
            {createError && <InlineError message={createError} onRetry={handleCreate} />}
            <Button label="Create crew" onPress={handleCreate} disabled={name.trim().length < 3} loading={creating} />
          </View>
        )}

        {status === 'loading' && (
          <View style={{ gap: spacing.md }}>
            <Skeleton style={{ height: 72 }} />
            <Skeleton style={{ height: 72 }} />
          </View>
        )}

        {status === 'error' && <InlineError message={error ?? 'Something went wrong.'} retryLabel="Retry" onRetry={load} />}

        {status === 'ready' && (
          <>
            {myCrews.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>My crews</Text>
                {myCrews.map((c) => (
                  <CrewRow key={c.id} crew={c} isMember pending={pendingId === c.id} onPress={() => router.push(`/crew/${c.id}`)} />
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Discover crews</Text>
              {otherCrews.length === 0 ? (
                <EmptyState icon="people-outline" title="No more crews to discover" message="You're already in every crew there is." />
              ) : (
                otherCrews.map((c) => (
                  <CrewRow key={c.id} crew={c} isMember={false} pending={pendingId === c.id} onPress={() => router.push(`/crew/${c.id}`)} />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  function CrewRow({ crew, isMember, pending, onPress }: { crew: Crew; isMember: boolean; pending: boolean; onPress: () => void }) {
    return (
      <Pressable style={styles.crewRow} onPress={onPress}>
        <Avatar initials={initialsFor(crew.name)} hue={crew.avatarHue} size={48} />
        <View style={styles.crewInfo}>
          <Text style={styles.crewName} numberOfLines={1}>
            {crew.name}
          </Text>
          <Text style={styles.crewMeta}>
            {crew.memberIds.length} member{crew.memberIds.length === 1 ? '' : 's'}
          </Text>
        </View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleToggleMembership(crew);
          }}
          disabled={pending}
          style={[styles.membershipBtn, isMember && styles.membershipBtnActive]}>
          <Text style={[styles.membershipBtnLabel, isMember && styles.membershipBtnLabelActive]}>{isMember ? 'Joined' : 'Join'}</Text>
        </Pressable>
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  createForm: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
  },
  section: { gap: spacing.sm },
  sectionTitle: { ...type.sectionHeading },
  crewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  crewInfo: { flex: 1, gap: 2 },
  crewName: { ...type.bodyEmphasis },
  crewMeta: { ...type.secondary, color: colors.textSecondary },
  membershipBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  membershipBtnActive: { backgroundColor: colors.primarySurface, borderColor: colors.primary },
  membershipBtnLabel: { ...type.chip, color: colors.textPrimary },
  membershipBtnLabelActive: { color: colors.primary },
});
