import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdventureCard } from '@/components/AdventureCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateViews';
import { countActiveFilters, DEFAULT_FILTERS, DiscoverFilters, FilterSheet } from '@/components/ui/FilterSheet';
import { bucketForTimestamp } from '@/lib/dateBuckets';
import { distanceKm } from '@/lib/geo';
import { useApp } from '@/lib/store';
import { colors, radius, spacing, type, typography } from '@/lib/theme';
import { Adventure, Category } from '@/lib/types';

const NEAR_ME_RADIUS_KM = 50;

type CategoryFilter = 'All' | Category;
const CATEGORY_FILTERS: CategoryFilter[] = [
  'All',
  'Hiking',
  'Road trip',
  'Camping',
  'Cycling',
  'Wellness',
  'Water',
  'Photography',
  'Networking',
  'Social',
  'Other',
];
type Status = 'loading' | 'ready' | 'error';

function priceMatchesBand(priceKsh: number, band: DiscoverFilters['price']): boolean {
  switch (band) {
    case 'Any':
      return true;
    case 'Free':
      return priceKsh === 0;
    case 'Under 1,000':
      return priceKsh > 0 && priceKsh < 1000;
    case '1,000–3,000':
      return priceKsh >= 1000 && priceKsh <= 3000;
    case '3,000–5,000':
      return priceKsh > 3000 && priceKsh <= 5000;
    case '5,000+':
      return priceKsh > 5000;
  }
}

