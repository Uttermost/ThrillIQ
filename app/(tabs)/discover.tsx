import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdventureCard } from '@/components/AdventureCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { ME_ID } from '@/lib/mockData';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, typography } from '@/lib/theme';
import { Adventure } from '@/lib/types';

type Filter = 'All' | 'Hike' | 'Road trip' | 'Beginner';
const FILTERS: Filter[] = ['All', 'Hike', 'Road trip', 'Beginner'];
type Status = 'loading' | 'ready' | 'error';

export default function Discover() {
  const { adventures, fetchAdventures, toggleLike } = useApp();
  const [status, setStatus] = useState<Status>('loading');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(() => {
    setStatus('loading');
    fetchAdventures()
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'));
  }, [fetchAdventures]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return adventures.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(search.trim().toLowerCase());
      const matchesFilter =
        filter === 'All' || a.type === filter || (filter === 'Beginner' && a.difficulty === 'Beginner');
      return matchesSearch && matchesFilter;
    });
  }, [adventures, search, filter]);

  useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const selected = filtered.find((a) => a.id === selectedId) ?? filtered[0];

  const openAdventure = (a: Adventure) => {
    if (a.organizerId === ME_ID) {
      router.push(`/organizer/${a.id}`);
    } else {
      router.push(`/adventure/${a.id}`);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Discover</Text>
        <Pressable onPress={() => setView(view === 'list' ? 'map' : 'list')} style={styles.viewToggle}>
          <Text style={styles.viewToggleLabel}>{view === 'list' ? 'Map' : 'List'}</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search adventures"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
            <Text style={[styles.chipLabel, filter === f && styles.chipLabelActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      {status === 'loading' && (
        <View style={styles.list}>
          <Skeleton style={{ height: 180, marginBottom: spacing.md }} />
          <Skeleton style={{ height: 180 }} />
        </View>
      )}

      {status === 'error' && (
        <ErrorState title="Couldn't load adventures" message="Check your connection and try again." onRetry={load} />
      )}

      {status === 'ready' && view === 'list' && filtered.length === 0 && (
        <EmptyState icon="search-outline" title="No matches" message="Try a different search or filter." />
      )}

      {status === 'ready' && view === 'list' && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.textSecondary} />}
          renderItem={({ item }) => (
            <View style={{ marginBottom: spacing.lg }}>
              <AdventureCard adventure={item} onPress={() => openAdventure(item)} onToggleLike={() => toggleLike(item.id)} />
            </View>
          )}
        />
      )}

      {status === 'ready' && view === 'map' && (
        <View style={styles.mapWrap}>
          <View style={styles.mapCanvas}>
            {filtered.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => setSelectedId(a.id)}
                style={[
                  styles.pin,
                  { left: `${a.coordinate.x * 100}%`, top: `${a.coordinate.y * 100}%` },
                  a.id === selected?.id && styles.pinActive,
                ]}
              />
            ))}
          </View>
          {selected && (
            <Pressable style={styles.mapCard} onPress={() => openAdventure(selected)}>
              <Text style={styles.mapCardTitle}>{selected.title}</Text>
              <Text style={styles.mapCardMeta}>
                {selected.location} · {selected.dateLabel} {selected.meetingTime}
              </Text>
            </Pressable>
          )}
          {filtered.length === 0 && (
            <View style={styles.mapEmpty}>
              <EmptyState icon="search-outline" title="No matches" message="Try a different search or filter." />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  heading: { ...typography.title },
  viewToggle: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  viewToggleLabel: { ...typography.caption, fontWeight: '700' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    height: 46,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  chipActive: { backgroundColor: colors.textPrimary },
  chipLabel: { ...typography.caption, fontWeight: '600' },
  chipLabelActive: { color: '#fff' },
  list: { padding: spacing.lg },
  mapWrap: { flex: 1, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#E4EBDD',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  pin: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: -7,
    marginTop: -7,
  },
  pinActive: { backgroundColor: colors.danger, width: 18, height: 18, borderRadius: 9, marginLeft: -9, marginTop: -9 },
  mapCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapCardTitle: { ...typography.subheading },
  mapCardMeta: { ...typography.caption, marginTop: spacing.xs },
  mapEmpty: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
