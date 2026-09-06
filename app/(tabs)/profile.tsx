import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { ConfirmPanel } from '@/components/ui/ConfirmPanel';
import { EmptyState } from '@/components/ui/StateViews';
import { ME_ID } from '@/lib/mockData';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { Adventure } from '@/lib/types';

type Tab = 'Upcoming' | 'Liked' | 'Hosting';

export default function Profile() {
  const { me, adventures, simulateFailures, setSimulateFailures, signOut } = useApp();
  const [tab, setTab] = useState<Tab>('Upcoming');
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth');
  };

  const upcoming = adventures.filter((a) => a.participantIds.includes(ME_ID));
  const liked = adventures.filter((a) => a.likedByMe);
  const hosting = adventures.filter((a) => a.organizerId === ME_ID);

  const stats = useMemo(
    () => ({
      hikes: adventures.filter((a) => a.type === 'Hike' && (a.participantIds.includes(ME_ID) || a.organizerId === ME_ID)).length,
      roadTrips: adventures.filter((a) => a.type === 'Road trip' && (a.participantIds.includes(ME_ID) || a.organizerId === ME_ID)).length,
      hosting: hosting.length,
    }),
    [adventures, hosting.length]
  );

  const list = tab === 'Upcoming' ? upcoming : tab === 'Liked' ? liked : hosting;

  const openAdventure = (a: Adventure) => {
    if (a.organizerId === ME_ID) router.push(`/organizer/${a.id}`);
    else router.push(`/adventure/${a.id}`);
  };

  const emptyCopy: Record<Tab, { icon: 'time-outline' | 'heart-outline' | 'megaphone-outline'; title: string; message: string }> = {
    Upcoming: { icon: 'time-outline', title: 'No upcoming adventures', message: 'Join something on Discover to see it here.' },
    Liked: { icon: 'heart-outline', title: 'Nothing liked yet', message: 'Tap the heart on any adventure to save it here.' },
    Hosting: { icon: 'megaphone-outline', title: 'Not hosting anything', message: 'Create an adventure to start hosting.' },
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identityRow}>
          <Avatar initials={me.initials} hue={me.avatarHue} size={56} />
          <View>
            <Text style={styles.name}>{me.name}</Text>
            <Text style={styles.role}>
              {me.role} · {me.location}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value={stats.hikes} label="Hikes" />
          <Stat value={stats.roadTrips} label="Road trips" />
          <Stat value={stats.hosting} label="Hosting" />
        </View>

        <View style={styles.tabs}>
          {(['Upcoming', 'Liked', 'Hosting'] as Tab[]).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={styles.tabButton}>
              <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>{t}</Text>
              {tab === t && <View style={styles.tabIndicator} />}
            </Pressable>
          ))}
        </View>

        {list.length === 0 ? (
          <EmptyState icon={emptyCopy[tab].icon} title={emptyCopy[tab].title} message={emptyCopy[tab].message} />
        ) : (
          <View style={styles.list}>
            {list.map((a) => (
              <Pressable key={a.id} style={styles.item} onPress={() => openAdventure(a)}>
                <Text style={styles.itemTitle}>{a.title}</Text>
                <Text style={styles.itemMeta}>
                  {tab === 'Upcoming' ? 'Joined · ' : tab === 'Hosting' ? 'Hosting · ' : ''}
                  {a.dateLabel}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {!confirmingLogout ? (
          <Pressable onPress={() => setConfirmingLogout(true)}>
            <Text style={styles.logoutLink}>Log out</Text>
          </Pressable>
        ) : (
          <ConfirmPanel
            message="Log out of ThrillIQ?"
            confirmLabel="Yes, log out"
            cancelLabel="Stay signed in"
            onConfirm={handleLogout}
            onCancel={() => setConfirmingLogout(false)}
          />
        )}

        <View style={styles.devSection}>
          <View style={styles.devRow}>
            <Text style={styles.devLabel}>Simulate network failures</Text>
            <Switch value={simulateFailures} onValueChange={setSimulateFailures} />
          </View>
          <Text style={styles.devHint}>For testing loading, error, and retry states.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { ...typography.heading },
  role: { ...typography.caption, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  statLabel: { ...typography.small, marginTop: 2 },
  tabs: { flexDirection: 'row', gap: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabButton: { paddingBottom: spacing.sm },
  tabLabel: { ...typography.caption, fontWeight: '600', color: colors.textMuted },
  tabLabelActive: { color: colors.textPrimary },
  tabIndicator: { height: 2, backgroundColor: colors.textPrimary, marginTop: spacing.xs, borderRadius: 1 },
  list: { gap: spacing.sm },
  item: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  itemTitle: { ...typography.subheading, fontSize: 15 },
  itemMeta: { ...typography.caption, marginTop: 2 },
  logoutLink: { color: colors.danger, textAlign: 'center', fontWeight: '600', fontSize: 14 },
  devSection: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  devRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  devLabel: { ...typography.caption, fontWeight: '600' },
  devHint: { ...typography.small, marginTop: spacing.xs },
});