export default function Discover() {
  const { myId, authenticated, adventures, notifications, fetchAdventures, toggleLike } = useApp();
  const hasUnreadNotifications = notifications.some((n) => !n.read);
  const [status, setStatus] = useState<Status>('loading');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [filters, setFilters] = useState<DiscoverFilters>(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [myCoords, setMyCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeError, setNearMeError] = useState<string | null>(null);

  const handleRequestNearMe = useCallback(async () => {
    setNearMeLoading(true);
    setNearMeError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setNearMeError('Location permission denied.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setMyCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      setFilters((f) => ({ ...f, nearMe: true }));
    } catch {
      setNearMeError("Couldn't get your location.");
    } finally {
      setNearMeLoading(false);
    }
  }, []);

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
    const q = search.trim().toLowerCase();
    const now = Date.now();
    const list = adventures.filter((a) => {
      const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.location.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
      const matchesRegion = filters.region === 'Any' || a.location.toLowerCase().includes(filters.region.toLowerCase());
      const matchesDifficulty = filters.difficulty === 'Any' || a.difficulty === filters.difficulty;
      const matchesSocial = filters.socialLevel === 'Any' || a.socialLevel === filters.socialLevel;
      const matchesPace = filters.pace === 'Any' || a.pace === filters.pace;
      const matchesIntensity = filters.intensity === 'Any' || a.intensity === filters.intensity;
      const matchesTransport = filters.transport === 'Any' || a.transport === filters.transport;
      const matchesAudience = filters.audience.length === 0 || filters.audience.some((aud) => a.audience.includes(aud));
      const matchesWhen = filters.when === 'Any time' || bucketForTimestamp(a.dateTimestamp, now) === filters.when;
      const matchesPrice = priceMatchesBand(a.priceKsh, filters.price);
      // Adventures with no saved coordinates (every one created before a
      // location was ever attached) can't match Near Me — there's nothing
      // to measure distance from, so they're correctly excluded rather than
      // silently included regardless of actual distance.
      const matchesNearMe =
        !filters.nearMe ||
        (myCoords != null &&
          a.latitude != null &&
          a.longitude != null &&
          distanceKm(myCoords.latitude, myCoords.longitude, a.latitude, a.longitude) <= NEAR_ME_RADIUS_KM);
      return (
        matchesSearch &&
        matchesCategory &&
        matchesRegion &&
        matchesDifficulty &&
        matchesSocial &&
        matchesPace &&
        matchesIntensity &&
        matchesTransport &&
        matchesAudience &&
        matchesWhen &&
        matchesPrice &&
        matchesNearMe
      );
    });
    if (filters.nearMe && myCoords) {
      list.sort((a, b) => {
        const da = a.latitude != null && a.longitude != null ? distanceKm(myCoords.latitude, myCoords.longitude, a.latitude, a.longitude) : Infinity;
        const db = b.latitude != null && b.longitude != null ? distanceKm(myCoords.latitude, myCoords.longitude, b.latitude, b.longitude) : Infinity;
        return da - db;
      });
    }
    return list;
  }, [adventures, search, categoryFilter, filters, myCoords]);

  useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const selected = filtered.find((a) => a.id === selectedId) ?? filtered[0];
  const activeCount = countActiveFilters(filters);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (filters.nearMe) chips.push({ key: 'nearMe', label: 'Near me', onRemove: () => setFilters((f) => ({ ...f, nearMe: false })) });
    if (filters.when !== 'Any time') chips.push({ key: 'when', label: filters.when, onRemove: () => setFilters((f) => ({ ...f, when: 'Any time' })) });
    if (filters.difficulty !== 'Any')
      chips.push({ key: 'difficulty', label: filters.difficulty, onRemove: () => setFilters((f) => ({ ...f, difficulty: 'Any' })) });
    if (filters.region !== 'Any')
      chips.push({ key: 'region', label: `Near ${filters.region}`, onRemove: () => setFilters((f) => ({ ...f, region: 'Any' })) });
    if (filters.socialLevel !== 'Any')
      chips.push({ key: 'social', label: filters.socialLevel, onRemove: () => setFilters((f) => ({ ...f, socialLevel: 'Any' })) });
    if (filters.pace !== 'Any') chips.push({ key: 'pace', label: filters.pace, onRemove: () => setFilters((f) => ({ ...f, pace: 'Any' })) });
    if (filters.intensity !== 'Any')
      chips.push({ key: 'intensity', label: filters.intensity, onRemove: () => setFilters((f) => ({ ...f, intensity: 'Any' })) });
    if (filters.transport !== 'Any')
      chips.push({ key: 'transport', label: filters.transport, onRemove: () => setFilters((f) => ({ ...f, transport: 'Any' })) });
    if (filters.price !== 'Any') chips.push({ key: 'price', label: filters.price, onRemove: () => setFilters((f) => ({ ...f, price: 'Any' })) });
    filters.audience.forEach((aud) =>
      chips.push({ key: `aud-${aud}`, label: aud, onRemove: () => setFilters((f) => ({ ...f, audience: f.audience.filter((x) => x !== aud) })) })
    );
    return chips;
  }, [filters]);

  const openAdventure = (a: Adventure) => {
    if (a.organizerId === myId) {
      router.push(`/organizer/${a.id}`);
    } else {
      router.push(`/adventure/${a.id}`);
    }
  };

  const handleToggleLike = (id: string) => {
    if (!authenticated) {
      router.push('/auth');
      return;
    }
    toggleLike(id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Find your next adventure</Text>
          <Text style={styles.subheading}>Explore experiences and people worth meeting.</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push('/notifications')} hitSlop={8} style={styles.bellButton} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            {hasUnreadNotifications && <View style={styles.bellDot} />}
          </Pressable>
          <Pressable onPress={load} hitSlop={8} accessibilityLabel="Refresh" disabled={status === 'loading'}>
            <Ionicons name="refresh" size={20} color={status === 'loading' ? colors.textMuted : colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => setView(view === 'list' ? 'map' : 'list')} style={styles.viewToggle}>
            <Text style={styles.viewToggleLabel}>{view === 'list' ? 'Map' : 'List'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search adventures, places or experiences"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryRow}>
        {CATEGORY_FILTERS.map((f) => (
          <Pressable key={f} onPress={() => setCategoryFilter(f)} style={[styles.chip, categoryFilter === f && styles.chipActive]}>
            <Text style={[styles.chipLabel, categoryFilter === f && styles.chipLabelActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.filterBarRow}>
        <Pressable onPress={() => setSheetOpen(true)} style={styles.filterButton} accessibilityLabel="Filters">
          <Ionicons name="options-outline" size={16} color={colors.textPrimary} />
          <Text style={styles.filterButtonLabel}>Filters{activeCount > 0 ? ` · ${activeCount}` : ''}</Text>
        </Pressable>
        {activeChips.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.activeChipsScroll}
            contentContainerStyle={styles.activeChipsRow}>
            {activeChips.map((chip) => (
              <Pressable key={chip.key} onPress={chip.onRemove} style={styles.activeChip}>
                <Text style={styles.activeChipLabel}>{chip.label}</Text>
                <Ionicons name="close" size={13} color={colors.primary} />
              </Pressable>
            ))}
          </ScrollView>
        )}
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

      {status === 'ready' && view === 'list' && filtered.length === 0 && adventures.length === 0 && (
        <EmptyState icon="compass-outline" title="No adventures yet" message="Be the first — create one from the Create tab." />
      )}

      {status === 'ready' && view === 'list' && filtered.length === 0 && adventures.length > 0 && (
        <EmptyState icon="search-outline" title="No adventures found" message="Try another search or adjust your filters." />
      )}

      {status === 'ready' && view === 'list' && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.textSecondary} />}
          renderItem={({ item }) => (
            <View style={{ marginBottom: spacing.lg }}>
              <AdventureCard adventure={item} onPress={() => openAdventure(item)} onToggleLike={() => handleToggleLike(item.id)} />
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
              <EmptyState icon="search-outline" title="No adventures found" message="Try another search or adjust your filters." />
            </View>
          )}
        </View>
      )}

      <FilterSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        onRequestNearMe={handleRequestNearMe}
        nearMeLoading={nearMeLoading}
        nearMeError={nearMeError}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  heading: { ...type.screenHeading },
  subheading: { ...type.secondary, color: colors.textSecondary, marginTop: spacing.xs, maxWidth: 240 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.xs },
  bellButton: { position: 'relative' },
  bellDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
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
    marginTop: spacing.lg,
    height: 50,
  },
  searchInput: { flex: 1, ...type.input, color: colors.textPrimary },
  // Explicit height on the ScrollView itself (not just contentContainerStyle):
  // on web, an `overflow` value other than visible makes a flex item's
  // automatic minimum size resolve to 0 instead of its content size, so a
  // horizontal ScrollView with no fixed height can collapse to a sliver
  // once its content genuinely needs to scroll (RN Web + CSS flexbox
  // interaction, not an RN bug) — pin the height to sidestep it.
  categoryScroll: { height: 44, marginTop: spacing.md, flexGrow: 0, flexShrink: 0 },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  filterBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonLabel: { ...type.chip, color: colors.textPrimary },
  activeChipsScroll: { height: 40, flexGrow: 0, flexShrink: 0 },
  activeChipsRow: { flexDirection: 'row', gap: spacing.sm },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySurface,
  },
  activeChipLabel: { ...type.chip, color: colors.primary },
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
    backgroundColor: colors.primarySurface,
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
